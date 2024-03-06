const mongoose = require("mongoose")
const reschedule = new mongoose.Schema({
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
    appointment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"appointments"
    },
})

const allApp = mongoose.model("reschedule", reschedule)
module.exports = allApp