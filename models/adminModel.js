const mongoose = require("mongoose")

const hospitalSchema = new mongoose.Schema({
    hospitalName: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // confirmPassword: {
    //     type: String,
    // },
    hospitalAddress:{
        type: String,
        required: true
    },
    patient :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }],
    isVerified :{
        type : Boolean,
        default : false
    },
    isAdmin :{
        type : Boolean,
        default : false
    },
    token:{
        type: String
    },
    profilePicture: {
        public_id: {
            type: String,
        },
        url:{
            type: String,
            default :"https://cdn3.iconfinder.com/data/icons/leto-user-group/64/__user_person_profile-1024.png"
        },
    },
    appointment:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Appointment"
    }],
    blacklist:{
        type: Array,
        default:[]
      },
}, {timestamps: true})

const hospitalModel = mongoose.model("Hospital", hospitalSchema)

module.exports = hospitalModel