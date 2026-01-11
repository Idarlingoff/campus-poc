import bcrypt from 'bcrypt';
import { query } from '../db';

type DbUser = {
  id: string;
  email: string;
  display_name: string;
  password_hash: string | null;
};

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await query<DbUser>(
    `select id, email, display_name, password_hash
     from users
     where email = $1
     limit 1`,
    [email.toLowerCase().trim()],
  );
  return rows[0] ?? null;
}

export async function createUser(params: {
  email: string;
  password: string;
  displayName: string;
  roleCode: string;
  campusId?: string | null;
}): Promise<{ id: string; email: string; displayName: string }> {
  const email = params.email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(params.password, 12);

  const created = await query<{
    id: string;
    email: string;
    display_name: string;
  }>(
    `insert into users (email, password_hash, display_name, campus_id)
     values ($1, $2, $3, $4)
     returning id, email, display_name`,
    [email, passwordHash, params.displayName, params.campusId ?? null],
  );

  const user = created[0];
  if (!user) throw new Error('User creation failed');

  const role = await query<{ id: string }>(
    `select id from roles where code = $1 limit 1`,
    [params.roleCode],
  );
  if (!role[0]) throw new Error(`Role not found: ${params.roleCode}`);

  await query(
    `insert into user_roles (user_id, role_id)
     values ($1, $2)
     on conflict do nothing`,
    [user.id, role[0].id],
  );

  return { id: user.id, email: user.email, displayName: user.display_name };
}

export async function verifyPassword(
  user: DbUser,
  password: string,
): Promise<boolean> {
  if (!user.password_hash) return false;
  return bcrypt.compare(password, user.password_hash);
}

export function roleFromEmail(email: string): 'student' | 'staff' | 'external' {
  const e = email.toLowerCase().trim();

  if (e.endsWith('@mediaschool.me')) return 'student';
  if (e.endsWith('@mediaschool.eu')) return 'staff';
  return 'external';
}

export type Campus = {
  id: string;
  name: string;
  city: string;
};

export async function getAllCampuses(): Promise<Campus[]> {
  return query<Campus>(`SELECT id, name, city FROM campuses ORDER BY name ASC`);
}
