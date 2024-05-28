// const { sendAppointmentReminders } = require('./controllers/appointment');
const appointmentModel = require("./models/appModel.js")

const express = require('express');
// const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const cron = require ("node-cron")
const bodyParser = require('body-parser');

const cors = require ("cors")
const messageRouter = require('./routers/messageRouter.js');
const Message = require('./models/messagesModel.js');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold  } = require('@google/generative-ai');

const patientRouter = require('./router.js/patientRout.js');
const patientAppointmentRouter = require("./router.js/patientAppRoute.js")
const appointmentRouter = require('./router.js/adminAppRoute.js');
//const notificationRouter = require('./router.js/notificationRout');
const adminRouter = require('./router.js/adminRout.js');
const contactUs = require("./router.js/messageRoute.js")
const productRouter = require('./router.js/productRoute.js')
const categoryRouter = require('./router.js/categoryRoute.js')
//const cartRouter = require("./router.js/cartRouter.js")
const searchRouter = require("./router.js/searchRoute.js");
const fileUpload = require ("express-fileupload")


const app = express();
// const server = http.createServer(app);
app.use(cors("*"))
// Set up Socket.IO
//const apps = require("./middleware/session")

const db = require("./config/config.js");

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

        const generationConfig = {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1000,
        };
      
        const safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ];

      chatSession = model.startChat({
          generationConfig,
          safetySettings,
          history: [
              {
                role: "user",
                parts: [{ text: "You are Doc-Bot, a friendly assistant who works for DocMate. DocMate Appointment Management System is a cutting-edge web app crafted to simplify the process of scheduling appointments remotely. It provides patients with a seamless method to book appointments from the comfort of their homes, empowers staff to efficiently oversee schedules, and elevates the standard of healthcare delivery. DocMate is a one-stop web app for hassle-free appointment booking from home, ensuring efficient scheduling and improved healthcare delivery (website: https://docmate-tau.vercel.app/). Your job is to attend to user and answer any of their messages making it relate to healthcare. Don't answer the user's question until they have provided you their name, thank the user and output their name in this format: {{name: user's name}} \nOnce you have captured user's name. Answer all user's questions and give a healthcare advise.\n Encourage user to take their healthcare serious and suggest they book appointment if they're having any health challenges."}],
              },
              {
                role: "model",
                parts: [{ text: "Hello! Welcome to DocMate. My name is Doc-Bot. What's your name?"}],
              },
              {
                role: "user",
                parts: [{ text: "Hi"}],
              },
              {
                role: "model",
                parts: [{ text: "Hi there! Thanks for reaching out to DocMate. Before I can answer your question, I'll need to capture your name. Can you please provide that information?"}],
              },
            ],
        });
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
}

initializeChat().catch(console.error); // Initialize chat session and catch errors


// // Socket.IO event listener for new connections
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Listen for disconnections
//   socket.on('disconnect', () => {
//       console.log('User disconnected');
//   });

//   // Listen for incoming messages from the frontend
//   socket.on('message', async (message) => {
//     try {
//       // Process the incoming message
//       const result = await chatSession.sendMessage(message);
//       const response = await result.response;
//       const text = response.text();

//       // console.log("Me: ", message);
//       // console.log("Bot: ", text);

//       // Save the bot's response to MongoDB
//       const botMessage = await Message.create({ user: user, role: 'Bot', message: text });

//       // Emit the response to all connected clients via Socket.IO
//       io.emit('response', { user: user, role: 'Bot', message: text });
//     } catch (error) {
//       console.error('Error processing message:', error.message);
//     }
//   });
// });



app.get('/', (req, res) => {
    res.send("Welcome to DocMate");
})

app.use(patientRouter); 
app.use(adminRouter);
app.use(appointmentRouter);
//app.use(notificationRouter);
app.use(patientAppointmentRouter)
app.use(contactUs)
app.use(messageRouter);
app.use(productRouter)
//app.use(cartRouter)
app.use(categoryRouter)
app.use(searchRouter);


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

const server = app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

const io = socketIo(server, {
  cors: {
      origin: "*",
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"] // All methods
  }
});

// MongoDB Change Stream
db.once('open', () => {
  const changeStream = Message.watch();

  changeStream.on('change', async (change) => {
      try {
          if (change.operationType === 'insert') {
              const { user, role, message, _id, createdAt, updatedAt } = change.fullDocument;
              // console.log(change.fullDocument)

              // If the message is from the user, generate a response
              if (role === 'user') {
                  // Generate response using Google Generative AI
                  const result = await chatSession.sendMessage(message);
                  const response = await result.response;
                  const text = response.text();

                  console.log("Me: ", message);
                  console.log("Bot: ", text);

                  // Emit response to all connected clients via Socket.IO
                  io.emit('response', {user, role, "message": text, user, role, });

                  // Save the bot's response to MongoDB
                  const botMessage = await Message.create({ user: user, role: 'Bot', message: text });
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
