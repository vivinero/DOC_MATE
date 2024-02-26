const express = require('express');
const router = express.Router();

const {handleAppointmentRequest,  rescheduleAppointment}= require("../controllers/appointment")

router.post("/request",handleAppointmentRequest );
router.put("/reschedule", rescheduleAppointment)

module.exports= router
