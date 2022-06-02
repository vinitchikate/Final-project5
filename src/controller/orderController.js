const cartModel = require("../model/cartModel")
const userModel = require("../model/usermodel")
const validator = require("../validator/validator")
const OrderModel = require("../model/orderModel")


const createOrder = async function (req, res) {
    try {
        // Validate body
        const body = req.body
        if (!validator.isValid(body)) {
            return res.status(400).send({ status: false, msg: "Plz Enter data in body" })
        }

        const userId = req.params.userId;
        if (userId.length < 24 || userId.length > 24) {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid Length Of userId in Params !!!" });
        }


        // AUTHORISATION
        if (userId != req.TokenUserId) {
            return res.status(401).send({ status: false, msg: "Unauthorised access" })
        }

        const { cartId, cancellable, status } = body

        // Validate cartId
        if (!validator.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId must be present" })
        }

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "Plz Enter valid cartId in Body !!!" });
        }

        const userSearch = await userModel.findOne({ _id: userId })
        if (!userSearch) {
            return res.status(400).send({ status: false, msg: "User does not exist" })
        }

        const cartSearch = await cartModel.findById(cartId).select({ items: 1, totalPrice: 1, totalItems: 1 })
        if (!cartSearch) {
            return res.status(400).send({ status: false, msg: "Cart does not exist" })
        }

        const userIdFindOrder = await OrderModel.findOne({ userId: userId });
        if (userIdFindOrder) {
            return res.status(400).send({ status: false, msg: "Order already created with this user !!!" });
        }

        if (status) {
            if (!validator.isValidStatus(status)) {
                return res.status(400).send({ status: false, msg: "Order status by default is pending" })
            }
        }
        let order = {
            userId,
            items: cartSearch.items,
            totalPrice: cartSearch.totalPrice,
            totalItems: cartSearch.totalItems,
            totalQuantity: cartSearch.totalItems,
            cancellable,
            status
        }

        let createdOrder = await OrderModel.create(order)
        return res.status(201).send({ status: true, msg: "Success", data: createdOrder })
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

//---------------------------------------updateOrder-----------------------------------------//
const updateOrder = async (req, res) => {
    try {
        let requestBody = req.body
        let userId = req.params.userId


        if (Object.keys(requestBody).length == 0)
            return res.status(400).send({ status: false, msg: "order ID not given" })

        if (!validator.isValidObjectId(requestBody.orderId))
            return res.status(400).send({ status: false, msg: "order Id is invalid" })

        let orderDetail = await OrderModel.findOne({ _id: requestBody.orderId, userId, isDeleted: false })
        if (!orderDetail)
            return res.status(404).send({ status: false, message: "Order not exist" })

        if (orderDetail.cancellable == false)
            return res.status(200).send({ status: false, message: "Order cannot be cancelled" })

        if (orderDetail.status == "cancelled") {
            return res.status(400).send({ status: false, msg: "order is already cancelled !!!" });
        }

        orderDetail = await OrderModel.findOneAndUpdate({ _id: requestBody.orderId, userId, isDeleted: false }, { status: "cancelled" }, { new: true })

        return res.status(200).send({ status: true, message: "Order cancelled successfully", data: orderDetail })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { createOrder, updateOrder }