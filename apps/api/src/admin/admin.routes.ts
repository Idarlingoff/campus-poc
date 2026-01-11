import { Router } from 'express';
import { authJwt, type AuthedRequest } from '../auth/auth.middleware';
import { requirePerm } from '../auth/requirePerm';
import { query, pool } from '../db';
import { PublicationsService } from '../publications/publications.service';
import { PublicationsRepo } from '../publications/publications.repo';

export const adminRouter = Router();

const publicationsRepo = new PublicationsRepo(pool);
const publicationsService = new PublicationsService(publicationsRepo);

/**
 * Liste les publications signalées
 */
adminRouter.get(
  '/publications/reports',
  authJwt,
  requirePerm('challenges:moderate'),
  async (req: AuthedRequest, res) => {
    try {
      const reports = await publicationsService.getReportedPublications();
      return res.json(reports);
    } catch (e) {
      console.error('Error fetching reported publications:', e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  },
);

/**
 * Rejeter un signalement (le signalement est supprimé mais la publication reste)
 */
adminRouter.post(
  '/publications/reports/:reportId/dismiss',
  authJwt,
  requirePerm('challenges:moderate'),
  async (req: AuthedRequest, res) => {
    try {
      await publicationsService.dismissReport(req.params.reportId);
      return res.json({ ok: true });
    } catch (e) {
      console.error('Error dismissing report:', e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  },
);

/**
 * Supprimer une publication (par un admin/modérateur)
 */
adminRouter.delete(
  '/publications/:publicationId',
  authJwt,
  requirePerm('challenges:moderate'),
  async (req: AuthedRequest, res) => {
    try {
      await publicationsService.deletePublicationById(req.params.publicationId);
      return res.json({ ok: true });
    } catch (e) {
      console.error('Error deleting publication:', e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  },
);

/**
 * Ajoute un rôle à un user (ici bde)
 */
adminRouter.post(
  '/users/:id/roles/bde',
  authJwt,
  requirePerm('roles:assign'),
  async (req: AuthedRequest, res) => {
    const userId = req.params.id;

    const roleRows = await query<{ id: string }>(
      `select id from roles where code='bde' limit 1`,
    );
    const roleId = roleRows[0]?.id;
    if (!roleId)
      return res.status(500).json({ message: 'Role bde not found in DB' });

    await query(
      `insert into user_roles(user_id, role_id) values ($1, $2) on conflict do nothing`,
      [userId, roleId],
    );

    return res.status(200).json({ ok: true });
  },
);

/**
 * Retire le rôle bde
 */
adminRouter.delete(
  '/users/:id/roles/bde',
  authJwt,
  requirePerm('roles:assign'),
  async (req: AuthedRequest, res) => {
    const userId = req.params.id;

    const roleRows = await query<{ id: string }>(
      `select id from roles where code='bde' limit 1`,
    );
    const roleId = roleRows[0]?.id;
    if (!roleId)
      return res.status(500).json({ message: 'Role bde not found in DB' });

    await query(`delete from user_roles where user_id=$1 and role_id=$2`, [
      userId,
      roleId,
    ]);

    return res.status(200).json({ ok: true });
  },
);
