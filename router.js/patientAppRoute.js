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
patientAppointmentRouter.put("/reschedule-app/:appointmentId", authenticate, rescheduleAppointment)
patientAppointmentRouter.post('/confirm-payment', authenticate,authenticate, confirmedPayment) 
patientAppointmentRouter.get('/appointment-history/:patientId', authenticate, viewPatientAppointments)    
patientAppointmentRouter.get('/one-app-req/:appointmentId', viewOneAppointRequest)     
patientAppointmentRouter.get('/all-app-req', getAllRequest)  
patientAppointmentRouter.get('/app-details/:appointmentId', authenticate, viewAppointmentDetails)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
//patientAppointmentRouter.post('/updates-profile', updatesProfile)



module.exports= patientAppointmentRouter
