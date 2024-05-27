const appointmentsModel = require("../models/adminAppointment.js")
const rescheduleModel = require("../models/reschedule.js")
// const sendEmail = require("../creatAppMail")
const getUserDetailsById = require("../utils/patientID")
const viewApp = require("../createAppMail");
const adminModel = require("../models/adminModel");
const sendMail = require("../middleware/email");
const generateDynamicEmail = require("../createAppMail");
const userModel = require("../models/userModel.js")
const appointmentModel = require("../models/appModel.js")
const Appointment = require("../models/adminAppointment.js");
const { validateCreateAppointment, validateConfirmAppointment, validateRescheduleAppointment } = require('../middleware/createAppVal'); // Import the validation functions
const { validateRescheduleOptions } = require('../middleware/createAppVal.js');

const { id } = require("@hapi/joi/lib/base");

// const createAppointment = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const id = req.params.id;

//         if (!userId) {
//             return res.status(403).json({
//                 message: "No Hospital not found"
//             });
//         }

//         // Validate the request body for creating an appointment
//         const { error: createError } = validateCreateAppointment(req.body);
//         if (createError) {
//             return res.status(400).json({
//                 message: createError.details[0].message
//             });
//         }

//         // Extract necessary details from the request body
//         const { doctorName, date, fee, speciality, time } = req.body;
        
//         // Validate appointment date
//         const currentDate = new Date();
//         const appointmentDate = new Date(date);
//         if (appointmentDate <= currentDate) {
//             return res.status(400).json({ message: 'Appointment date must be in the future' });
//         }

//         const app = await appointmentModel.findById(id);
//         if (!app) {
//             return res.status(404).json({
//                 message: `Patient request ID: ${id} was not found`
//             });
//         }

//         app.status = "Confirmed";
//         await app.save();

//         // Create the appointment
//         const createApp = await appointmentModel.create({
//             doctorName: doctorName.toLowerCase(),
//             fee: fee,
//             date: date,
//             time: time,
//             speciality: speciality,
//             patient: app.patient,
//             status: app.status
//         });

//         //createApp.status = app.status;

//         // Send email to the patient with appointment details
//         const subject = "Your Appointment Details";
//         const link = `${req.protocol}:`//${req.get("host")}/viewApp/${createApp.id};
//         const html = viewApp(link, app.firstName); // Assuming you have access to patient's first name
//         await sendMail({
//             email: app.patientEmail,
//             subject: subject,
//             html: html
//         });

//         //await createApp.save();

//         // Success message
//         res.status(200).json({
//             message: `Patient appointment has been created sucessfully.`,
//             appointment: createApp
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };

const createAppointment = async (req, res) => {
    try {
        const hospitalId = req.user.userId;
        const id = req.params.id;
        

        if (!hospitalId) {
            return res.status(403).json({
                message: "No Hospital not found"
            });
        }

        // Validate the request body for creating an appointment
        const { error: createError } = validateCreateAppointment(req.body);
        if (createError) {
            return res.status(400).json({
                message: createError.details[0].message
            });
        }

        // Extract necessary details from the request body
        const { doctorName, date, fee, speciality, time } = req.body;
        
        // Validate appointment date
        const currentDate = new Date();
        const appointmentDate = new Date(date);
        if (appointmentDate <= currentDate) {
            return res.status(400).json({ message: 'Appointment date must be in the future' });
        }

        const app = await appointmentModel.findById(id);
        if (!app) {
            return res.status(404).json({
                message: `Patient request ID: ${id} was not found`
            });
        }

        app.status = "Confirmed";
        await app.save();

        // Create the appointment
        const createApp = await appointmentModel.create({
            doctorName: doctorName.toLowerCase(),
            fee: fee,
            date: date,
            time: time,
            speciality: speciality,
            patient: app.patient,
            status: app.status,
            appointmentId : app._id
        });
        createApp.hospital.push(hospitalId)
        await createApp.save()

        // Send email to the patient with appointment details and link to the app
        const subject = "Your Appointment Details";
        const link = `https://docmate-tau.vercel.app/#/patient/patientAppointmentReview/{createApp._id}`; // Modify this URL according to your requirement
        const html = viewApp(link, app.firstName); // Assuming you have access to patient's first name
        await sendMail({
            email: app.patientEmail,
            subject: subject,
            html: html
        });

        // Success message
        res.status(200).json({
            message: `Patient appointment has been created successfully.`,
            appointment: createApp
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }
};


// const rescheduleAppointment = async (req, res) => {
//     try {
//         const appointmentId = req.params.id;
//         const userId = req.user.userId;

//         if (!userId) {
//             return res.status(403).json({
//                 message: `Hospital not found`
//             });
//         }

//         // Validate the request body for rescheduling options
//         const { error: optionsError } = validateRescheduleOptions(req.body);
//         if (optionsError) {
//             return res.status(400).json({
//                 message: optionsError.details[0].message
//             });
//         }

//         // Extract necessary details from the request body
//         const { firstAvailability, secondAvailability, thirdAvailability } = req.body;

//         // Find the appointment by ID
//         const appointment = await appointmentModel.findById(appointmentId);

//         if (!appointment) {
//             return res.status(404).json({
//                 message: "Appointment not found"
//             });
//         }

//         // Update the appointment based on the selected availability slot
//         let newDate;
//         let newTime;

//         switch (true) {
//             case firstAvailability === 1:
//                 newDate = appointment.date;
//                 newTime = '9:00 AM';
//                 break;
//             case firstAvailability === 2:
//                 newDate = appointment.date;
//                 newTime = '11:00 AM';
//                 break;
//             case firstAvailability === 3:
//                 newDate = appointment.date;
//                 newTime = '1:00 PM';
//                 break;
//             case secondAvailability === 1:
//                 newDate = appointment.date;
//                 newTime = '9:00 AM'; // Example time for the second slot
//                 break;
//             case secondAvailability === 2:
//                 newDate = appointment.date;
//                 newTime = '11:00 AM'; // Example time for the second slot
//                 break;
//             case secondAvailability === 3:
//                 newDate = appointment.date;
//                 newTime = '1:00 PM'; // Example time for the second slot
//                 break;
//             case thirdAvailability === 1:
//                 newDate = appointment.date;
//                 newTime = '9:00 AM'; // Example time for the third slot
//                 break;
//             case thirdAvailability === 2:
//                 newDate = appointment.date;
//                 newTime = '11:00 AM'; // Example time for the third slot
//                 break;
//             case thirdAvailability === 3:
//                 newDate = appointment.date;
//                 newTime = '1:00 PM'; // Example time for the third slot
//                 break;
//             default:
//                 return res.status(400).json({
//                     message: "Invalid reschedule option"
//                 });
//         }

//         // Update appointment details
//         appointment.date = newDate;
//         appointment.time = newTime;
//         appointment.status = 'Reschedule'; // Update status
//         await appointment.save();

//         const subject = "Choose from the Appointment Options";
//         const link = `${req.protocol}://${req.get("host")}/viewApp/${appointment.id}`;
//         const html = viewApp(link, appointment.firstName); // Assuming you have access to patient's first name
//         await sendMail({
//             email: appointment.patientEmail,
//             subject: subject,
//             html: html
//         });

//         // Success message
//         res.status(200).json({
//             message: `Appointment rescheduled successfully`,
//             appointment: appointment
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };

const rescheduleAppointment = async (req, res) => {
    try {
        const {id} = req.params
        const {firstAvailability, secondAvailability, thirdAvailability} = req.body
        const appointment = await appointmentModel.findById(id)
        if (!appointment) {
            return res.status(404).json({
                message: "Unable to find appointment"
            })
        }

        const reschedule = await rescheduleModel.create({
            firstAvailability,
            secondAvailability,
            thirdAvailability,
            appointment:appointment._id
        })

        // appointment.status = "Pending"
        // await appointment.save()

        res.status(200).json({
            message:"success"
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
} 





const getAllApp = async (req, res) => {
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

const getOneApp = async (req, res) => {
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

const deleteAppointment = async (req, res) => {
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

const getAllPendingAppointments = async (req, res) => {
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

const getAllPending = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({status: "Pending"})
        if (!appointments) {
            return res.status(404).json({
                message: "Unable to find appointments"
            })
        }
        if (appointments.length === 0) {
            return res.status(200).json({
                message: "There are no pending appointments"
            })
        }
        res.status(200).json({
            message: `There are ${appointments.length} pending appointments in this data`,
            appointments
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const getAllPendingReschedule=async (req, res) => {
    try {
        const appointments = await appointmentModel.find({status: "Pending reschedule"})
        if (!appointments) {
            return res.status(404).json({
                message: "Unable to find appointments"
            })
        }
        if (appointments.length === 0) {
            return res.status(200).json({
                message: "There are no pending reschedule appointments"
            })
        }
        res.status(200).json({
            message: `There are ${appointments.length} pending reschedule appointments in this data`,
            appointments
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const getAllConfirmedAppointment = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({status: "Confirmed"})
        if (!appointments) {
            return res.status(404).json({
                message: "Unable to find appointments"
            })
        }
        if (appointments.length === 0) {
            return res.status(200).json({
                message: "There are no pending appointments"
            })
        }
        res.status(200).json({
            message: `There are ${appointments.length} confirmed appointments in this data`,
            appointments
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}




// const getAllRescheduleAppointments = async (req, res) => {
//     try {
//         const rescheduleApp = await appointmentsModel.find({ status: "reschedule" })
//         console.log(rescheduleApp)

//         if (!rescheduleApp) {
//             return res.status(404).json({
//                 message: "Unable to get all rescheduled appointment"
//             })
//         }
//         if (rescheduleApp.length === 0) {
//             return res.status(200).json({
//                 message: "There are no available rescheduled appointments"
//             })
//         }
//         return res.status(200).json({
//             message: `There are ${rescheduleApp.length} rescheduled appointments`,
//             rescheduleApp
//         })
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// }





module.exports={
    createAppointment, 
     getAllApp,
    getOneApp,
     deleteAppointment, 
     getAllPendingAppointments, 
     rescheduleAppointment,
     getAllPending,
     getAllPendingReschedule,
     getAllConfirmedAppointment
    

}