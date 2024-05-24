const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
    }, 
    category: {
        type: String,
    }, 
    brand: {
        type: String,
    },
    productDescription: {
        type: String,
    },
    costPrice: {
        type: Number,
    }, 
    sellingPrice: {
        type: Number,
    }, 
    stockQty: {
        type: Number,
    },
    
    lastUpdated: {
        type: String, 
    },
    images: {
        public_id: {
            type: String,
         
        },
        url:{
            type: String,
        },
    },
    updatedImages: {
        public_id: {
            type: String,
         
        },
        url:{
            type: String,
        },
    },
    userId: {
        type: String,
    },
    productId: {
        type: String,
    }
}, {timestamps: true})

const productModel = mongoose.model('ProductHome', productSchema);

module.exports = productModel;





// const mongoose = require("mongoose")
// const productSchema = new mongoose.Schema({
//     itemName:{
//         type: String,
//         require: true
//     },
//     detail:{
//         type: String,
//         require: true
//     },
//     price:{
//         type: Number,
//         require: true
//     },
//     images:{
//         type: Array,
//         default: [],
//         required: true
//     },
//     category: {
//         type: mongoose.SchemaTypes.ObjectId,
//             ref: "Category"
//     }
// }, {timestamps: true})

// const productModel = mongoose.model("Product", productSchema)
// module.exports = productModel