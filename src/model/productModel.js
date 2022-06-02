const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        unique: true
    },
    description: {
        type: String, 
        required: true
    },
    price: {
        type: Number, 
        require: true 
    },
    currencyId: {
        type: String, 
        required: true,
        default: "INR"
        },//INR
    currencyFormat: {
        type: String, 
        required: true,
        default: "₹"
        },//Rupee symbol
    isFreeShipping: {
        type: Boolean, 
        default: false
    },
    productImage: {
        type: String, 
        required: true
    },  // s3 link
    style: String,
    availableSizes: {
        type: [String],  
        enum: ["S", "XS","M","X", "L","XXL", "XL"]
    },//at least one size,
    installments: Number,
    deletedAt: Date,
    isDeleted: {
        type: Boolean, 
        default: false
    }
}, {timestamps: true});

module.exports = new mongoose.model("Product", productSchema)
