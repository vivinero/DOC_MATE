const mongoose = require("mongoose")
const notificationSchema = new mongoose.Schema({

    admin:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Hospital"
    },
    

    msg: {
        type: String,
        required: true
    },


}, {timestamps: true})

const notification = mongoose.model("adminNotification", notificationSchema)
module.exports = notification
