const cartModel = require("../model/cartModel")
const userModel = require("../model/usermodel")
const validator = require("../validator/validator")
const OrderModel = require("../model/orderModel")


const createOrder = async function (req, res) {
    try {
        // Validate body
        const body = req.body
        if (!validator.isValidBody(body)) {
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
        
        if (cartId.length < 24 || cartId.length > 24) {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid Length Of cartId in Params !!!" });
        }

        // Validate cartId
        if (!validator.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId must be present" })
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

module.exports.createOrder = createOrder