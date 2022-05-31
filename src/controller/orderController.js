// const OrderModel = require("../model/orderModel")
// //const cartModel = require("../model/CartModel")
// const userModel = require("../model/usermodel")
// const validator = require("../validator/validator")





// const createOrder = async function(req,res) {
//     try{
//         // Validate body
//         const body = req.body
//         if(!validator.isValidBody(body)) {
//             return res.status(400).send({ status: false, msg: "Product details must be present"})
//         }

//         // Validate query (it must not be present)
//         const query = req.query;
//         if(validator.isValidBody(query)) {
//             return res.status(400).send({ status: false, msg: "Invalid userId"});
//         }

//         // Validate params
//         const userId = req.params.userId;
//         if(!validator.isValidobjectId(userId)) {
//             return res.status(400).send({ status: false, msg: "Invalid parameters"});
//         }


//         // AUTHORISATION
//         if(userId !== req.user.userId) {
//             return res.status(401).send({status: false, msg: "Unauthorised access"})
//         }

//         const {cartId, cancellable, status, deletedAt, isDeleted} = body

//         // Validate cartId
//         if(!validator.isValid(cartId)) {
//             return res.status(400).send({status: false, msg: "cartId must be present"})
//         }

//         // Validation of cartId
//         if(!validator.isValidobjectId(cartId)) {
//             return res.status(400).send({status: false, msg: "Invalid cartId"})
//         }

//         const userSearch = await userModel.findOne({_id: userId})
//         if(!userSearch) {
//             return res.status(400).send({status: false, msg: "User does not exist"})
//         }

//         const cartSearch = await cartModel.findOne({userId}).select({items:1, totalPrice:1, totalItems:1})
//         if(!cartSearch) {
//             return res.status(400).send({status: false, msg: "Cart does not exist"})
//         }


//         if(status) {
//             if(!validator.isValidStatus(status)) {
//                 return res.status(400).send({status: false, msg: "Order status by default is pending"})
//             }
//         }
//         let order = {
//             userId,
//             items: cartSearch.items,
//             totalPrice: cartSearch.totalPrice,
//             totalItems: cartSearch.totalItems,
//             totalQuantity: cartSearch.totalItems,
//             cancellable,
//             status
//         }

//         let createdOrder = await OrderModel.create(order)
//         return res.status(201).send({status: true, msg: "Success", data: createdOrder})
//     }
//     catch (err) {
//         console.log("This is the error :", err.message)
//         res.status(500).send({ msg: "Error", error: err.message })
//     }
// }

// module.exports.createOrder = createOrder