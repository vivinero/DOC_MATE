const mongoose = require('mongoose');



const paymentSchema = new mongoose.Schema({
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
    phoneNumber: {
        type: String,
        required: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //ref: 'Hospital'
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;


// // Define Payment schema
// const paymentSchema = new mongoose.Schema({
//     amount: {
//         type: Number,
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'paid'],
//         default: 'pending'
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     }
// }, { timestamps: true });

// const Payment = mongoose.model('Payment', paymentSchema);

// module.exports = Payment;
