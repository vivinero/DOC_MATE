const adminAppointmentRouter = require("express").Router()

const { createAppointment,  getAllApp,
    getOneApp, deleteAppointment, getAllPendingAppointments, getAllConfirmedAppointment, rescheduleAppointment, getAllPending, getAllPendingReschedule } = require("../controllers/appointmentsController")
const { adminAuthenticate } = require("../middleware/adminAuth")

adminAppointmentRouter.post("/createAppointment/:id", adminAuthenticate, createAppointment)
adminAppointmentRouter.post("/reschedule/:id", adminAuthenticate, rescheduleAppointment)
adminAppointmentRouter.get("/all-appointments", getAllApp)
adminAppointmentRouter.get("/oneappointment/:id", getOneApp)
adminAppointmentRouter.get("/deleteappointment/:id", deleteAppointment)
adminAppointmentRouter.get("/pendingappointment/", getAllPendingAppointments)
adminAppointmentRouter.get("/allpending/", getAllPending)
adminAppointmentRouter.get("/all-pending-reschedule/", getAllPendingReschedule)

adminAppointmentRouter.get("/get-all-confirmed/", getAllConfirmedAppointment)
module.exports = adminAppointmentRouter