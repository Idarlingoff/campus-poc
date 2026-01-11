import { Pool } from 'pg';

export class FeedRepo {
  constructor(private db: Pool) {}

  async getUserCampus(
    userId: string,
  ): Promise<{ campusId: string | null; city: string | null }> {
    const q = `
      SELECT u.campus_id as "campusId", c.city as "city"
      FROM users u
      LEFT JOIN campuses c ON c.id = u.campus_id
      WHERE u.id = $1
      LIMIT 1
    `;
    const { rows } = await this.db.query(q, [userId]);
    return rows[0] ?? { campusId: null, city: null };
  }

  async getFollowedUserIds(userId: string): Promise<string[]> {
    const q = `SELECT followed_user_id FROM user_follows WHERE follower_user_id = $1`;
    const { rows } = await this.db.query(q, [userId]);
    return rows.map((r) => r.followed_user_id);
  }

  async listInstitutionalNews(params: {
    limit: number;
    cursor?: { publishedAtIso: string; id: string };
  }) {
    const values: any[] = [params.limit];
    let where = '';
    if (params.cursor) {
      values.push(params.cursor.publishedAtIso, params.cursor.id);
      where = `WHERE (published_at, id) < ($2::timestamptz, $3::uuid)`;
    }

    const q = `
      SELECT id, title, excerpt, content_html, is_featured,
             published_at as "publishedAt", updated_at as "updatedAt"
      FROM institutional_news
      ${where}
      ORDER BY is_featured DESC, published_at DESC, id DESC
      LIMIT $1
    `;
    const { rows } = await this.db.query(q, values);
    return rows;
  }

  async listCityNews(params: {
    city: string;
    limit: number;
    cursor?: { publishedAtIso: string; id: string };
  }) {
    const values: any[] = [params.city, params.limit];
    let where = `WHERE city = $1`;
    if (params.cursor) {
      values.push(params.cursor.publishedAtIso, params.cursor.id);
      where += ` AND (published_at, id) < ($3::timestamptz, $4::uuid)`;
    }
    const q = `
      SELECT id, city, title, excerpt, url,
             published_at as "publishedAt", updated_at as "updatedAt"
      FROM city_news
      ${where}
      ORDER BY published_at DESC, id DESC
      LIMIT $2
    `;
    const { rows } = await this.db.query(q, values);
    return rows;
  }

  async listChallenges(params: {
    limit: number;
    cursor?: { publishedAtIso: string; id: string };
  }) {
    const values: any[] = [params.limit];
    let where = '';
    if (params.cursor) {
      values.push(params.cursor.publishedAtIso, params.cursor.id);
      where = `WHERE (created_at, id) < ($2::timestamptz, $3::uuid)`;
    }
    const q = `
      SELECT id, title, description,
             created_at as "publishedAt", updated_at as "updatedAt"
      FROM challenges
      ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `;
    const { rows } = await this.db.query(q, values);
    return rows;
  }

  async listMemberPublications(params: {
    limit: number;
    includeEvents: boolean;
    campusIds?: string[];
    themeIds?: string[];
    visibilityMode: 'PUBLIC_ONLY' | 'MY_CAMPUS' | 'ALL_CAMPUSES' | 'FOLLOWING';
    userId?: string;
    cursor?: { publishedAtIso: string; id: string };
    followedUserIds?: string[];
    userCampusId?: string | null;
  }) {
    const values: any[] = [];
    const wheres: string[] = [];

    if (params.cursor) {
      values.push(params.cursor.publishedAtIso, params.cursor.id);
      wheres.push(
        `(p.published_at, p.id) < ($${values.length - 1}::timestamptz, $${values.length}::uuid)`,
      );
    }

    if (!params.includeEvents) {
      wheres.push(`p.type <> 'EVENT'`);
    }

    const followedIds = params.followedUserIds ?? [];
    const currentUserId = params.userId;

    switch (params.visibilityMode) {
      case 'PUBLIC_ONLY':
        if (currentUserId) {
          values.push(currentUserId);
          wheres.push(
            `(p.visibility = 'PUBLIC' OR p.author_user_id = $${values.length}::uuid)`,
          );
        } else {
          wheres.push(`p.visibility = 'PUBLIC'`);
        }
        break;

      case 'MY_CAMPUS':
        if (params.userCampusId) {
          values.push(params.userCampusId);
          const campusIdx = values.length;

          if (currentUserId) {
            values.push(currentUserId);
            wheres.push(
              `(p.visibility = 'PUBLIC' OR (p.visibility = 'CAMPUS_ONLY' AND p.campus_id = $${campusIdx}::uuid) OR p.author_user_id = $${values.length}::uuid)`,
            );
          } else {
            wheres.push(
              `(p.visibility = 'PUBLIC' OR (p.visibility = 'CAMPUS_ONLY' AND p.campus_id = $${campusIdx}::uuid))`,
            );
          }
        } else {
          if (currentUserId) {
            values.push(currentUserId);
            wheres.push(
              `(p.visibility = 'PUBLIC' OR p.author_user_id = $${values.length}::uuid)`,
            );
          } else {
            wheres.push(`p.visibility = 'PUBLIC'`);
          }
        }
        break;

      case 'ALL_CAMPUSES':
        if (currentUserId) {
          values.push(currentUserId);
          wheres.push(
            `(p.visibility IN ('PUBLIC', 'CAMPUS_ONLY') OR p.author_user_id = $${values.length}::uuid)`,
          );
        } else {
          wheres.push(`p.visibility IN ('PUBLIC', 'CAMPUS_ONLY')`);
        }
        break;

      case 'FOLLOWING':
        if (currentUserId) {
          if (followedIds.length === 0) {
            values.push(currentUserId);
            wheres.push(`p.author_user_id = $${values.length}::uuid`);
          } else {
            values.push([...followedIds, currentUserId]);
            wheres.push(`p.author_user_id = ANY($${values.length}::uuid[])`);
          }
        } else {
          wheres.push(`1 = 0`);
        }
        break;
    }

    if (params.campusIds && params.campusIds.length > 0) {
      values.push(params.campusIds);
      wheres.push(`p.campus_id = ANY($${values.length}::uuid[])`);
    }
    if (params.themeIds && params.themeIds.length > 0) {
      values.push(params.themeIds);
      wheres.push(`p.theme_id = ANY($${values.length}::uuid[])`);
    }

    const whereSql = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';

    values.push(params.limit);

    const q = `
      SELECT
        p.id,
        p.type,
        p.title,
        p.content_html,
        p.visibility,
        p.event_start_at as "eventStartAt",
        p.event_end_at as "eventEndAt",
        p.published_at as "publishedAt",
        p.updated_at as "updatedAt",

        u.id as "authorId",
        COALESCE(u.display_name, u.email) as "authorDisplayName",

        c.id as "campusId",
        c.name as "campusName",
        c.city as "campusCity",

        t.id as "themeId",
        t.label as "themeLabel",
        t.slug as "themeSlug"
      FROM publications p
      JOIN users u ON u.id = p.author_user_id
      LEFT JOIN campuses c ON c.id = p.campus_id
      LEFT JOIN themes t ON t.id = p.theme_id
      ${whereSql}
      ORDER BY p.published_at DESC, p.id DESC
      LIMIT $${values.length}
    `;
    const { rows } = await this.db.query(q, values);
    return rows;
  }
}
