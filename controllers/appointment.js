// controllers/appointmentController.js

const appointmentModel = require('../models/appModel');
const adminModel = require('../models/adminModel')
const nodemailer = require('nodemailer');
const patientModel = require("../models/userModel")
//const requestModel = require("../models/requestModel")
const cron = require('cron');
const sendEmail = require("../email")
const notificationModel = require("../models/notificateModel")
const { validateAppointmentRequest } = require("../middleware/validator");
const sendMail = require('../middleware/email');
const viewApp = require('../createAppMail')
const mongoose = require('mongoose');


// const checkProfile = async (userId) => {
//   try {
//     const user = await patientModel.findById(userId);
//     return user && user.profileUpdated;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// };

// Logic for handling appointment requests
const handleAppointmentRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { error } = validateAppointmentRequest(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Extract appointment details from request body
    const data = {
      fullName: req.body.fullName,
      date: req.body.date,
      patientEmail: req.body.patientEmail,
      lastDiagnosis: req.body.lastDiagnosis,
      presentSymptoms: req.body.presentSymptoms,
      lastVisitation: req.body.lastVisitation
    };

    // Validate appointment date
    const currentDate = new Date();
    const appointmentDate = new Date(data.date);
    if (appointmentDate <= currentDate) {
      return res.status(400).json({ message: 'Appointment date must be in the future' });
    }

    // Check if the user exists in the database
    const user = await patientModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user's full name matches the database record
    const databaseName = user.firstName + ' ' + user.lastName;
    if (data.fullName !== databaseName) {
      return res.status(400).json({ message: 'Please, full name must correspond with first name and last name' });
    }

    // Create instance of AppointmentModel and store the request
    const appointmentRequest = await appointmentModel.create({
      fullName: user.firstName,
      patientEmail: data.patientEmail,
      date: data.date,
      lastDiagnosis: data.lastDiagnosis,
      presentSymptoms: data.presentSymptoms,
      lastVisitation: data.lastVisitation,
      paymentStatus: false,
      patient: userId
    });
    const adminId = req.params.adminId
    const admin = await adminModel.findById(adminId)

    // admin.patient.push(user._id)
    // admin.appointment.push(appointmentRequest._id)

    // await admin.save()
    if (!admin.patient) {
      admin.patient = [];
    }

    admin.patient.push(user.patientId);
    
    // if (!admin.appointment) {
    //   admin.appointment = [];
    // }
    admin.appointment.push(appointmentRequest);
    await admin.save()

    appointmentRequest.createdAppId = appointmentRequest._id;
    appointmentRequest.status = "Pending"
    await appointmentRequest.save();

    // Notify admin
    const adminNotification = await notificationModel.create({
      fullName: data.fullName,
      patientEmail: data.patientEmail,
      date: data.date,
      lastDiagnosis: data.lastDiagnosis,
      presentSymptoms: data.presentSymptoms,
      lastVisitation: data.lastVisitation
    });

    if (!adminNotification) {
      return res.status(404).json({ 
        message: 'Notification not sent'
      });
    }
    return res.status(201).json({ 
      message: 'Appointment request sent successfully', appointment: appointmentRequest
     });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error: ' + error.message
    });
  }
};

const confirmPayment = async (appointmentId) => {
  // Find the appointment by ID
  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
      //throw new Error('Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
  }

  // Update payment status to truez
  appointment.paymentStatus = true;
  await appointment.save();
};

  
 const confirmedPayment= async (req, res) => {
  const { appointmentId } = req.body;
  try {
      await confirmPayment(appointmentId);
      return res.status(200).json({ message: 'Payment confirmed' });
  } catch (error) {
      return res.status(400).json({ error:  "Internal server error " + error.message });
  }
};


const getAllRequest = async (req, res) => {
  try {
    const notification = await notificationModel.find().sort({createdAt: -1}).populate();
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

const viewAppointmentDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const appointmentId = req.params.appointmentId;

    if (!userId) {
      return res.status(403).json({
        message: "User not authorized"
      });
    }
    
    // Convert userId to ObjectId
    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // Find the appointment by ID and check if the appointment belongs to the user
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (appointment.patient.toString() !== userId) {
      return res.status(403).json({
        message: "You do not have permission to view this appointment"
      });
    }

    // Return appointment details
    return res.status(200).json({
      message: "Appointment details retrieved successfully",
      appointment
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error: ' + error.message
    });
  }
};


const viewPatientAppointments = async (req, res) => {
  try {
    // Extract patient ID from request parameters or authenticated user data
    const patientId = req.params.patientId;

    // Validate patient ID (you can also add more validation logic if needed)
    if (!patientId) {
      return res.status(400).json({
        message: "Patient ID is required"
      });
    }

    // Find all appointments for the patient
    const appointments = await appointmentModel.find({ patientId: patientId }).sort({ date: -1 });

    // Check if appointments are found
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        message: "No appointments found for this patient"
      });
    }

    // Return the appointments
    return res.status(200).json({
      message: "Appointments retrieved successfully",
      totalNumberOfAppointments: appointments.length,
      data: appointments
    });

  } catch (error) {
    // Handle any errors that occur
    return res.status(500).json({
      message: "Internal server error: " + error.message
    });
  }
};



const rescheduleAppointment = async (req, res) => {
  try {
    const userId = req.user.userId
    const appointmentId = req.params.appointmentId;
    if (!userId) {
      return res.status(403).json({
        message: "User not authorized"
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment with the ID not found"
      });
    }

    const { date, time, reasonForReschedule } = req.body;

    if (!date || !time || !reasonForReschedule) {
      return res.status(400).json({
        message: 'Please enter date, time, and reason for reschedule'
      });
    }

    // Set the appointment status to 'Pending Reschedule' and update date, time, and reason
    appointment.status = 'Pending Reschedule';
    appointment.date = date;
    appointment.time = time;
    appointment.reasonForReschedule = reasonForReschedule;

    // Save the updated appointment
    await appointment.save();

    // Create a notification for the admin with relevant information from the appointment
    const notifyAdmin = await notificationModel.create({
      fullName: appointment.fullName,
      patientEmail: appointment.patientEmail,
      date: appointment.date,
      time: appointment.time,
      reasonForReschedule: appointment.reasonForReschedule,
    });

    // Save the notification (this line is not needed because .create() already saves it)
    // await notifyAdmin.save();

    return res.status(200).json({ message: 'Reschedule request sent successfully' });
  } catch (error) {
    console.error('Error sending request:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};




// const rescheduleAppointment = async (req, res) => {
//   try {
    
//     const appointmentId = req.params.appointmentId;
   

//     const appointment = await appointmentModel.findById(appointmentId);
//     if (!appointment) {
//       return res.status(404).json({
//         message: "Appointment with the ID not found"
//       });
//     }

//     const reschedule ={date, time, reasonForReschedule} 

//     if (!reschedule) {
//       return res.status(400).json({
//           message: 'Please enter date, time and reason for Reschedule'
//       })
//   }

//     // Set the appointment status to 'Pending Reschedule'
//     appointment.status = 'Reschedule';

//     // Save the updated appointment
//     await appointment.save();

//     // Create a notification for the admin with relevant information from the appointment
//     const notifyAdmin = await notificationModel.create({
//       fullName: appointment.fullName,
//       patientEmail: appointment.patientEmail, 
//       date: appointment.date, 
//       time: appointment.time, 
//       reasonForReschedule: appointment.reasonForReschedule, 
//     });

//     // Save the notification
//     await notifyAdmin.save();

//     return res.status(200).json({ message: 'Reschedule request sent successfully' });
//   } catch (error) {
//     console.error('Error sending request:', error);
//     return res.status(500).json({ error: 'Internal server error' + error.message });
//   }
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






module.exports = {

  sendAppointmentReminders,
  handleAppointmentRequest,
  getAllRequest,
  viewOneAppointRequest,
  deleteRequest,
  confirmedPayment,
  rescheduleAppointment,
  viewPatientAppointments,
  viewAppointmentDetails
  

}
