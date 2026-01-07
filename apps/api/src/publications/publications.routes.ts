import { Router } from 'express';
import { authJwt } from '../auth/auth.middleware';
import { pool } from '../db';
import { PublicationsRepo } from './publications.repo';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { MailService } from '../mail/mail.service';

export const publicationsRouter = Router();

const repo = new PublicationsRepo(pool);
const service = new PublicationsService(repo);
const mail = new MailService();
const controller = new PublicationsController(service, repo, mail);

publicationsRouter.post('/', authJwt, controller.create);
publicationsRouter.get('/:id', authJwt, controller.getById);
publicationsRouter.patch('/:id', authJwt, controller.patch);
publicationsRouter.delete('/:id', authJwt, controller.remove);

publicationsRouter.post('/:id/report', authJwt, controller.report);
