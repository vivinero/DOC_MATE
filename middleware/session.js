const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Create an instance of Express
const app = express();

// Middleware for session management
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/safeAjo',
        ttl: 7 * 24 * 60 * 60 // Session will expire in 7 days
    })
}));

module.exports = app;
