import { PublicationsRepo } from './publications.repo';

export class PublicationsService {
    constructor(private repo: PublicationsRepo) {}

    async create(userId: string, input: any) {
        return this.repo.createPublication({ ...input, authorUserId: userId });
    }

    async get(id: string) {
        return this.repo.getPublicationById(id);
    }

    async patch(id: string, patch: any) {
        await this.repo.patchPublication(id, patch);
    }

    async delete(id: string) {
        await this.repo.deletePublication(id);
    }

    async report(publicationId: string, reporterUserId: string | null, reason: string | null) {
        return this.repo.createReport({ publicationId, reporterUserId, reason });
    }
}
