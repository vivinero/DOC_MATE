const mongoose = require("mongoose")
const request = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    lastVisit: {
        type: String,
        required: true
    },
    lastDiagnosis: {
        type: String,
        required:true
    },

    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "patient"
    },
 
    presentSymptoms: {
        type:String,
        required:true
    },

})

const allRequest = mongoose.model("requests", request)
module.exports = allRequest