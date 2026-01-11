import { Request, Response } from 'express';
import { PublicationsService } from './publications.service';
import { PublicationsRepo } from './publications.repo';
import { MailService } from '../mail/mail.service';
import {
  validateCreatePublication,
  validatePatchPublication,
} from './publications.validators';

export class PublicationsController {
  constructor(
    private service: PublicationsService,
    private repo: PublicationsRepo,
    private mail: MailService,
  ) {}

  create = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // TODO: check permission publications:create
    const input = validateCreatePublication(req.body);
    const created = await this.service.create(user.id, input);
    res.status(201).json(created);
  };

  getById = async (req: Request, res: Response) => {
    const pub = await this.service.get(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Not found' });
    res.json(pub);
  };

  patch = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const pub = await this.service.get(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Not found' });

    // TODO: owner or publications:moderate
    if (pub.author_user_id !== user.id) {
      // replace with real permission check
      return res.status(403).json({ message: 'Forbidden' });
    }

    const patch = validatePatchPublication(req.body);
    await this.service.patch(req.params.id, patch);
    res.status(204).send();
  };

  remove = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const pub = await this.service.get(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Not found' });

    // TODO: owner or publications:moderate
    if (pub.author_user_id !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await this.service.delete(req.params.id);
    res.status(204).send();
  };

  report = async (req: Request, res: Response) => {
    const user = (req as any).user ?? null;
    const reporterUserId = user?.id ?? null;

    const pub = await this.service.get(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Not found' });

    const reason = req.body?.reason ? String(req.body.reason) : null;

    // Insert report
    const created = await this.service.report(
      req.params.id,
      reporterUserId,
      reason,
    );

    // Email campus users
    const campusId = pub.campus_id;
    if (campusId) {
      const emails = await this.repo.getCampusUserEmails(campusId);
      if (emails.length) {
        await this.mail.sendReportEmail({
          to: emails,
          subject: `Signalement de contenu - ${pub.title}`,
          text: `Un contenu a été signalé.\n\nTitre: ${pub.title}\nType: ${pub.type}\nRaison: ${reason ?? '(non renseignée)'}\nPublicationId: ${pub.id}\n`,
        });
      }
    }

    res.status(201).json(created);
  };
}
