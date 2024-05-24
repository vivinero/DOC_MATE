const { required } = require("joi")
const mongoose = require("mongoose")
const cartItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductHome'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductHome',
        required : true
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [cartItemSchema]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;