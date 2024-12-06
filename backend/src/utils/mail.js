// nodemailer.mjs
import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import CONFIG from '../config/config.js';
import logger from './logger.js';

const filename = path.basename(import.meta.url);
const loggerInstance = logger(filename);
let mailResendAttempts = 2;
const templatePath = path.resolve('./templates/admin/');

const transporter = nodemailer.createTransport({
    host: CONFIG.SMTP_HOST,
    port: CONFIG.SMTP_PORT,
    pool: true,
    maxConnections: 1,
    maxMessages: Infinity,
    auth: CONFIG.SMTP_AUTH
});

const employeeCreatePasswordMail = async (mailData) => {
    try {
        const data = await ejs.renderFile(`${templatePath}/employeeCreatePassword.ejs`, {
            employeeName: mailData.employeeName,
            email: mailData.email,
            password: mailData.password,
            employeeCode: mailData.employeeCode
        });

        const mailOptions = {
            from: process.env.SMTP_AUTH_USER,
            to: mailData.emailTo,
            subject: 'Cadambams | Welcome Aboard! Create your Account Password',
            html: data
        };

        // Send Mail
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                if (mailResendAttempts !== 0) {
                    employeeCreatePasswordMail(mailData);
                    mailResendAttempts--;
                } else {
                    mailResendAttempts = 2;
                }
                loggerInstance.error(`Employee password create Mail Not Sent - ${error}`);
            }
            loggerInstance.info(`Employee password create Mail sent: ${info.messageId}`);
        });
    } catch (err) {
        loggerInstance.error(err);
    }
};

const internalVerifyOtpMail = async (mailData) => {
    try {
        const data = await ejs.renderFile(`${templatePath}/internalVerifyOTP.ejs`, {
            firstName: mailData.firstName,
            otp: mailData.otp,
            otpExpirationTime: mailData.otpExpirationTime
        });

        const mailOptions = {
            from: process.env.SMTP_AUTH_USER,
            to: mailData.emailTo,
            subject: 'Cadambams | Welcome Aboard! Verify your account with OTP',
            html: data
        };

        // Send Mail
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                if (mailResendAttempts !== 0) {
                    internalVerifyOtpMail(mailData);
                    mailResendAttempts--;
                } else {
                    mailResendAttempts = 2;
                }
                loggerInstance.error(`Internal verifyOTP Mail Not Sent - ${error}`);
            }
            loggerInstance.info(`Internal verifyOTP Mail sent: ${info.messageId}`);
        });
    } catch (err) {
        loggerInstance.error(err.message);
    }
};

// eslint-disable-next-line import/prefer-default-export
export { employeeCreatePasswordMail, internalVerifyOtpMail };