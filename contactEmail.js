const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendMail(options) {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.service,
            auth: {
                user: process.env.user, 
                pass: process.env.emailPassword,
            }
        })
            const mailOption = {
              from: options.email,
              to: process.env.user,
              subject: options.subject,
              text: options.text,
            };
        
            await transporter.sendMail(mailOption);   
            return {
                success: true,
                message: 'Email sent successfully',
            }
    } catch (err) {
        console.error('Error sending mail:', err.message);
        return {
            success: false,
            message: 'Error sending mail: ' + err.message,
        };
    }
}

module.exports = sendMail;