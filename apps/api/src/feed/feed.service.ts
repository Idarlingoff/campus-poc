import { FeedRepo } from './feed.repo';
import { FeedResponse, FeedFilter } from './feed.types';

export class FeedService {
    constructor(private repo: FeedRepo) {}

    async getFeed(query: any, viewer: { isAuthenticated: boolean; userId?: string; filter: FeedFilter | null }): Promise<FeedResponse> {
        const limit = Math.min(Math.max(query.limit || 20, 1), 50);

        // campus/ville user
        let userCampusId: string | null = null;
        let userCity: string | null = null;

        if (viewer.isAuthenticated && viewer.userId) {
            const u = await this.repo.getUserCampus(viewer.userId);
            userCampusId = u.campusId;
            userCity = u.city;
        }
        const effectiveCity = userCity ?? 'Paris';

        // Déterminer le mode de visibilité selon le contexte
        let visibilityMode: 'PUBLIC_ONLY' | 'MY_CAMPUS' | 'ALL_CAMPUSES' | 'FOLLOWING' = 'PUBLIC_ONLY';
        let followedUserIds: string[] = [];

        if (!viewer.isAuthenticated) {
            // Déconnecté : uniquement PUBLIC
            visibilityMode = 'PUBLIC_ONLY';
        } else {
            // Connecté : toujours récupérer les abonnements (pour les publications PRIVATE)
            followedUserIds = viewer.userId ? await this.repo.getFollowedUserIds(viewer.userId) : [];

            // Utiliser le filtre choisi (défaut: public)
            const filter = viewer.filter ?? 'public';

            switch (filter) {
                case 'following':
                    visibilityMode = 'FOLLOWING';
                    break;
                case 'my_campus':
                    visibilityMode = 'MY_CAMPUS';
                    break;
                case 'all_campuses':
                    visibilityMode = 'ALL_CAMPUSES';
                    break;
                case 'public':
                default:
                    visibilityMode = 'PUBLIC_ONLY';
                    break;
            }
        }

        const slice = {
            institutional: Math.min(5, Math.ceil(limit * 0.25)),
            publications: Math.min(10, Math.ceil(limit * 0.5)),
            city: Math.min(5, Math.ceil(limit * 0.25)),
        };

        const [inst, pubs, city] = await Promise.all([
            this.repo.listInstitutionalNews({ limit: slice.institutional }),
            this.repo.listMemberPublications({
                limit: slice.publications,
                includeEvents: query.includeEvents ?? true,
                campusIds: query.campusIds,
                themeIds: query.themeIds,
                visibilityMode,
                userId: viewer.userId,
                userCampusId,
                followedUserIds,
            }),
            this.repo.listCityNews({ city: effectiveCity, limit: slice.city }),
        ]);

        // institutional -> NewsItem
        const institutionalNews = inst.map((n: any) => ({
            id: n.id,
            title: n.title,
            summary: n.excerpt ?? null,
            imageUrl: null,                 // si tu ne l’as pas en DB, laisse null
            category: null,                 // idem
            publishedAt: new Date(n.publishedAt).toISOString(),
            isImportant: !!(n.is_featured ?? n.isFeatured),
        }));

        // member publications -> PostItem
        const memberPosts = pubs.map((p: any) => ({
            id: p.id,
            author: {
                id: p.authorId,
                displayName: p.authorDisplayName,
                avatarUrl: null,              // brancher quand tu as un champ avatar
                isFollowed: false,            // à brancher via user_follows si connecté
            },
            content: extractTextFromHtml(p.content_html),
            imageUrl: extractFirstImageFromHtml(p.content_html),
            likesCount: 0,
            commentsCount: 0,
            publishedAt: new Date(p.publishedAt).toISOString(),
            isLiked: false,
        }));

        // city -> CityNewsItem
        const cityNews = city.map((n: any) => ({
            id: n.id,
            title: n.title,
            summary: n.excerpt ?? null,
            source: null,
            city: n.city,
            publishedAt: new Date(n.publishedAt).toISOString(),
            category: null,
            imageUrl: null,
            url: n.url ?? null,
        }));

        return { institutionalNews, memberPosts, cityNews };
    }
}

function extractTextFromHtml(html: string | null): string {
    if (!html) return "";
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .trim();
}

function extractFirstImageFromHtml(html: string | null): string | null {
    if (!html) return null;
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m?.[1] ?? null;
}