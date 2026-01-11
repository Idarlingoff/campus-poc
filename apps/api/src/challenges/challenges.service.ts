import { pool } from '../db';

const CATEGORIES = [
  'creation',
  'nourriture',
  'photo',
  'groupe',
  'style',
  'autre',
] as const;
const DIFFICULTIES = ['facile', 'moyen', 'difficile'] as const;
const PARTICIPATION = ['SOLO', 'TEAM'] as const;
const PHASES = ['REGISTRATION', 'RUNNING', 'JUDGING', 'FINISHED'] as const;

type Category = (typeof CATEGORIES)[number];
type Difficulty = (typeof DIFFICULTIES)[number];
type ParticipationMode = (typeof PARTICIPATION)[number];
type Phase = (typeof PHASES)[number];

function isCategory(v: any): v is Category {
  return CATEGORIES.includes(v);
}
function isDifficulty(v: any): v is Difficulty {
  return DIFFICULTIES.includes(v);
}
function isParticipationMode(v: any): v is ParticipationMode {
  return PARTICIPATION.includes(v);
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function computePhase(row: {
  start_at: Date | string | null;
  end_at: Date | string | null;
  winners_finalized: boolean;
}): Phase {
  const now = new Date();

  const start = row.start_at ? new Date(row.start_at) : null;
  const end = row.end_at ? new Date(row.end_at) : null;

  if (!start || !end) return 'REGISTRATION';

  if (row.winners_finalized) return 'FINISHED';
  if (now < start) return 'REGISTRATION';
  if (now >= start && now <= end) return 'RUNNING';
  return 'JUDGING';
}

async function updatePhaseIfNeeded(challengeId: string, phase: Phase) {
  await pool.query(
    `update challenges set phase=$2 where id=$1 and phase is distinct from $2`,
    [challengeId, phase],
  );
}

/**
 * CREATE challenge (PENDING)
 * Note: start_at/end_at peuvent être fournis à la création.
 * participation_mode: SOLO|TEAM
 * requires_proof, podium_size
 */
export async function createChallenge(userId: string, body: any) {
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();

  const category: Category = isCategory(body.category)
    ? body.category
    : 'autre';
  const difficulty: Difficulty = isDifficulty(body.difficulty)
    ? body.difficulty
    : 'moyen';

  const points = Number(body.points ?? 0);
  const durationMin = Number(body.durationMin ?? body.duration_min ?? 60);

  const participationMode: ParticipationMode = isParticipationMode(
    body.participationMode ?? body.participation_mode,
  )
    ? (body.participationMode ?? body.participation_mode)
    : 'SOLO';

  const requiresProof = Boolean(
    body.requiresProof ?? body.requires_proof ?? false,
  );
  const podiumSize = Number(body.podiumSize ?? body.podium_size ?? 1);

  const startAt = parseDate(body.startAt ?? body.start_at);
  const endAt = parseDate(body.endAt ?? body.end_at);

  if (!title || title.length < 3) throw new Error('title invalid');
  if (!description || description.length < 10)
    throw new Error('description invalid');
  if (!Number.isFinite(points) || points < 0 || points > 5000)
    throw new Error('points invalid');
  if (!Number.isFinite(durationMin) || durationMin < 5 || durationMin > 24 * 60)
    throw new Error('durationMin invalid');
  if (!Number.isFinite(podiumSize) || podiumSize < 1 || podiumSize > 10)
    throw new Error('podiumSize invalid');

  if ((startAt && !endAt) || (!startAt && endAt))
    throw new Error('startAt/endAt required together');
  if (startAt && endAt && endAt <= startAt)
    throw new Error('endAt must be after startAt');

  const q = `
    insert into challenges(
      title, description, category, difficulty, points, duration_min,
      status, created_by,
      participation_mode, requires_proof, podium_size, start_at, end_at, phase, winners_finalized
    )
    values($1,$2,$3,$4,$5,$6,'PENDING',$7,$8,$9,$10,$11,$12,'REGISTRATION',false)
    returning *
  `;

  const { rows } = await pool.query(q, [
    title,
    description,
    category,
    difficulty,
    points,
    durationMin,
    userId,
    participationMode,
    requiresProof,
    podiumSize,
    startAt,
    endAt,
  ]);

  return rows[0];
}

export async function listApprovedChallenges() {
  const q = `
    select *
    from challenges
    where status='APPROVED'
    order by created_at desc
  `;
  const { rows } = await pool.query(q);

  for (const r of rows) {
    const phase = computePhase(r);
    r.phase = phase;
    await updatePhaseIfNeeded(r.id, phase);
  }

  return rows;
}

export async function listPendingChallenges() {
  const q = `select * from challenges where status='PENDING' order by created_at asc`;
  const { rows } = await pool.query(q);
  return rows;
}

export async function moderateChallenge(
  moderatorId: string,
  id: string,
  body: any,
) {
  const action = String(body.action ?? '');
  const reason = body.reason ? String(body.reason).trim() : null;

  if (action !== 'approve' && action !== 'reject')
    throw new Error('action invalid');
  if (action === 'reject' && (!reason || reason.length < 3))
    throw new Error('reason required');

  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

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
  if (!rows[0]) throw new Error('challenge not found');
  return rows[0];
}

/**
 * GET /challenges/:id detail
 * - phase calculée
 * - winners
 * - myParticipation (USER ou TEAM)
 */
export async function getChallengeById(userId: string, id: string) {
  const { rows } = await pool.query(
    `select * from challenges where id=$1 and status='APPROVED'`,
    [id],
  );
  const ch = rows[0];
  if (!ch) throw new Error('challenge not found');

  const phase = computePhase(ch);
  ch.phase = phase;
  await updatePhaseIfNeeded(ch.id, phase);

  const winnersRes = await pool.query(
    `
    select w.rank, w.participant_type,
           w.user_id, u.display_name as user_display_name,
           w.team_id, t.name as team_name
    from challenge_winners w
    left join users u on u.id = w.user_id
    left join teams t on t.id = w.team_id
    where w.challenge_id = $1
    order by w.rank asc
    `,
    [id],
  );

  let myParticipation: any = null;

  if (ch.participation_mode === 'SOLO') {
    const part = await pool.query(
      `
      select participant_type, status, registered_at, submitted_at
      from challenge_participants
      where challenge_id=$1 and participant_type='USER' and user_id=$2
      `,
      [id, userId],
    );
    if (part.rows[0]) myParticipation = { type: 'USER', ...part.rows[0] };
  } else {
    const part = await pool.query(
      `
      select cp.participant_type, cp.team_id, cp.status, cp.registered_at, cp.submitted_at,
             t.name as team_name
      from challenge_participants cp
      join teams t on t.id = cp.team_id
      join team_members tm on tm.team_id = cp.team_id
      where cp.challenge_id=$1
        and cp.participant_type='TEAM'
        and tm.user_id=$2
      limit 1
      `,
      [id, userId],
    );
    if (part.rows[0]) myParticipation = { type: 'TEAM', ...part.rows[0] };
  }

  return {
    challenge: ch,
    winners: winnersRes.rows,
    myParticipation,
  };
}

/**
 * POST /challenges/:id/register
 * - SOLO: register user
 * - TEAM: create team + membership + register team
 *
 * body TEAM: { teamName: string }
 */
export async function registerToChallenge(
  userId: string,
  challengeId: string,
  body: any,
) {
  const client = await pool.connect();
  try {
    await client.query('begin');

    const chRes = await client.query(
      `select * from challenges where id=$1 and status='APPROVED'`,
      [challengeId],
    );
    const ch = chRes.rows[0];
    if (!ch) throw new Error('challenge not found');

    const phase = computePhase(ch);
    if (phase !== 'REGISTRATION') throw new Error('registration closed');

    await client.query(
      `update challenges set phase=$2 where id=$1 and phase is distinct from $2`,
      [challengeId, phase],
    );

    if (ch.participation_mode === 'SOLO') {
      const exists = await client.query(
        `select 1 from challenge_participants
         where challenge_id=$1 and participant_type='USER' and user_id=$2
         limit 1`,
        [challengeId, userId],
      );
      if (exists.rows[0]) throw new Error('already registered');

      await client.query(
        `insert into challenge_participants(challenge_id, participant_type, user_id)
         values($1,'USER',$2)`,
        [challengeId, userId],
      );

      await client.query('commit');
      return { ok: true, participantType: 'USER', challengeId };
    }

    const teamName = String(body?.teamName ?? body?.team_name ?? '').trim();
    if (!teamName || teamName.length < 2) throw new Error('teamName required');

    const existsTeam = await client.query(
      `
      select 1
      from challenge_participants cp
      join team_members tm on tm.team_id = cp.team_id
      where cp.challenge_id=$1 and cp.participant_type='TEAM' and tm.user_id=$2
      limit 1
      `,
      [challengeId, userId],
    );
    if (existsTeam.rows[0]) throw new Error('already registered');

    const teamRes = await client.query(
      `insert into teams(name, created_by) values($1,$2) returning id`,
      [teamName, userId],
    );
    const teamId = teamRes.rows[0].id;

    await client.query(
      `insert into team_members(team_id, user_id, role) values($1,$2,'owner')`,
      [teamId, userId],
    );

    await client.query(
      `insert into challenge_participants(challenge_id, participant_type, team_id)
       values($1,'TEAM',$2)`,
      [challengeId, teamId],
    );

    await client.query('commit');
    return { ok: true, participantType: 'TEAM', challengeId, teamId, teamName };
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * POST /challenges/:id/submission
 * body: { content?: string, attachments?: any[] }
 *
 * Rules:
 * - phase must be RUNNING
 * - must be registered
 * - TEAM: finds the registered team that includes this user
 * - if requires_proof=false, we still allow submission (can be comment), you can change if you want
 */
export async function submitProof(
  userId: string,
  challengeId: string,
  body: any,
) {
  const content = body?.content ? String(body.content).trim() : null;
  const attachments = Array.isArray(body?.attachments) ? body.attachments : [];

  const client = await pool.connect();
  try {
    await client.query('begin');

    const chRes = await client.query(
      `select * from challenges where id=$1 and status='APPROVED'`,
      [challengeId],
    );
    const ch = chRes.rows[0];
    if (!ch) throw new Error('challenge not found');

    const phase = computePhase(ch);
    if (phase !== 'RUNNING') throw new Error('challenge not running');

    await client.query(
      `update challenges set phase=$2 where id=$1 and phase is distinct from $2`,
      [challengeId, phase],
    );

    if (ch.participation_mode === 'SOLO') {
      const part = await client.query(
        `select 1 from challenge_participants
         where challenge_id=$1 and participant_type='USER' and user_id=$2
         limit 1`,
        [challengeId, userId],
      );
      if (!part.rows[0]) throw new Error('not registered');

      await client.query(
        `
        insert into challenge_submissions(challenge_id, participant_type, user_id, content, attachments)
        values($1,'USER',$2,$3,$4::jsonb)
        on conflict (challenge_id, user_id)
        do update set content=excluded.content, attachments=excluded.attachments, created_at=now()
        `,
        [challengeId, userId, content, JSON.stringify(attachments)],
      );

      await client.query(
        `
        update challenge_participants
        set status='SUBMITTED', submitted_at=now()
        where challenge_id=$1 and participant_type='USER' and user_id=$2
        `,
        [challengeId, userId],
      );

      await client.query('commit');
      return { ok: true, participantType: 'USER', challengeId };
    }

    const teamRes = await client.query(
      `
      select cp.team_id
      from challenge_participants cp
      join team_members tm on tm.team_id = cp.team_id
      where cp.challenge_id=$1 and cp.participant_type='TEAM' and tm.user_id=$2
      limit 1
      `,
      [challengeId, userId],
    );
    const teamId = teamRes.rows[0]?.team_id;
    if (!teamId) throw new Error('not registered');

    await client.query(
      `
      insert into challenge_submissions(challenge_id, participant_type, team_id, content, attachments)
      values($1,'TEAM',$2,$3,$4::jsonb)
      on conflict (challenge_id, team_id)
      do update set content=excluded.content, attachments=excluded.attachments, created_at=now()
      `,
      [challengeId, teamId, content, JSON.stringify(attachments)],
    );

    await client.query(
      `
      update challenge_participants
      set status='SUBMITTED', submitted_at=now()
      where challenge_id=$1 and participant_type='TEAM' and team_id=$2
      `,
      [challengeId, teamId],
    );

    await client.query('commit');
    return { ok: true, participantType: 'TEAM', challengeId, teamId };
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * POST /challenges/:id/winners
 * body: { winners: Array<{ rank: number, userId?: string, teamId?: string }> }
 *
 * Rules:
 * - phase must be JUDGING (now > end_at and winners_finalized=false)
 * - winners must match participation_mode
 * - ranks unique and within 1..podium_size
 * - after setting winners -> winners_finalized=true + phase FINISHED
 */
export async function setWinners(
  moderatorId: string,
  challengeId: string,
  body: any,
) {
  const winners = Array.isArray(body?.winners) ? body.winners : [];
  if (winners.length === 0) throw new Error('winners required');

  const client = await pool.connect();
  try {
    await client.query('begin');

    const chRes = await client.query(
      `select * from challenges where id=$1 and status='APPROVED'`,
      [challengeId],
    );
    const ch = chRes.rows[0];
    if (!ch) throw new Error('challenge not found');

    const phase = computePhase(ch);
    if (phase !== 'JUDGING') throw new Error('not in judging phase');

    const podiumSize = Number(ch.podium_size ?? 1);

    const ranks = winners.map((w: any) => Number(w.rank));
    for (const r of ranks) {
      if (!Number.isFinite(r) || r < 1 || r > podiumSize)
        throw new Error('rank invalid');
    }
    const uniqueRanks = new Set(ranks);
    if (uniqueRanks.size !== ranks.length) throw new Error('duplicate ranks');

    const mode: ParticipationMode = ch.participation_mode;

    await client.query(`delete from challenge_winners where challenge_id=$1`, [
      challengeId,
    ]);

    for (const w of winners) {
      const rank = Number(w.rank);

      if (mode === 'SOLO') {
        const userId = String(w.userId ?? '');
        if (!userId) throw new Error('userId required for SOLO');

        const check = await client.query(
          `select 1 from challenge_participants
                       where challenge_id=$1 and participant_type='USER' and user_id=$2
                       limit 1`,
          [challengeId, userId],
        );
        if (!check.rows[0]) throw new Error('winner user not registered');

        await client.query(
          `insert into challenge_winners(challenge_id, rank, participant_type, user_id, decided_by)
                      values($1,$2,'USER',$3,$4)
                      `,
          [challengeId, rank, userId, moderatorId],
        );
      } else {
        const teamId = String(w.teamId ?? '');
        if (!teamId) throw new Error('teamId required for TEAM');

        const check = await client.query(
          `select 1 from challenge_participants
                       where challenge_id=$1 and participant_type='TEAM' and team_id=$2
                       limit 1`,
          [challengeId, teamId],
        );
        if (!check.rows[0]) throw new Error('winner team not registered');

        await client.query(
          `insert into challenge_winners(challenge_id, rank, participant_type, team_id, decided_by)
                      values($1,$2,'TEAM',$3,$4)
                      `,
          [challengeId, rank, teamId, moderatorId],
        );
      }
    }

    await client.query(
      `update challenges set winners_finalized=true, phase='FINISHED' where id=$1`,
      [challengeId],
    );

    await client.query('commit');
    return { ok: true, challengeId, winnersCount: winners.length };
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

export async function listChallengesForModeration() {
  const q = `
    select *
    from challenges
    order by created_at desc
  `;
  const { rows } = await pool.query(q);

  for (const r of rows) {
    const phase = computePhase(r);
    r.phase = phase;
    await updatePhaseIfNeeded(r.id, phase);
  }

  return rows;
}

export async function getChallengeForModerationById(
  _moderatorId: string,
  id: string,
) {
  const { rows } = await pool.query(`select * from challenges where id=$1`, [
    id,
  ]);
  const ch = rows[0];
  if (!ch) throw new Error('challenge not found');

  const phase = computePhase(ch);
  ch.phase = phase;
  await updatePhaseIfNeeded(ch.id, phase);

  const winnersRes = await pool.query(
    `
      select w.rank, w.participant_type,
             w.user_id, u.display_name as user_display_name,
             w.team_id, t.name as team_name
      from challenge_winners w
      left join users u on u.id = w.user_id
      left join teams t on t.id = w.team_id
      where w.challenge_id = $1
      order by w.rank asc
    `,
    [id],
  );

  return { challenge: ch, winners: winnersRes.rows };
}

export async function getChallengeJudgingBundle(challengeId: string) {
  const { rows } = await pool.query(
    `select * from challenges where id=$1 and status='APPROVED'`,
    [challengeId],
  );
  const ch = rows[0];
  if (!ch) throw new Error('challenge not found');

  const phase = computePhase(ch);
  ch.phase = phase;
  await updatePhaseIfNeeded(ch.id, phase);

  if (phase !== 'JUDGING') {
    throw new Error('not in judging phase');
  }

  const participantsRes = await pool.query(
    `
    select
      cp.participant_type,
      cp.status,
      cp.registered_at,
      cp.submitted_at,
      cp.user_id,
      u.display_name as user_display_name,
      cp.team_id,
      t.name as team_name
    from challenge_participants cp
    left join users u on u.id = cp.user_id
    left join teams t on t.id = cp.team_id
    where cp.challenge_id = $1
    order by cp.registered_at asc
    `,
    [challengeId],
  );

  const submissionsRes = await pool.query(
    `
    select
      cs.id,
      cs.participant_type,
      cs.user_id,
      u.display_name as user_display_name,
      cs.team_id,
      t.name as team_name,
      cs.content,
      cs.attachments,
      cs.created_at
    from challenge_submissions cs
    left join users u on u.id = cs.user_id
    left join teams t on t.id = cs.team_id
    where cs.challenge_id = $1
    order by cs.created_at desc
    `,
    [challengeId],
  );

  const winnersRes = await pool.query(
    `
    select w.rank, w.participant_type,
           w.user_id, u.display_name as user_display_name,
           w.team_id, t.name as team_name
    from challenge_winners w
    left join users u on u.id = w.user_id
    left join teams t on t.id = w.team_id
    where w.challenge_id = $1
    order by w.rank asc
    `,
    [challengeId],
  );

  return {
    challenge: ch,
    participants: participantsRes.rows,
    submissions: submissionsRes.rows,
    winners: winnersRes.rows,
  };
}
