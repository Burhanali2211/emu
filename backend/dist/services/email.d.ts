export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}
export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private transporter;
    constructor();
    sendEmail(options: EmailOptions): Promise<void>;
    sendWelcomeEmail(userEmail: string, userName: string): Promise<void>;
    sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<void>;
    sendEmailVerification(userEmail: string, verificationToken: string): Promise<void>;
    sendRobotAlert(userEmail: string, robotName: string, alertType: string, message: string): Promise<void>;
    sendMaintenanceNotification(userEmails: string[], title: string, message: string, scheduledTime?: Date): Promise<void>;
    verifyConnection(): Promise<boolean>;
    private getWelcomeTemplate;
    private getPasswordResetTemplate;
    private getEmailVerificationTemplate;
    private getRobotAlertTemplate;
    private getMaintenanceTemplate;
}
//# sourceMappingURL=email.d.ts.map