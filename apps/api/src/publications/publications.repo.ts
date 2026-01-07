import { Pool } from 'pg';

export class PublicationsRepo {
    constructor(private db: Pool) {}

    async createPublication(input: {
        type: string;
        title: string;
        contentHtml: string;
        visibility: string;
        campusId: string | null;
        themeId: string | null;
        authorUserId: string;
        eventStartAt: string | null;
        eventEndAt: string | null;
    }) {
        const q = `
      INSERT INTO publications (type, title, content_html, visibility, campus_id, theme_id, author_user_id, event_start_at, event_end_at)
      VALUES ($1, $2, $3, $4, $5::uuid, $6::uuid, $7::uuid, $8::timestamptz, $9::timestamptz)
      RETURNING id
    `;
        const { rows } = await this.db.query(q, [
            input.type,
            input.title,
            input.contentHtml,
            input.visibility,
            input.campusId,
            input.themeId,
            input.authorUserId,
            input.eventStartAt,
            input.eventEndAt,
        ]);
        return rows[0];
    }

    async getPublicationById(id: string) {
        const q = `
      SELECT p.*,
             u.id as "authorId",
             COALESCE(u.display_name, u.email) as "authorDisplayName",
             c.id as "campusId", c.name as "campusName", c.city as "campusCity",
             t.id as "themeId", t.label as "themeLabel", t.slug as "themeSlug"
      FROM publications p
      JOIN users u ON u.id = p.author_user_id
      LEFT JOIN campuses c ON c.id = p.campus_id
      LEFT JOIN themes t ON t.id = p.theme_id
      WHERE p.id = $1::uuid
      LIMIT 1
    `;
        const { rows } = await this.db.query(q, [id]);
        return rows[0] ?? null;
    }

    async patchPublication(id: string, patch: any) {
        const fields: string[] = [];
        const values: any[] = [];
        let i = 1;

        const map: Record<string, string> = {
            title: 'title',
            contentHtml: 'content_html',
            visibility: 'visibility',
            campusId: 'campus_id',
            themeId: 'theme_id',
            eventStartAt: 'event_start_at',
            eventEndAt: 'event_end_at',
        };

        for (const [k, col] of Object.entries(map)) {
            if (patch[k] !== undefined) {
                fields.push(`${col} = $${i++}`);
                values.push(patch[k]);
            }
        }
        fields.push(`updated_at = now()`);

        if (fields.length === 1) return; // only updated_at would be present

        const q = `
      UPDATE publications
      SET ${fields.join(', ')}
      WHERE id = $${i}::uuid
    `;
        values.push(id);
        await this.db.query(q, values);
    }

    async deletePublication(id: string) {
        await this.db.query(`DELETE FROM publications WHERE id = $1::uuid`, [id]);
    }

    async createReport(input: { publicationId: string; reporterUserId: string | null; reason: string | null }) {
        const q = `
      INSERT INTO publication_reports (publication_id, reporter_user_id, reason)
      VALUES ($1::uuid, $2::uuid, $3)
      RETURNING id
    `;
        const { rows } = await this.db.query(q, [input.publicationId, input.reporterUserId, input.reason]);
        return rows[0];
    }

    async getCampusUserEmails(campusId: string): Promise<string[]> {
        // Adapte si tu stockes l'email ailleurs
        const q = `
      SELECT u.email
      FROM users u
      JOIN user_profile up ON up.user_id = u.id
      WHERE up.campus_id = $1::uuid
    `;
        const { rows } = await this.db.query(q, [campusId]);
        return rows.map(r => r.email).filter(Boolean);
    }
}
