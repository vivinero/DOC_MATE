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
            const mailOption = await transporter.sendMail({
              from: process.env.user,
              to: options.email,
              subject: options.subject,
              text: options.text,
              html: options.html
            });
        
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