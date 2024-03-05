// const { sendAppointmentReminders } = require('./controllers/appointment');
const appointmentModel = require("./models/appModel")

const express = require('express');
require('dotenv').config();
const cron = require ("node-cron")
const bodyParser = require('body-parser');

const cors = require ("cors")

const patientRouter = require('./router.js/patientRout');
const patientAppointmentRouter = require("./router.js/patientAppRoute")
const appointmentRouter = require('./router.js/adminAppRoute');
//const notificationRouter = require('./router.js/notificationRout');
const adminRouter = require('./router.js/adminRout');
const contactUs = require("./router.js/messageRoute")
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

// app.get('/', (req, res) => {
//     res.send("Welcome to DocMate");
// })

app.use(patientRouter); 
app.use(adminRouter);
app.use(appointmentRouter);
//app.use(notificationRouter);
app.use(patientAppointmentRouter)
app.use(contactUs)


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




