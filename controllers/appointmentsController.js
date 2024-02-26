const appointmentsModel = require("../models/appointmentsModel")
// const sendEmail = require("../creatAppMail")
const getUserDetailsById = require("../utils/patientID")
const viewApp = require("../createAppMail");
const adminModel = require("../models/adminModel");
const sendMail = require("../middleware/email");
const generateDynamicEmail = require("../createAppMail");

const Appointment = require("../models/appointmentsModel");
const { validateCreateAppointment, validateRescheduleAppointment } = require('../middleware/createAppVal'); // Import the validation functions
const { id } = require("@hapi/joi/lib/base");

exports.createAppointment = async (req, res) => {
    try {
        // Validate the request body for creating an appointment
        const { error: createError } = validateCreateAppointment(req.body);
        if (createError) {
            return res.status(400).json({ 
                message: createError.details[0].message
            });
        }

        // Check if admin exists in the database
        const { patientName, date, time } = req.body;

        // Define reschedule options
        const rescheduleOptions = [
            { day: 'Tuesday', time: '2pm', doctor: 'Henry' },
            { day: 'Thursday', time: '2pm', doctor: 'Michael' },
            { day: 'Friday', time: '2pm', doctor: 'Godwin'}
        ];

        // Create the appointment
        const createApp = await appointmentsModel.create({ patientName, patientId, date, time});

        // Get patient details
        const patientname = await userModel.findOne();
        if (!patient) {
            return res.status(404).json({ 
                message: `Patient with this ID: ${patientId} was not found`
            });
        }

        // Send email to the patient with appointment details
        const subject = "PLEASE VIEW APPOINTMENT";
        const link = `${req.protocol}://${req.get("host")}/viewApp/${createApp.id}`;
        const html = viewApp(link, patientDetails.firstName);
        await sendMail({
            email: patientDetails.email,
            subject: subject,
            html: html
        });

        // Success message
        res.status(200).json({
            message: `Dear ${createApp.patientName}, your appointment has been created successfully. Check your email for details.`,
            appointment: createApp
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: error.message
        });
    }
};



exports.confirmAppointment = async (req, res) => {
    try {
        const {id} = req.params
        const appointment = await appointmentsModel.findById(id)

        console.log(id)
        
        // await appointment.save()
        if (!appointment) {
            return res.status(404).json({
                message: "Unable to find appointment"
            })
        }
        // if (appointment) {
        //     return res.status(404).json({
        //         message: "This appointment has already been confirmed"
        //     })
        // }
        // console.log(appointmentId)
        const patientDetails = await getUserDetailsById(appointment.patientId)

        //mapping mongoose id
        appointment.appointmentId = appointment._id
        await appointment.save()


        appointment.status = "confirmed"
        await appointment.save()

        //send a mail to the patient on the appointment they have booked to see a specialist
        const subject = "CONFIRMED APPOINTMENT";
        const link = `${req.protocol}://${req.get("host")}/confirmApp/${appointment.id}`
        const html = viewApp(link, appointment.firstName);
        await sendMail({
            email: patientDetails.email,
            subject: subject,
            html: html
        });

        await appointment.save();

        res.status(200).json({
            message: `Patient with this ${appointment.patientName}, has been confirmed successfully`,
            appointment
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}


// Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
    try {
        // Validate the request body for rescheduling an appointment
        const { error } = validateRescheduleAppointment(req.body);
        if (error) {
            return res.status(400).json({
                 message: error.details[0].message
                });
        }

        // Check if the user is authenticated and authorized as a hospital
        if (!req.user || !req.user.isHospital) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        // Retrieve appointment ID from request parameters
        const { id } = req.params;

        // Find the appointment in the database
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ 
                message: "Appointment not found"
            });
        }

        // Check if the appointment belongs to the hospital making the request
        if (appointment.hospital.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: "Forbidden: You can only reschedule your own appointments"
            });
        }

        // Update the appointment with new details
        appointment.date = req.body.date;
        appointment.time = req.body.time;
        appointment.specialist = req.body.specialist;

        // Save the updated appointment
        await appointment.save();

        // Send response
        res.status(200).json({ 
            message: "Appointment rescheduled successfully",
            appointment 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Internal server error"
         });
    }
};


exports.getAllApp = async (req, res) => {
    try {
        const appointments = await appointmentsModel.find()
        if (!appointments) {
            return res.status(404).json({
                message: "Unable to find appointments"
            })
        }
        if (appointments.length === 0) {
            return res.status(200).json({
                message: "There are no available appointments"
            })
        }
        res.status(200).json({
            message: `There are ${appointments.length} appointments in this data`,
            appointments
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.getOneApp = async (req, res) => {
    try {
        const { id } = req.params
        const appointment = await appointmentsModel.findById(id)
        if (!appointment) {
            return res.status(404).json({
                message: `Opps! unable to find patient appointment`
            })
        }
        return res.status(200).json({
            message: `Yeppi! user with ${appointment.patientName} has been found`,
            appointment
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.getAllPendingAppointments = async (req, res) => {
    try {
        const pendingAppointments = await appointmentsModel.find({ status: 'pending' });
        if (!pendingAppointments) {
            return res.status(404).json({
                message: "Unable to get all pending appointment"
            })
        }
        if (pendingAppointments.length === 0) {
            return res.status(200).json({
                message: "There are no available pending appointments"
            })
        }
        res.status(200).json({
            message: `There are ${pendingAppointments.length} pending appointments`,
            pendingAppointments
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getAllConfirmedAppointments = async (req, res) => {
    try {
        const confirmAppointments = await appointmentsModel.find({ status : "confirmed"});
        if (!confirmAppointments) {
            return res.status(404).json({
                message: "Unable to get all confirmed appointment",
            })
        }
        if (confirmAppointments.length === 0) {
            return res.status(200).json({
                message: "There are no available confirmed appointments"
            })
        }
        return res.status(200).json({
            message: `There are ${confirmAppointments.length} confirmed appointments`,
            confirmAppointments
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.getAllRescheduleAppointments = async (req, res) => {
    try {
        const rescheduleApp = await appointmentsModel.find({ status: "rescheduled" })
        console.log(rescheduleApp)

        if (!rescheduleApp) {
            return res.status(404).json({
                message: "Unable to get all rescheduled appointment"
            })
        }
        if (rescheduleApp.length === 0) {
            return res.status(200).json({
                message: "There are no available rescheduled appointments"
            })
        }
        return res.status(200).json({
            message: `There are ${rescheduleApp.length} rescheduled appointments`,
            rescheduleApp
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}


exports.deleteAppointment = async (req, res) => {
    try {
        const id = req.body.id
        const findApp = await appointmentsModel.findByIdAndDelete(id)
        if (!findApp) {
            return res.status(404).json({
                message: "Unable to find appointment to be deleted"
            })
        }
        return res.status(200).json({
            message: `Successfully deleted appointment with ${findApp.id}`
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

