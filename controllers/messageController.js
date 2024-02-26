// Backend server setup using Express.js
const express = require('express');
const receiveMail = require("../contactEmail")

const nodemailer = require('nodemailer');
// const mongoose = require('mongoose');
//require("dotenv").config()

const Message = require('../models/messageModel'); 
const {validateMessage}= require("../middleware/validator")


// Endpoint for receiving messages from patients
const message = async (req, res) => {
    const { error } =validateMessage (req.body);
        if (error) {
            res.status(500).json({
                message: error.details[0].message
            })
            return;
        } else {
    const { firstName, lastName, email, title, content } = req.body;

    try {
        // Save the message to the database
        const newMessage = new Message({
            firstName,
             lastName,
             email, 
             title, 
             content
        });
        await newMessage.save();

        // Send email notification to admin
        const adminEmail = 'docmate24@gmail.com';
        // const transporter = nodemailer.createTransport({
        //     // Specify your email service provider
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.user,
        //         pass: process.env.emailPassword
        //     }
        // });

        // const mailOptions = {
        //     from: 'your_email@gmail.com',
        //     to: adminEmail,
        //     subject: 'New Message from Patient',
        //     text: `Email from ${firstName} ${lastName} : ${content}`
        // };

        receiveMail({
            email: email, 
            subject: title, 
            text: `Email from ${firstName} ${lastName} : ${content}`
        });
        //console.log('Email sent:', info.response);


        return res.status(200).send('Message sent successfully');
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Error sending message');
    }
};
}

module.exports= message
