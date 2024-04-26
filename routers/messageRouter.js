const express = require('express');

const router = express.Router();

const { sendMessage, getMessages, } = require('../controllers/messagesController');
const { authenticate, } = require("../middleware/authentication");

//endpoint to send message with the bot
router.post('/messages', authenticate, sendMessage);

//endpoint to view all messages with the bot
router.get('/get-messages', authenticate, getMessages);



module.exports = router;