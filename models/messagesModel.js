const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    role: {
        type: String,
    },
    message: { 
        type: String
    },
}, {timestamps: true});

const Message = mongoose.model('chatMessage', messageSchema);

module.exports = Message;