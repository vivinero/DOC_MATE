// controllers/appointmentController.js

const appointmentModel = require('../models/appModel');
const adminModel = require('../models/adminModel')
const nodemailer = require('nodemailer');
const userModel = require("../models/userModel")
const requestModel = require("../models/requestModel")
const cron = require('cron');
const sendEmail = require("../email")
const notificationModel = require("../models/notificationModel")
const { validateDateTime } = require("../middleware/validator");
const sendMail = require('../middleware/email');
const viewApp = require('../createAppMail')
const { notify } = require('../router.js/patientAppRoute');


const requestPatientAppointment = async(req,res)=>{
  try {
    
    const userId = req.user.userId
    const user = await userModel.findById(userId)
    
    const hospitalId = req.params.id
    // find the hospital
    const hospital = await adminModel.findById(hospitalId)
    if (!hospital) {
      return res.status(400).json({message:"hospital unavailable"})
    }
    // get the apointment details
    const {patientName, lastVisit, lastDiagnosis, presentSymptoms} = req.body

    const request = await requestModel.create({
      patientName,
      lastVisit,
      lastDiagnosis,
      presentSymptoms,
      user:user._id
    })


    if(!request){
      return res.status(403).json({
        message: "Cannot request an appointment"
      })
    }

    hospital.appointment.push(request._id)
    // user._id = request.user 

    await hospital.save()
    await user.save()

    // Send email to the patient with appointment details
    const subject = "Patient's Appointment Request";
    const link = `${req.protocol}://${req.get("host")}/viewApp/${user.id}`;
    const html = viewApp(link, hospital.hospitalName); // Assuming you have access to patient's first name
    await sendMail({
        email: hospital.email,
        subject: subject,
        html: html
    });

    // push request to notification
    if(request){
    const message = `${patientName} requested an appointment. Click to view`
    const notify = new notificationModel({
      user:hospital._id,
      message
    })
  }

  res.status(200).json({
    message: "You have successfully requested an appointment"
  })
    
  } catch (error) {
    res.status(500).json({message:error.message})
  }
}
// Create an instance of AdminNotification
//const adminNotification = new AdminNotification();

// Logic for handling appointment requests
// const handleAppointmentRequest = async (req, res) => {
//   const { error } = validateDateTime (req.body);
//         if (error) {
//             res.status(500).json({
//                 message: error.details[0].message
//             })
//             return;
//         } else {
//   try {
//     const userId = req.params.userId;
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     // Extract appointment details from request body
//     const data = {
//       fullName: req.body.fullName.toLowerCase(),
//       date: req.body.date,
//       patientEmail: req.body.patientEmail.toLowerCase(),
//       //specialist: req.body.specialist.toLowerCase(),
//     };
//     const databaseName = user.firstName + " " + user.lastName;
//     if (data.fullName !== databaseName) {
//       return res.status(400).json({
//         message: "User not in the database"
//       });
//     }

//     // Check if the appointment date is in the future
//     const currentDate = new Date();
//     const appointmentDate = new Date(data.date);
//     if (appointmentDate < currentDate) {
//       return res.status(400).json({
//         message: "Appointment date must be in the future"
//       });
//     }


//     // Create instance of AppointmentModel and store the request
//     const appointmentRequest = new appointmentModel({
//       fullName: data.fullName,
//         patientEmail: data.patientEmail,
//          date: data.date });
//     // const isNewAppointment = (appointmentRequest) => {
//     //   //Implement logic to check if it's a new appointment
//     //   const currentDate = new Date();

//     //   //convert the dateRequested string to a Date object
//     //   const dateRequested = new Date(appointmentRequest.date);
//     //   // For example, you could check if the dateRequested is in the future
//     //   return dateRequested > currentDate; // Placeholder logic, replace with your implementation
//     // }
//     appointmentRequest.createdAppId = appointmentRequest._id

//     await appointmentRequest.save();

//     const adminNotification = await notificationModel.create({ fullName: data.fullName, patientEmail: data.patientEmail, date: data.date });
//     if (!adminNotification) {
//       return res.status(404).json({
//         message: "Notification not sent"

//       })
//     }

//     // // Check if it's a new appointment
//     // if (isNewAppointment(appointmentRequest)) {
//     //   //       // Notify admin
//     //   notifyAdmin(appointmentRequest);
//     // }

//     // Notify admin
//     //notifyAdmin(appointmentRequest);

//     return res.status(201).json({ message: 'Appointment request sent successfully', appointment: appointmentRequest });
//   } catch (error) {
//     return res.status(500).json({ error: "Internal server error " + error.message });
//   }
// };
// }

// // Function to notify admin
// const notifyAdmin = (appointmentRequest) => {
//   // Add the appointment request to the AdminNotification
//   adminNotification.addRequest(appointmentRequest);
//   console.log('Admin notified of new appointment:', appointmentRequest);
// };

const getAllRequest = async (req, res) => {
  try {
    const notification = await notificationModel.find().sort({createdAt: -1});
    if (!notification) {
      res.status(404).json({
        message: "No request found",
      });
    } else {
      res.status(201).json({
        message: "All appointment request.",
        data: notification,
        totalNumberOfAppointmentRequests: notification.length,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error " + error.message });
  }
};

const viewOneAppointRequest = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;

    const request = await notificationModel.findById(appointmentId);
    if (!request) {
      return res.status(404).json({
        message: 'The appointment request not found'
      })
      return;
    } else {
      return res.status(200).json({
        message: `The appointment request with id: ${appointmentId} found`,
        data: request
      })
    }
  } catch (err) {
    res.status(500).json({
      message: "internal server error: " + err.message
    })
  }

}


const deleteRequest = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const request = await notificationModel.findById(appointmentId);
    if (!request) {
      return res.status(404).json({
        message: 'The appointment request not found'
      })

    }

    await notificationModel.findByIdAndDelete(appointmentId)
    return res.status(200).json({
      message: `The appointment request with appointmentId: ${appointmentId} deleted successfully`,
      data: request
    })

  } catch (err) {
    res.status(500).json({
      message: "Internal server  error: " + err.message,
    })
  }
}



// const requestAppointment = async (req, res) => {
  
//   try {
//     const userId = req.params.userId
//     const user = await userModel.findById(userId)
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found"
//       })
//     }

//     // Extract appointment details from request body
//     const { patientName, date, patientEmail } = req.body;
//     const databaseName = user.firstName + " " + user.lastName
//     if (patientName !== databaseName) {
//       return res.status(400).json({
//         message: "User not in the database"
//       })
//     }

//     const bookedDate = await appointmentModel.findOne({ date })
//     if (bookedDate) {
//       return res.status(400).json({
//         message: "Date have been booked already try another date"
//       })
//     }

//     // Create new appointment
//     const appointment = new appointmentModel({
//       patientName,
//       patientEmail,
//       date

//     });
//         // Check if the appointment date is in the future
//         const currentDate = new Date();
//         const appointmentDate = new Date(date);
//         if (appointmentDate < currentDate) {
//           return res.status(400).json({
//             message: "Appointment date must be in the future"
//           });
//         }

//     // Save appointment to database
//     await appointment.save();
//     user.appointment.push(appointment)
//     await user.save()
//     // totalRequests++;

//     return res.status(201).json({ message: 'Appointment request sent successfully', appointment });
//   } catch (error) {
//     return res.status(500).json({ error: "Internal server error " + error.message });
//   }
// };


const cancelAppointment = async (req, res) => {

  try {
    const appointmentId = req.params.appointmentId;
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment status to "cancelled"
    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rescheduleAppointment = async (req, res) => {

  try {
    const appointmentId = req.params.appointmentId;

    const data = {
      date: req.body.date,
    }
    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment with the ID not found"
      })
    }
    // Check if the appointment date is in the future
    const currentDate = new Date();
    const appointmentDate = new Date(data.date);
    if (appointmentDate < currentDate) {
      return res.status(400).json({
        message: "Appointment date must be in the future"
      });
    }


    const newDate = await appointmentModel.findByIdAndUpdate(appointmentId, data, { new: true })
    if (!newDate) {
      return res.status(404).json({
        message: "Appointment with the ID unable to update"
      })
    }

    // const bookedDate = await appointmentModel.findOne({date: data.date})
    // if (bookedDate) {
    //   return res.status(400).json({
    //     message: "Date have been booked already try another date"
    //   })
    // }


    // if (!appointment) {
    //   return res.status(404).json({ message: 'Appointment not found' });
    // }

    //appointment.status = "Rescheduled"

    // // Update appointment date/time
    // appointment.date = newDate;
    //await appointment.save();

    return res.status(200).json({ message: 'Appointment rescheduled successfully', newDate });
  } catch (error) {
    ('Error rescheduling appointment:', error);
    return res.status(500).json({ error: 'Internal server error' + error.message });
  }
};

// const sendAppointmentReminders = async () => {
// Logic to retrieve upcoming appointments and send reminders using Twilio

// const twilio = require('twilio');

// Initialize Twilio client with your Account SID and Auth Token
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// const client = twilio(accountSid, authToken);

// Function to send reminder message
// async function sendReminder(appointment) {
// const message = `Hi ${appointment.patientName}, this is a reminder for your appointment tomorrow at ${appointment.date}.`;

// try {
//   await client.messages.create({
//     body: message,
//     from: twilioPhoneNumber,
//     to: appointment.patientEmail
//   });
//   console.log(`Reminder message sent for appointment ID ${appointment._id}`);
// } catch (error) {
//   console.error(`Error sending reminder message for appointment ID ${appointment._id}:`, error);
// }
// }

// // Function to retrieve upcoming appointments and send reminders
// async function sendAppointmentReminders() {
// const today = new Date();
// const tomorrow = new Date(today);
// tomorrow.setDate(tomorrow.getDate() + 1);

// try {
//   const upcomingAppointments = await appointmentModel.find({ date: tomorrow });
//   for (const appointment of upcomingAppointments) {
//     await sendReminder(appointment);
//   }
// } catch (error) {
//   console.error('Error retrieving upcoming appointments:', error);
// }
// }

// // Schedule the reminder function to run daily using cron or other scheduler
// cron.schedule('0 8 * * *', () => {
// sendAppointmentReminders();
// });

// };

// const scheduleAppointmentReminders = () => {
//   const cronJob = cron.schedule('0 8 * * *', () => {
//       sendAppointmentReminders();
//   });

//   cronJob.start();
// };

const transporter = nodemailer.createTransport({
  service: process.env.service,
  auth: {
    user: process.env.user,
    pass: process.env.emailPassword
  }
});

const sendAppointmentReminders = async (appointmentId) => {
  try {
    const checkDate = await appointmentModel.findById(appointmentId);
    if (!checkDate) {
      console.error("Appointment not found for ID:", appointmentId);
      return;
    }

    const dueDate = new Date(checkDate.date);
    const beforeDate = dueDate.getTime() - (1000 * 60 * 60 * 24);
    ///const beforeDate = "2024-02-14"

    if (beforeDate) {
      sendEmail({
        email: checkDate.patientEmail,
        text: `Dear ${checkDate.patientName}, This is a reminder for your upcoming appointment at ${checkDate.date}.Best regards, DocMate`,
        subject: "Appointment Reminder"
      });
    }
  } catch (error) {
    console.error('Error retrieving upcoming appointments:', error.message);
  }
};

// const sendReminderEmail = async (appointment) => {
//   const mailOptions = {
//     from: process.env.service,
//     to: appointment.patientEmail,
//     subject: 'Appointment Reminder',
//     text: `Dear ${appointment.patientName},This is a reminder for your upcoming appointment at ${appointment.date}.Best regards, DocMate`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Reminder email sent to ${appointment.patientEmail}`);
//   } catch (error) {
//     console.error('Error sending reminder email:', error);
//   }
// };




module.exports = {
  // requestAppointment,
  sendAppointmentReminders,
  cancelAppointment,
  // rescheduleAppointment,
  // handleAppointmentRequest,
  getAllRequest,
  viewOneAppointRequest,
  deleteRequest,
  requestPatientAppointment,
  // scheduleAppointmentReminders

}
