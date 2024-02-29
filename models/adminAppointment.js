const mongoose = require("mongoose")
const Appointments = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'Confirmed', 'rechedule'],
        default: 'pending'
    },
    specialist: {
        type: String,
        enum: ["General_Doctor", "Dentist", "Optician", "Gynechologist", "Other"],
        required: true
    },
    patient: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "patient"
    }],
    selectedOptionIndex: {
        type: Number,
    },

})

const allApp = mongoose.model("appointments", Appointments)
module.exports = allApp