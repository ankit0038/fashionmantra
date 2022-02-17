const nodemailer = require('nodemailer');

const mailHelper = (options) => {
        const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                }
        });

        const message = {
                from: "ankit@fashionmantra.com",
                to: options.emailTo,
                subject: options.subject,
                text: options.message
        };

        transporter.sendMail(message);
}

module.exports = mailHelper;