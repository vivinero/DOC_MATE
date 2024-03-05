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
    const userId = req.params.userId;
    
    // Check if the user has updated their profile
    // const isProfileUpdated = await checkProfile(userId);
    // if (!isProfileUpdated) {
    //   return res.status(400).json({ message: 'Please update your profile before scheduling an appointment' });
    // }

    // Continue with appointment scheduling logic...
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
    const appointmentRequest = new appointmentModel({
      fullName: user.firstName,
      patientEmail: data.patientEmail,
      date: data.date,
      lastDiagnosis: data.lastDiagnosis,
      presentSymptoms: data.presentSymptoms,
      lastVisitation: data.lastVisitation,
      paymentStatus: false,
      patient: userId
    });

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
      return res.status(404).json({ message: 'Notification not sent' });
    }

    return res.status(201).json({ message: 'Appointment request sent successfully', appointment: appointmentRequest });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};


const confirmPayment = async (appointmentId) => {
  // Find the appointment by ID
  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
      //throw new Error('Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
  }

  // Update payment status to true
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






const rescheduleAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment with the ID not found"
      });
    }

    // Set the appointment status to 'Pending Reschedule'
    appointment.status = 'Reschedule';

    // Save the updated appointment
    await appointment.save();

    // Create a notification for the admin with relevant information from the appointment
    const notifyAdmin = await notificationModel.create({
      fullName: appointment.fullName,
      patientEmail: appointment.patientEmail, 
      date: appointment.date, 
      lastDiagnosis: appointment.lastDiagnosis, 
      presentSymptoms: appointment.presentSymptoms, 
      lastVisitation: appointment.lastVisitation 
    });

    // Save the notification
    await notifyAdmin.save();

    return res.status(200).json({ message: 'Reschedule request sent successfully' });
  } catch (error) {
    console.error('Error sending request:', error);
    return res.status(500).json({ error: 'Internal server error' + error.message });
  }
};




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
  rescheduleAppointment
  

}
