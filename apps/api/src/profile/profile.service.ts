import { query } from "../db";

type ProfilePatch = {
    bio?: string;
    city?: string;
    schoolLine?: string;
    sinceDate?: string;
    avatarText?: string;
};

function roleLabel(roles: string[]) {
    if (roles.includes("student")) return "Étudiant · MediaSchool";
    if (roles.includes("staff")) return "Intervenant / Équipe pédagogique";
    if (roles.includes("bde")) return "BDE";
    return "Externe";
}

export async function getMyProfile(userId: string) {
    const users = await query<{
        id: string; email: string; display_name: string;
    }>(
        `select id, email, display_name from users where id = $1`,
        [userId]
    );
    const u = users[0];
    if (!u) throw new Error("User not found");

    const profRows = await query<{
        bio: string | null;
        city: string | null;
        school_line: string | null;
        since_date: string | null;
        avatar_text: string | null;
    }>(
        `select bio, city, school_line, since_date, avatar_text
     from user_profile where user_id = $1`,
        [userId]
    );
    const p = profRows[0] ?? null;

    const roles = await query<{ code: string }>(
        `select r.code
     from user_roles ur
     join roles r on r.id = ur.role_id
     where ur.user_id = $1`,
        [userId]
    );
    const roleCodes = roles.map(r => r.code);

    const statsRows = await query<{
        points_total: number;
        ranking: number;
    }>(
        `
    with totals as (
      select user_id, coalesce(sum(delta), 0)::int as points_total
      from user_points_ledger
      group by user_id
    ),
    ranked as (
      select user_id, points_total,
             dense_rank() over(order by points_total desc) as ranking
      from totals
    )
    select
      coalesce(r.points_total, 0)::int as points_total,
      coalesce(r.ranking, 0)::int as ranking
    from ranked r
    where r.user_id = $1
    `,
        [userId]
    );

    const pointsTotal = statsRows[0]?.points_total ?? 0;
    const ranking = statsRows[0]?.ranking ?? 0;

    const challengesDone = 0;

    const badgeRows = await query<{
        title: string;
        description: string;
        icon: string;
        unlocked: boolean;
    }>(
        `
    select b.title, b.description, b.icon,
           (ub.user_id is not null) as unlocked
    from badges b
    left join user_badges ub
      on ub.badge_id = b.id and ub.user_id = $1
    order by b.title asc
    `,
        [userId]
    );

    const activityRows = await query<{
        icon: string | null;
        title: string;
        meta: string | null;
        points: number | null;
        created_at: string;
    }>(
        `
    select icon, title, meta, points, created_at
    from user_activity
    where user_id = $1
    order by created_at desc
    limit 20
    `,
        [userId]
    );

    const levelMax = 1000;
    const remaining = Math.max(0, levelMax - pointsTotal);
    const hint = remaining > 0
        ? `Encore ${remaining} points pour passer au niveau supérieur 🎯`
        : "Niveau max atteint 🎉";

    return {
        identity: {
            id: u.id,
            email: u.email,
            displayName: u.display_name,
            bio: p?.bio ?? "",
            city: p?.city ?? "",
            schoolLine: p?.school_line ?? roleLabel(roleCodes),
            sinceDate: p?.since_date,
            avatarText: p?.avatar_text ?? "",
            roles: roleCodes,
        },
        stats: {
            pointsTotal,
            challengesDone,
            ranking: ranking === 0 ? null : ranking,
        },
        progression: {
            current: pointsTotal,
            max: levelMax,
            hint,
        },
        badges: badgeRows.map(b => ({
            title: b.title,
            description: b.description,
            icon: b.icon,
            unlocked: b.unlocked,
        })),
        recentActivity: activityRows.map(a => ({
            icon: a.icon ?? "◎",
            title: a.title,
            meta: a.meta ?? "",
            points: a.points ?? undefined,
            createdAt: a.created_at,
        })),
    };
}

export async function patchMyProfile(userId: string, patch: ProfilePatch) {
    const bio = patch.bio ?? null;
    const city = patch.city ?? null;
    const schoolLine = patch.schoolLine ?? null;
    const sinceDate = patch.sinceDate ?? null;
    const avatarText = patch.avatarText ?? null;

    await query(
        `
    insert into user_profile(user_id, bio, city, school_line, since_date, avatar_text)
    values ($1, $2, $3, $4, $5, $6)
    on conflict (user_id) do update set
      bio = coalesce(excluded.bio, user_profile.bio),
      city = coalesce(excluded.city, user_profile.city),
      school_line = coalesce(excluded.school_line, user_profile.school_line),
      since_date = coalesce(excluded.since_date, user_profile.since_date),
      avatar_text = coalesce(excluded.avatar_text, user_profile.avatar_text),
      updated_at = now()
    `,
        [userId, bio, city, schoolLine, sinceDate, avatarText]
    );

    return await getMyProfile(userId);
}
