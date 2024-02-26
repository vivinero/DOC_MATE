const mongoose = require("mongoose")
const notificationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointments'
    }]


}, {timestamps: true})

const notification = mongoose.model("adminNotification", notificationSchema)
module.exports = notification
