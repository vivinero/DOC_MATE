const express = require('express');
const patientAppointmentRouter = express.Router();

const { 
    handleAppointmentRequest,
    confirmedPayment,
    rescheduleAppointment}= require("../controllers/appointment")
const {authenticate} = require('../middleware/authentication')

;
patientAppointmentRouter.post("/request/:userId", authenticate,handleAppointmentRequest );
patientAppointmentRouter.put("/reschedule-app/:appointmentId",authenticate, rescheduleAppointment)
patientAppointmentRouter.post('/confirm-payment',authenticate, confirmedPayment)
//patientAppointmentRouter.post('/updates-profile', updatesProfile)



module.exports= patientAppointmentRouter
