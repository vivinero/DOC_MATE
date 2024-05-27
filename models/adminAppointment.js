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
    hospital: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Hospital'
    }],
    

})

const allApp = mongoose.model("appointments", Appointments)
module.exports = allApp