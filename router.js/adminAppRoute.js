const adminAppointmentRouter = require("express").Router()

const { createAppointment, confirmAppointment, getAllApp,
    getOneApp, deleteAppointment, getAllPendingAppointments, getAllConfirmedAppointments, getAllRescheduleAppointments, rescheduleAppointment } = require("../controllers/appointmentsController")
const { adminAuthenticate } = require("../middleware/adminAuth")

adminAppointmentRouter.post("/createAppointment/:id", adminAuthenticate, createAppointment)
adminAppointmentRouter.put("/confirmappointment/:id", confirmAppointment)
adminAppointmentRouter.post("/reschedule/:id", rescheduleAppointment)
adminAppointmentRouter.get("/allappointment", getAllApp)
adminAppointmentRouter.get("/oneappointment/:id", getOneApp)
adminAppointmentRouter.get("/deleteappointment/:id", deleteAppointment)
adminAppointmentRouter.get("/pendingappointment/", getAllPendingAppointments)
adminAppointmentRouter.get("/getconfirmedappointments/", getAllConfirmedAppointments)
adminAppointmentRouter.get("/getrescheduleappointments/", getAllRescheduleAppointments)

module.exports = adminAppointmentRouter