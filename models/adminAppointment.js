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
        enum: ['pending', 'confirmed', 'rechedule'],
        default: 'pending'
    },
    reschedule: [{
        Day: String,
        Time: String,
        DocName: String,
    }],
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