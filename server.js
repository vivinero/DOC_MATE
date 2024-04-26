// const { sendAppointmentReminders } = require('./controllers/appointment');
const appointmentModel = require("./models/appModel")

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const cron = require ("node-cron")
const bodyParser = require('body-parser');

const cors = require ("cors")
const messageRouter = require('./routers/messageRouter.js');
const Message = require('./models/messagesModel.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const patientRouter = require('./router.js/patientRout');
const patientAppointmentRouter = require("./router.js/patientAppRoute")
const appointmentRouter = require('./router.js/adminAppRoute');
//const notificationRouter = require('./router.js/notificationRout');
const adminRouter = require('./router.js/adminRout');
const contactUs = require("./router.js/messageRoute")
const fileUpload = require ("express-fileupload")


const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = socketIo(server, {
  cors: {
      origin: "*",
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"] // All methods
  }
});

app.use(cors(``*``))
const db = require("./config/config")

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

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

let chatSession;

async function initializeChat() {
    try {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        chatSession = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'Hello, I have 2 dogs in my house.' }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Great to meet you. What would you like to know?' }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 100,
            },
        });
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
}

initializeChat().catch(console.error); // Initialize chat session and catch errors

// MongoDB Change Stream
db.once('open', () => {
    const changeStream = Message.watch();

    changeStream.on('change', async (change) => {
        try {
            if (change.operationType === 'insert') {
                const { user, role, message } = change.fullDocument;

                // If the message is from the user, generate a response
                if (role === 'user') {
                    // Generate response using Google Generative AI
                    const result = await chatSession.sendMessage(message);
                    const response = await result.response;
                    const text = response.text();

                    console.log("Me: ", message);
                    console.log("Bot: ", text);

                    // Save the bot's response to MongoDB
                    const botMessage = await Message.create({ user: user, role: 'Bot', message: text });


                    // Emit response to all connected clients via Socket.IO
                    io.emit('response', { user: user, role: 'Bot', message: text });
                }
            }
        } catch (error) {
            console.error('Error processing change stream:', error.message);
        }
    });
});

// Socket.IO event listener for new connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for disconnections
  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});


// app.get('/', (req, res) => {
//     res.send("Welcome to DocMate");
// })

app.use(patientRouter); 
app.use(adminRouter);
app.use(appointmentRouter);
//app.use(notificationRouter);
app.use(patientAppointmentRouter)
app.use(contactUs)
app.use('/api', messageRouter);


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



