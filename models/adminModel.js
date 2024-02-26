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
    isAdmin: {
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
        },
    },
    appointment:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"appointments"
    }],
    blacklist:{
        type: Array,
        default:[]
      },
}, {timestamps: true})

hospitalSchema.pre('save', function(next) {
    // Convert the name to lowercase before saving
    if (this.isModified('hospialName', 'hospitalAddress', 'email')) {
      this.hospialName = this.hospialName.toLowerCase();
      this.hospitalAddress= this.hospitalAddress.toLowerCase();
      this.email = this.email.toLowerCase();
    }
    next();
  });

const hospitalModel = mongoose.model("Hospital", hospitalSchema)

module.exports = hospitalModel