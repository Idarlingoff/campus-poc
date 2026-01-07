export class MailService {
    async sendReportEmail(input: { to: string[]; subject: string; text: string }) {
        // POC: log
        console.log('[MAIL][REPORT]', { toCount: input.to.length, subject: input.subject, text: input.text });
        // PROD: nodemailer ici
    }
}
