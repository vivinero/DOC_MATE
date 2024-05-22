const { required } = require("joi")
const mongoose = require("mongoose")
const cartItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    quantity: {
        type: Number,
        default: 1
    },
    savedForlater: {
        type: Boolean,
        default: false
    }
});
const cartSchema = new mongoose.Schema({
    
})
const cartSchema = mongoose.m