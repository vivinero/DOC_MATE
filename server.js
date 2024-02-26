const { sendAppointmentReminders } = require('./controllers/appointment');
const appointmentModel = require("./models/appModel")

const express = require('express');
require('dotenv').config();
const cron = require ("node-cron")
const bodyParser = require('body-parser');

const cors = require ("cors")

const patientRouter = require('./router.js/patientRout');
const appointmentRouter = require('./router.js/adminAppRoute');
const notificationRouter = require('./router.js/notificationRout');
const adminRouter = require('./router.js/adminRout');
const fileUpload = require ("express-fileupload")
const app = express();
app.use(bodyParser.json());
// Add error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Handle JSON parsing error
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});


app.use(fileUpload({
    useTempFiles: true,
    limits: { fileSize: 5 * 1024 * 1024 },
  }));


port = process.env.port

app.use(express.json());

app.use(cors(``*``))
require("./config/config")

app.get('/', (req, res) => {
    res.send("Welcome to DocMate");
})

app.use(patientRouter); 
app.use(adminRouter);
app.use(appointmentRouter);
app.use(notificationRouter);



// Schedule appointment reminders to run every day at a specific time



// Schedule the job to run every day at a specific time (e.g., 8:00 AM)
// cron.schedule('0 8 * * *', async () => {
//   try {
//     const appointmentId = 'your_appointment_id_here'; // Replace with the actual appointment ID
//     await sendAppointmentReminders(appointmentId);
//     console.log('Appointment reminders sent successfully');
//   } catch (error) {
//     console.error('Error sending appointment reminders:', error);
//   }
// });




cron.schedule('0 8 * * *', async () => {
  try {
    // Query upcoming appointments based on your criteria and get appointment IDs
    const upcomingAppointments = await appointmentModel.find({ date: { $gt: new Date() } }, '_id');
    if (upcomingAppointments.length === 0) {
      console.log('No upcoming appointments found');
      return;
    }

    // Loop through each appointment and send reminders
    for (const appointment of upcomingAppointments) {
      await sendAppointmentReminders(appointment._id);
      console.log('Appointment reminder sent for appointment ID:', appointment._id);
    }
  } catch (error) {
    console.error('Error sending appointment reminders:', error);
  }
});
// setInterval(appointmentController.sendAppointmentReminders, 24 * 60 * 60 * 1000); // Run every 24 hours

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});




//cron.schedule('0 8 * * *', async () => {
//   try {
//     // Query upcoming appointments based on your criteria and get appointment IDs
//     const upcomingAppointments = await appointmentModel.find({ date: { $gt: new Date() } }, '_id');
//     if (upcomingAppointments.length === 0) {
//       console.log('No upcoming appointments found');
//       return;
//     }

//     // Loop through each appointment and send reminders
//     for (const appointment of upcomingAppointments) {
//       const emailSent = await sendAppointmentReminders(appointment._id);
//       console.log('Appointment reminder sent for appointment ID:', appointment._id);
      
//       // Check if the email was sent successfully
//       if (emailSent) {
//         // Additional logic to stop sending emails or stop running
//         break; // Exit the loop if an email is sent successfully for any appointment
//       }
//     }
//   } catch (error) {
//     console.error('Error sending appointment reminders:', error);
//   }
// });


