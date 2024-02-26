// Message schema definition using Mongoose
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    
    title: {
        type: String,
        required: true
    },

       content:{ type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Create a Message model based on the schema
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;