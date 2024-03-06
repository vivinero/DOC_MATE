const mongoose = require("mongoose")
const Appointments = new mongoose.Schema({
    date: {
        type: String,
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Rechedule'],
        default: 'Pending'
    },
    speciality: {
        type: String,
        required: true
    },
    patient: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Patient"
    },
    firstAvailability: {
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    },
    secondAvailability: {
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    },
    thirdAvailability: {
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    },

})

const allApp = mongoose.model("appointments", Appointments)
module.exports = allApp