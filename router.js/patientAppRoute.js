const express = require('express');
const router = express.Router();

const { requestPatientAppointment}= require("../controllers/appointment")
const {authenticate} = require('../middleware/authentication')

router.post("/request/:id", authenticate, requestPatientAppointment );

module.exports= router
