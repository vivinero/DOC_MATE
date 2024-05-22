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
            default: "https://cdn3.iconfinder.com/data/icons/leto-user-group/64/__user_person_profile-1024.png"
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
        default: ""
    },
    allergies: {
        type: String,
        default: ""
    },
    patientAddress: {
        type: String,
        default: ""
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    age: {
        type: Number,
        default: ""
    },
    profileUpdated:{
        type: Boolean,
        default: false
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductMgt',
    }],
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