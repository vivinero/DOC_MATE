const paymentRouter = require("express").Router()
const {adminAuthenticate} = require("../middleware/adminAuth")

const { checkPaymentStatus } = require("../controllers/adminControl")

paymentRouter.get("/payment-status", adminAuthenticate, checkPaymentStatus) 

module.exports = paymentRouter

