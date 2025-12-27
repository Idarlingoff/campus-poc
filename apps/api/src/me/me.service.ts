import { query } from "../db";

export type MeResponse = {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
    permissions: string[];
};

export async function getMe(userId: string): Promise<MeResponse> {
    const rows = await query<{
        id: string;
        email: string;
        display_name: string;
        roles: string[] | null;
        permissions: string[] | null;
    }>(
        `
    select
      u.id,
      u.email,
      u.display_name,
      coalesce(array_agg(distinct r.code) filter (where r.code is not null), '{}') as roles,
      coalesce(array_agg(distinct p.key) filter (where p.key is not null), '{}') as permissions
    from users u
    left join user_roles ur on ur.user_id = u.id
    left join roles r on r.id = ur.role_id
    left join role_permissions rp on rp.role_id = r.id
    left join permissions p on p.id = rp.permission_id
    where u.id = $1
    group by u.id
    `,
        [userId]
    );

    const me = rows[0];
    if (!me) throw new Error("User not found");

    return {
        id: me.id,
        email: me.email,
        displayName: me.display_name,
        roles: me.roles ?? [],
        permissions: me.permissions ?? [],
    };
}