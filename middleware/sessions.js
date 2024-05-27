// const express = require('express');
// const session = require('express-session');
 const MongoStore = require('connect-mongo');

// // Create an instance of Express
// const app = express();

// // Middleware for session management
// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//         mongoUrl: 'mongodb://localhost:27017/safeAjo',
//         ttl: 7 * 24 * 60 * 60 // Session will expire in 7 days
//     })
// }));



// module.exports = app;

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware setup
app.use(session({
    secret: 'your_secret_key', // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } ,// Set to true if using HTTPS
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/safeAjo',
        ttl: 7 * 24 * 60 * 60 // Session will expire in 7 days
    })
}));


// Mock authentication middleware
app.use((req, res, next) => {
    // Mock user authentication
    if (!req.user) {
        req.user = null; // Set to null or remove this line if you want to test unauthenticated flow
    }
    next();
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;