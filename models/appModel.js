
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  date: { type: Date },
  lastDiagnosis: { type: String  },
  presentSymptoms: { type: String, },
  lastVisitation:{type: Date},
  paymentStatus: {
    type: Boolean,
    default: false
},
patient: [{
  type: mongoose.SchemaTypes.ObjectId,
  ref: "Patient"
}],
  reschedule: { 
    type: String,
     enum: ['attended', "Unattended", "Unassigned", "Assigned"] },

     createdAppId:{
      type: String,

     },
     confirmAppId:{ type: String,},

       // specialist: {
  //   type: String,
  //   required: true,
  //   enum: ["Gynachologist", "Dentist", "Optician"]
  // },
  status: { 
    type: String, 
    enum: ['Pending', "Confirmed", "Reschedule"] 
  },


}, { timestamps: true });
appointmentSchema.pre('save', function(next) {
  // Convert the name to lowercase before saving
  if (this.isModified('fullName', 'patientEmail')) {
    this.fullName = this.fullName.toLowerCase();
    this.patientEmail = this.patientEmail.toLowerCase();
  
  }
  next();
});


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
