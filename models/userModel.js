const mongoose = require("mongoose")
const patientSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified :{
        type : Boolean,
        default : false
    },
    token:{
        type: String
    },
    patientId:{
        type: String
    },
    profilePicture: {

        public_id: {
            type: String,
         
        },
        url:{
            type: String,
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
      hospitals:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Hospital"
    }],
    bloodType: {
        type: String,
    },
    allergies: {
        type: String,
    },
    patientAddress: {
        type: String,
    },
    phoneNumber: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    profileUpdated:{
        type: Boolean,
        default: false
    }
}, {timestamps: true})


patientSchema.pre('save', function(next) {
    // Convert the name to lowercase before saving
    if (this.isModified('firstName', 'lastName', 'email')) {
      this.firstName = this.firstName.toLowerCase();
      this.lastName = this.lastName.toLowerCase();
      this.email = this.email.toLowerCase();
    }
    next();
  });

const patientModel = mongoose.model("Patient", patientSchema)
module.exports = patientModel