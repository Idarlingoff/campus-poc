import { query } from '../db';

export async function searchUsers(meId: string, q: string) {
  const like = `%${q.toLowerCase()}%`;


  const rows = await query<{
    id: string;
    display_name: string;
    avatar_url: string | null;
    avatar_text: string | null;
    first_name: string | null;
    last_name: string | null;
    last_name_visibility: 'FULL' | 'INITIAL' | 'HIDDEN' | null;
    profile_visibility: 'CAMPUS' | 'PRIVATE' | null;
    city: string | null;
    school_line: string | null;
  }>(
    `
    select
      u.id,
      u.display_name,
      p.avatar_url,
      p.avatar_text,
      p.first_name,
      p.last_name,
      p.last_name_visibility,
      p.profile_visibility,
      p.city,
      p.school_line
    from users u
    left join user_profile p on p.user_id = u.id
    where u.id <> $1
      and (p.profile_visibility is null or p.profile_visibility = 'CAMPUS')
      and (
        lower(u.display_name) like $2
        or lower(coalesce(p.first_name,'')) like $2
        or lower(coalesce(p.last_name,'')) like $2
        or lower(coalesce(p.city,'')) like $2
        or lower(coalesce(p.school_line,'')) like $2
      )
    order by u.display_name asc
    limit 20
    `,
    [meId, like],
  );

  return rows.map((r) => ({
    id: r.id,
    displayName: r.display_name,
    publicName: buildPublicName(
      r.display_name,
      r.first_name,
      r.last_name,
      r.last_name_visibility,
    ),
    avatarUrl: r.avatar_url,
    avatarText: r.avatar_text,
    city: r.city ?? '',
    schoolLine: r.school_line ?? '',
  }));
}

function buildPublicName(
  displayName: string,
  fn?: string | null,
  ln?: string | null,
  vis?: any,
) {
  const firstName = (fn ?? '').trim();
  const lastName = (ln ?? '').trim();

  if (!firstName && !lastName) return displayName;

  if (vis === 'HIDDEN') return firstName || displayName;
  if (vis === 'INITIAL')
    return lastName
      ? `${firstName} ${lastName[0].toUpperCase()}.`.trim()
      : firstName || displayName;
  return `${firstName} ${lastName}`.trim();
}
