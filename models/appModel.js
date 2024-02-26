
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  date: { type: Date, required: true },
  // specialist: {
  //   type: String,
  //   required: true,
  //   enum: ["Gynachologist", "Dentist", "Optician"]
  // },
  status: { 
    type: String, 
    enum: ['pending', "confirmed", "cancelled"] 
  },

  reschedule: { 
    type: String,
     enum: ['attended', "Unattended", "Unassigned", "Assigned"] },

     createdAppId:{
      type: String,

     },
     confirmAppId:{ type: String,}


}, { timestamps: true });
// appointmentSchema.pre('save', function(next) {
//   // Convert the name to lowercase before saving
//   if (this.isModified('patientName', 'patientEmail', 'specialist')) {
//     this.patientName = this.patientName.toLowerCase();
//     this.patientEmail = this.patientEmail.toLowerCase();
//     this.specialist = this.specialist.toLowerCase();
//   }
//   next();
// });


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
