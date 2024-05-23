const express = require('express');
const patientAppointmentRouter = express.Router();

const { 
    handleAppointmentRequest,
    confirmedPayment,
    viewPatientAppointments,
    rescheduleAppointment}= require("../controllers/appointment")
const {authenticate} = require('../middleware/authentication')

;
patientAppointmentRouter.post("/request/:adminId", authenticate,handleAppointmentRequest );
patientAppointmentRouter.post("/reschedule-app/:appointmentId", authenticate, rescheduleAppointment)
patientAppointmentRouter.post('/confirm-payment', authenticate, confirmedPayment) 
patientAppointmentRouter.get('/appointment-history/:patientId', viewPatientAppointments)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
//patientAppointmentRouter.post('/updates-profile', updatesProfile)



module.exports= patientAppointmentRouter
