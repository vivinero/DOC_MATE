const express = require('express');
const patientAppointmentRouter = express.Router();

const { 
    handleAppointmentRequest,
    confirmedPayment,
    viewPatientAppointments,
    rescheduleAppointment,
    viewOneAppointRequest,
    getAllRequest,
    viewAppointmentDetails
}= require("../controllers/appointment")
const {authenticate} = require('../middleware/authentication')

;
patientAppointmentRouter.post("/request/:adminId", authenticate,handleAppointmentRequest );
patientAppointmentRouter.post("/reschedule-app/:appointmentId", authenticate, rescheduleAppointment)
patientAppointmentRouter.post('/confirm-payment', authenticate, confirmedPayment) 
patientAppointmentRouter.get('/appointment-history/:patientId', viewPatientAppointments)    
patientAppointmentRouter.get('/one-app-req/:appointmentId', viewOneAppointRequest)     
patientAppointmentRouter.get('/all-app-req', getAllRequest)  
patientAppointmentRouter.get('/app-details/:appointmentId', viewAppointmentDetails)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
//patientAppointmentRouter.post('/updates-profile', updatesProfile)



module.exports= patientAppointmentRouter
