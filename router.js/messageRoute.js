const express = require("express")
const contactUs = express.Router()
const message = require("../controllers/messageController")


contactUs.post("/send-message", message)

module.exports = contactUs
