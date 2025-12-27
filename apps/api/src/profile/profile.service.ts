import { query } from "../db";

type LastNameVisibility = "FULL" | "INITIAL" | "HIDDEN";
type ProfileVisibility = "CAMPUS" | "PRIVATE";

type ProfilePatch = {
    // users
    displayName?: string;

    // identity (user_profile)
    firstName?: string;
    lastName?: string;
    lastNameVisibility?: LastNameVisibility;

    birthDate?: string | null; // YYYY-MM-DD
    showEmail?: boolean;
    showBirthDate?: boolean;
    showAge?: boolean;

    profileVisibility?: ProfileVisibility;

    // socials
    showSocials?: boolean;
    instagramHandle?: string;
    linkedinUrl?: string;
    websiteUrl?: string;

    // campus / misc
    bio?: string;
    city?: string;
    schoolLine?: string;
    sinceDate?: string;

    // avatar
    avatarText?: string;
    avatarUrl?: string | null;
};

function roleLabel(roles: string[]) {
    if (roles.includes("student")) return "Étudiant · MediaSchool";
    if (roles.includes("staff")) return "Intervenant / Équipe pédagogique";
    if (roles.includes("bde")) return "BDE";
    return "Externe";
}

function isValidSinceDate(v: string) {
    return /^(\d{4})-(\d{2})(-(\d{2}))?$/.test(v);
}

function isValidBirthDate(v: string) {
    return /^(\d{4})-(\d{2})-(\d{2})$/.test(v);
}

function computeAge(birthDate: string | null): number | null {
    if (!birthDate) return null;
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime())) return null;

    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    if (age < 0 || age > 120) return null;
    return age;
}

export async function getMyProfile(userId: string) {
    const users = await query<{ id: string; email: string; display_name: string }>(
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
        avatar_url: string | null;

        first_name: string | null;
        last_name: string | null;
        birth_date: string | null;

        show_email: boolean;
        show_birth_date: boolean;
        show_age: boolean;

        last_name_visibility: LastNameVisibility;
        profile_visibility: ProfileVisibility;

        instagram_handle: string | null;
        linkedin_url: string | null;
        website_url: string | null;
        show_socials: boolean;
    }>(
        `
    select
      bio, city, school_line, since_date,
      avatar_text, avatar_url,
      first_name, last_name, birth_date,
      show_email, show_birth_date, show_age,
      last_name_visibility, profile_visibility,
      instagram_handle, linkedin_url, website_url, show_socials
    from user_profile
    where user_id = $1
    `,
        [userId]
    );
    const p = profRows[0] ?? null;

    const roles = await query<{ code: string }>(
        `
    select r.code
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = $1
    `,
        [userId]
    );
    const roleCodes = roles.map((r) => r.code);

    const statsRows = await query<{ points_total: number; ranking: number }>(
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

    const badgeRows = await query<{ title: string; description: string; icon: string; unlocked: boolean }>(
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
    const hint = remaining > 0 ? `Encore ${remaining} points pour passer au niveau supérieur 🎯` : "Niveau max atteint 🎉";

    const age = computeAge(p?.birth_date ?? null);

    return {
        identity: {
            id: u.id,
            email: u.email,
            displayName: u.display_name,

            firstName: p?.first_name ?? "",
            lastName: p?.last_name ?? "",
            lastNameVisibility: p?.last_name_visibility ?? "FULL",

            bio: p?.bio ?? "",
            city: p?.city ?? "",
            schoolLine: p?.school_line ?? roleLabel(roleCodes),
            sinceDate: p?.since_date ?? null,

            avatarText: p?.avatar_text ?? "",
            avatarUrl: p?.avatar_url ?? null,

            birthDate: p?.birth_date ?? null,
            age,

            showEmail: p?.show_email ?? false,
            showBirthDate: p?.show_birth_date ?? false,
            showAge: p?.show_age ?? false,

            profileVisibility: p?.profile_visibility ?? "CAMPUS",

            socials: {
                show: p?.show_socials ?? true,
                instagramHandle: p?.instagram_handle ?? "",
                linkedinUrl: p?.linkedin_url ?? "",
                websiteUrl: p?.website_url ?? "",
            },

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

        badges: badgeRows.map((b) => ({
            title: b.title,
            description: b.description,
            icon: b.icon,
            unlocked: b.unlocked,
        })),

        recentActivity: activityRows.map((a) => ({
            icon: a.icon ?? "◎",
            title: a.title,
            meta: a.meta ?? "",
            points: a.points ?? undefined,
            createdAt: a.created_at,
        })),
    };
}

export async function patchMyProfile(userId: string, patch: ProfilePatch) {
    // ---- normalize ----
    const dn = patch.displayName !== undefined ? String(patch.displayName).trim() : undefined;

    const firstName = patch.firstName !== undefined ? String(patch.firstName).trim() : undefined;
    const lastName = patch.lastName !== undefined ? String(patch.lastName).trim() : undefined;
    const lastNameVisibility = patch.lastNameVisibility;

    const bio = patch.bio !== undefined ? String(patch.bio) : undefined;
    const city = patch.city !== undefined ? String(patch.city).trim() : undefined;
    const schoolLine = patch.schoolLine !== undefined ? String(patch.schoolLine).trim() : undefined;
    const sinceDate = patch.sinceDate !== undefined ? String(patch.sinceDate).trim() : undefined;

    const avatarText = patch.avatarText !== undefined ? String(patch.avatarText).trim() : undefined;
    const avatarUrl = patch.avatarUrl !== undefined ? (patch.avatarUrl ? String(patch.avatarUrl) : null) : undefined;

    const birthDate = patch.birthDate !== undefined ? (patch.birthDate ? String(patch.birthDate).trim() : "") : undefined;

    const showEmail = patch.showEmail;
    const showBirthDate = patch.showBirthDate;
    const showAge = patch.showAge;

    const profileVisibility = patch.profileVisibility;

    const showSocials = patch.showSocials;
    const instagramHandle = patch.instagramHandle !== undefined ? String(patch.instagramHandle).trim() : undefined;
    const linkedinUrl = patch.linkedinUrl !== undefined ? String(patch.linkedinUrl).trim() : undefined;
    const websiteUrl = patch.websiteUrl !== undefined ? String(patch.websiteUrl).trim() : undefined;

    // ---- validations (align with front) ----
    if (dn !== undefined) {
        if (dn.length < 2) throw new Error("displayName too short");
        if (dn.length > 40) throw new Error("displayName too long");
    }

    if (firstName !== undefined && firstName.length > 40) throw new Error("firstName too long");
    if (lastName !== undefined && lastName.length > 40) throw new Error("lastName too long");

    if (bio !== undefined && bio.length > 280) throw new Error("bio too long");
    if (city !== undefined && city.length > 60) throw new Error("city too long");
    if (schoolLine !== undefined && schoolLine.length > 80) throw new Error("schoolLine too long");

    if (sinceDate !== undefined && sinceDate !== "" && !isValidSinceDate(sinceDate)) throw new Error("sinceDate invalid");

    if (avatarText !== undefined && avatarText !== "" && avatarText.length > 3) throw new Error("avatarText too long");

    if (birthDate !== undefined && birthDate !== "" && !isValidBirthDate(birthDate)) throw new Error("birthDate invalid");

    if (instagramHandle !== undefined && instagramHandle.length > 50) throw new Error("instagramHandle too long");
    if (linkedinUrl !== undefined && linkedinUrl.length > 200) throw new Error("linkedinUrl too long");
    if (websiteUrl !== undefined && websiteUrl.length > 200) throw new Error("websiteUrl too long");

    if (lastNameVisibility !== undefined && !["FULL", "INITIAL", "HIDDEN"].includes(lastNameVisibility))
        throw new Error("lastNameVisibility invalid");

    if (profileVisibility !== undefined && !["CAMPUS", "PRIVATE"].includes(profileVisibility))
        throw new Error("profileVisibility invalid");

    // ---- update users ----
    if (dn !== undefined) {
        await query(`update users set display_name=$2, updated_at=now() where id=$1`, [userId, dn]);
    }

    // ---- upsert user_profile (all fields) ----
    const hasAnyProfileField =
        firstName !== undefined ||
        lastName !== undefined ||
        lastNameVisibility !== undefined ||
        bio !== undefined ||
        city !== undefined ||
        schoolLine !== undefined ||
        sinceDate !== undefined ||
        avatarText !== undefined ||
        avatarUrl !== undefined ||
        birthDate !== undefined ||
        showEmail !== undefined ||
        showBirthDate !== undefined ||
        showAge !== undefined ||
        profileVisibility !== undefined ||
        showSocials !== undefined ||
        instagramHandle !== undefined ||
        linkedinUrl !== undefined ||
        websiteUrl !== undefined;

    if (hasAnyProfileField) {
        // convention: "" => NULL (efface)
        const birthDateDb = birthDate === undefined ? null : (birthDate === "" ? null : birthDate);

        await query(
            `
      insert into user_profile(
        user_id,
        first_name, last_name, last_name_visibility,
        bio, city, school_line, since_date,
        avatar_text, avatar_url,
        birth_date,
        show_email, show_birth_date, show_age,
        profile_visibility,
        show_socials, instagram_handle, linkedin_url, website_url
      )
      values (
        $1,
        $2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,
        $11,
        $12,$13,$14,
        $15,
        $16,$17,$18,$19
      )
      on conflict (user_id) do update set
        first_name = case when $2 is not null then $2 else user_profile.first_name end,
        last_name = case when $3 is not null then $3 else user_profile.last_name end,
        last_name_visibility = case when $26 = true then $4 else user_profile.last_name_visibility end,

        bio = case when $5 is not null then $5 else user_profile.bio end,
        city = case when $6 is not null then $6 else user_profile.city end,
        school_line = case when $7 is not null then $7 else user_profile.school_line end,
        since_date = case when $8 is not null then $8 else user_profile.since_date end,

        avatar_text = case when $9 is not null then $9 else user_profile.avatar_text end,
        avatar_url = case when $10 is not null then $10 else user_profile.avatar_url end,

        birth_date = case when $20 = true then $11 else user_profile.birth_date end,

        show_email = case when $21 = true then $12 else user_profile.show_email end,
        show_birth_date = case when $22 = true then $13 else user_profile.show_birth_date end,
        show_age = case when $23 = true then $14 else user_profile.show_age end,

        profile_visibility = case when $24 = true then $15 else user_profile.profile_visibility end,

        show_socials = case when $25 = true then $16 else user_profile.show_socials end,
        instagram_handle = case when $17 is not null then $17 else user_profile.instagram_handle end,
        linkedin_url = case when $18 is not null then $18 else user_profile.linkedin_url end,
        website_url = case when $19 is not null then $19 else user_profile.website_url end,

        updated_at = now()
      `,
            [
                userId,

                emptyToNull(firstName),
                emptyToNull(lastName),
                lastNameVisibility ?? null,

                emptyToNull(bio),
                emptyToNull(city),
                emptyToNull(schoolLine),
                emptyToNull(sinceDate),

                emptyToNull(avatarText),
                avatarUrl === undefined ? null : avatarUrl, // null allowed for removing image

                birthDateDb,

                showEmail ?? null,
                showBirthDate ?? null,
                showAge ?? null,

                profileVisibility ?? null,

                showSocials ?? null,
                emptyToNull(instagramHandle),
                emptyToNull(linkedinUrl),
                emptyToNull(websiteUrl),

                // Flags to indicate if the field was provided
                birthDate !== undefined,           // $20
                showEmail !== undefined,           // $21
                showBirthDate !== undefined,       // $22
                showAge !== undefined,             // $23
                profileVisibility !== undefined,   // $24
                showSocials !== undefined,         // $25
                lastNameVisibility !== undefined,  // $26
            ]
        );
    }

    return await getMyProfile(userId);
}

function emptyToNull(v: string | undefined) {
    if (v === undefined) return null;
    const s = String(v);
    return s.trim() === "" ? null : s;
}

export async function setMyAvatarUrl(userId: string, avatarUrl: string | null) {
    await query(
        `
    insert into user_profile(user_id, avatar_url)
    values($1, $2)
    on conflict (user_id) do update set
      avatar_url = excluded.avatar_url,
      updated_at = now()
    `,
        [userId, avatarUrl]
    );

    return await getMyProfile(userId);
}