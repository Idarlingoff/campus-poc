import { pool } from "../db";

const CATEGORIES = ["creation","nourriture","photo","groupe","style","autre"] as const;
const DIFFICULTIES = ["facile","moyen","difficile"] as const;

type Category = typeof CATEGORIES[number];
type Difficulty = typeof DIFFICULTIES[number];

function isCategory(v: any): v is Category {
    return CATEGORIES.includes(v);
}
function isDifficulty(v: any): v is Difficulty {
    return DIFFICULTIES.includes(v);
}

export async function createChallenge(userId: string, body: any) {
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();

    const category: Category = isCategory(body.category) ? body.category : "autre";
    const difficulty: Difficulty = isDifficulty(body.difficulty) ? body.difficulty : "moyen";

    const points = Number(body.points ?? 0);
    const durationMin = Number(body.durationMin ?? 60);

    if (!title || title.length < 3) throw new Error("title invalid");
    if (!description || description.length < 10) throw new Error("description invalid");
    if (!Number.isFinite(points) || points < 0 || points > 5000) throw new Error("points invalid");
    if (!Number.isFinite(durationMin) || durationMin < 5 || durationMin > 24 * 60) throw new Error("durationMin invalid");

    const q = `
    insert into challenges(title, description, category, difficulty, points, duration_min, status, created_by)
    values($1,$2,$3,$4,$5,$6,'PENDING',$7)
    returning *
  `;
    const { rows } = await pool.query(q, [title, description, category, difficulty, points, durationMin, userId]);
    return rows[0];
}

export async function listApprovedChallenges() {
    const q = `select * from challenges where status='APPROVED' order by created_at desc`;
    const { rows } = await pool.query(q);
    return rows;
}

export async function listPendingChallenges() {
    const q = `select * from challenges where status='PENDING' order by created_at asc`;
    const { rows } = await pool.query(q);
    return rows;
}

export async function moderateChallenge(moderatorId: string, id: string, body: any) {
    const action = String(body.action ?? "");
    const reason = body.reason ? String(body.reason).trim() : null;

    if (action !== "approve" && action !== "reject") throw new Error("action invalid");
    if (action === "reject" && (!reason || reason.length < 3)) throw new Error("reason required");

    const status = action === "approve" ? "APPROVED" : "REJECTED";

    const q = `
    update challenges
    set status = $1,
        moderated_by = $2,
        moderated_at = now(),
        rejection_reason = $3
    where id = $4
    returning *
  `;
    const { rows } = await pool.query(q, [status, moderatorId, reason, id]);
    if (!rows[0]) throw new Error("challenge not found");
    return rows[0];
}
