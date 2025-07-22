"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const environment_1 = require("@/config/environment");
const logger_1 = require("@/utils/logger");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: environment_1.config.email.host,
            port: environment_1.config.email.port,
            secure: environment_1.config.email.port === 465,
            auth: environment_1.config.email.user && environment_1.config.email.pass ? {
                user: environment_1.config.email.user,
                pass: environment_1.config.email.pass,
            } : undefined,
        });
    }
    async sendEmail(options) {
        try {
            if (!environment_1.config.email.host || !environment_1.config.email.user) {
                (0, logger_1.logInfo)('Email service not configured, skipping email send');
                return;
            }
            const mailOptions = {
                from: environment_1.config.email.from || environment_1.config.email.user,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                attachments: options.attachments,
            };
            const result = await this.transporter.sendMail(mailOptions);
            (0, logger_1.logInfo)('Email sent successfully', {
                to: options.to,
                subject: options.subject,
                messageId: result.messageId,
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, {
                context: 'Email sending',
                to: options.to,
                subject: options.subject,
            });
            throw error;
        }
    }
    async sendWelcomeEmail(userEmail, userName) {
        const template = this.getWelcomeTemplate(userName);
        await this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    async sendPasswordResetEmail(userEmail, resetToken) {
        const template = this.getPasswordResetTemplate(resetToken);
        await this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    async sendEmailVerification(userEmail, verificationToken) {
        const template = this.getEmailVerificationTemplate(verificationToken);
        await this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    async sendRobotAlert(userEmail, robotName, alertType, message) {
        const template = this.getRobotAlertTemplate(robotName, alertType, message);
        await this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    async sendMaintenanceNotification(userEmails, title, message, scheduledTime) {
        const template = this.getMaintenanceTemplate(title, message, scheduledTime);
        await this.sendEmail({
            to: userEmails,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
    async verifyConnection() {
        try {
            if (!environment_1.config.email.host || !environment_1.config.email.user) {
                return false;
            }
            await this.transporter.verify();
            (0, logger_1.logInfo)('Email service connection verified');
            return true;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Email service verification' });
            return false;
        }
    }
    getWelcomeTemplate(userName) {
        return {
            subject: 'Welcome to Robot Platform!',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Robot Platform</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e293b; color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; background: #f8fafc; }
              .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🤖 Robot Platform</h1>
                <p>Welcome to the future of robot control!</p>
              </div>
              <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>Thank you for joining Robot Platform. You now have access to:</p>
                <ul>
                  <li>Real-time robot control and monitoring</li>
                  <li>Advanced analytics and insights</li>
                  <li>Automation routines and scheduling</li>
                  <li>Voice control and AI integration</li>
                  <li>Multi-robot management</li>
                </ul>
                <p>Get started by connecting your first robot and exploring the dashboard.</p>
                <a href="${environment_1.config.cors.origin[0]}" class="button">Access Dashboard</a>
                <p>If you have any questions, our support team is here to help!</p>
              </div>
              <div class="footer">
                <p>Robot Platform - Empowering the robotics community</p>
              </div>
            </div>
          </body>
        </html>
      `,
            text: `Welcome to Robot Platform, ${userName}! Thank you for joining us. You now have access to real-time robot control, advanced analytics, automation, and much more. Get started at ${environment_1.config.cors.origin[0]}`
        };
    }
    getPasswordResetTemplate(resetToken) {
        const resetUrl = `${environment_1.config.cors.origin[0]}/reset-password?token=${resetToken}`;
        return {
            subject: 'Reset Your Robot Platform Password',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f8fafc; }
              .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Password Reset</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>You requested a password reset for your Robot Platform account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <div class="warning">
                  <strong>Security Notice:</strong>
                  <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                  </ul>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
              </div>
              <div class="footer">
                <p>Robot Platform Security Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
            text: `Reset your Robot Platform password by visiting: ${resetUrl}. This link expires in 1 hour. If you didn't request this, please ignore this email.`
        };
    }
    getEmailVerificationTemplate(verificationToken) {
        const verifyUrl = `${environment_1.config.cors.origin[0]}/verify-email?token=${verificationToken}`;
        return {
            subject: 'Verify Your Robot Platform Email',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f8fafc; }
              .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✉️ Email Verification</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Please verify your email address to complete your Robot Platform registration.</p>
                <a href="${verifyUrl}" class="button">Verify Email</a>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #3b82f6;">${verifyUrl}</p>
              </div>
              <div class="footer">
                <p>Robot Platform Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
            text: `Verify your Robot Platform email by visiting: ${verifyUrl}`
        };
    }
    getRobotAlertTemplate(robotName, alertType, message) {
        const alertColors = {
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            success: '#10b981'
        };
        const color = alertColors[alertType.toLowerCase()] || '#64748b';
        return {
            subject: `Robot Alert: ${robotName} - ${alertType}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Robot Alert</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${color}; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f8fafc; }
              .alert { background: white; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🤖 Robot Alert</h1>
                <p>${robotName}</p>
              </div>
              <div class="content">
                <div class="alert">
                  <h3>${alertType.toUpperCase()}</h3>
                  <p>${message}</p>
                  <small>Time: ${new Date().toLocaleString()}</small>
                </div>
                <p>Please check your robot dashboard for more details and take appropriate action if needed.</p>
                <a href="${environment_1.config.cors.origin[0]}" class="button">View Dashboard</a>
              </div>
              <div class="footer">
                <p>Robot Platform Monitoring System</p>
              </div>
            </div>
          </body>
        </html>
      `,
            text: `Robot Alert: ${robotName} - ${alertType}: ${message}. Time: ${new Date().toLocaleString()}. Check your dashboard at ${environment_1.config.cors.origin[0]}`
        };
    }
    getMaintenanceTemplate(title, message, scheduledTime) {
        return {
            subject: `Robot Platform Maintenance: ${title}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Maintenance Notification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f8fafc; }
              .maintenance { background: white; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔧 Maintenance Notification</h1>
              </div>
              <div class="content">
                <div class="maintenance">
                  <h3>${title}</h3>
                  <p>${message}</p>
                  ${scheduledTime ? `<p><strong>Scheduled Time:</strong> ${scheduledTime.toLocaleString()}</p>` : ''}
                </div>
                <p>We apologize for any inconvenience and appreciate your patience.</p>
              </div>
              <div class="footer">
                <p>Robot Platform Operations Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
            text: `Maintenance Notification: ${title} - ${message}${scheduledTime ? ` Scheduled: ${scheduledTime.toLocaleString()}` : ''}`
        };
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.js.map