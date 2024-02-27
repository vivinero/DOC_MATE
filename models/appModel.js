
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true
  },
  doctorName: { 
    type: Date, 
    required: true
  },
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


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
