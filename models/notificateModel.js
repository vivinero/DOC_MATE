const mongoose = require("mongoose")
const notificationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    date: {
        type: String,
    },
    time : {
        type: String
    },
    reasonForReschedule:{
        type: String
    },
    lastDiagnosis: { type: String  },
  presentSymptoms: { type: String},
  lastVisitation:{type: Date},
    // specialist: {
    //     type: String,
    //     enum: ["General_Doctor", "Dentist", "Optician", "Gynechologist", "Other"],
    //     required: true
    // },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointments'
    }]


}, {timestamps: true})

const notification = mongoose.model("adminNotification", notificationSchema)
module.exports = notification
