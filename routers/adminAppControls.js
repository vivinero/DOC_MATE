const adminAppointmentRouter = require("express").Router()

const { createAppointment, confirmAppointment, getAllApp, rescheduleApp, 
    getOneApp, deleteAppointment, getAllPendingAppointments, getAllConfirmedAppointments,  getAllRescheduleAppointments } = require("../controllers/appointmentsController")

appointmentRouter.post("/createAppointment", createAppointment)
appointmentRouter.put("/confirmappointment/:id", confirmAppointment)
appointmentRouter.post("/reschedule/:id", rescheduleApp)
appointmentRouter.get("/allappointment", getAllApp)
appointmentRouter.get("/oneappointment/:id", getOneApp)
appointmentRouter.get("/deleteappointment/:id", deleteAppointment)
appointmentRouter.get("/pendingappointment/", getAllPendingAppointments)
appointmentRouter.get("/getconfirmedappointments/", getAllConfirmedAppointments)
appointmentRouter.get("/getrescheduleappointments/", getAllRescheduleAppointments)

module.exports = adminAppointmentRouter