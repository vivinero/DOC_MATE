const notificationRouter = require("express").Router()

const { getAllNotification } = require("../controllers/notificationController")



notificationRouter.post("/getall", getAllNotification)



module.exports = notificationRouter