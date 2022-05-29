const cartModel = require("../model/cartModel")
const userModel = require("../model/usermodel")
const validator = require("../validator/validator")
const productModel = require("../model/productModel")
const mongoose = require("mongoose")

const createCart = async (req, res) => {
    try {


        let paramsuserId = req.params.userId
        //--------------------------------------userId----------------------------------------------------
        if (!paramsuserId) {
            return res.status(400).send({ status: false, message: "userid is required" })
        }
        let isValiduserID = mongoose.Types.ObjectId.isValid(paramsuserId);//check if objectId is objectid
        if (!isValiduserID) {
            return res.status(400).send({ status: false, message: "user Id is Not Valid" });
        }
        //if userid exist in user model
        let user = await userModel.findById(paramsuserId)
        if (!user) {
            return res.status(400).send({ status: false, message: "user dont exist" });
        }

        //====================================authorization=================================================================

        let TokenuserId = req.TokenUserId
        if (TokenuserId !== paramsuserId) {
            return res.status(400).send({ status: false, message: "you are not authorized" });
        }
        //======================================================================================================================


        //------------------------------------------------------------------------------------------------------
        let data = req.body

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "cart details not given" })
        }




        //---------------------------------------if user is not created a cart-----------------------------------------------------
        let userHasCart = await cartModel.findOne({ userId: paramsuserId })

        if (!userHasCart) {
            console.log("user dont have cart")
            //cerate a new cart for user
            if (data.items.length == 0) {
                return res.status(400).send({ status: false, message: "items is required" })
            }

            //more validations are required here!!!--------------------
            if (!Array.isArray(data.items)) {
                return res.status(400).send({ status: false, message: "items should be array" })

            }

            //this will filter out the items with no product WebGLActiveInfo,quanity is less than 0
            //and invalid objectid---------------------
            let invalidId = []
            let validId = []
            for (let i = 0; i < data.items?.length; i++) {
                if (!mongoose.Types.ObjectId.isValid(data.items[i].productId)) {
                    invalidId.push(data.items[i].productId)
                } else {
                    validId.push(data.items[i])
                }
            }

            if (invalidId.length > 0) {
                return res.status(400).send({ status: false, message: `this product id ${invalidId} are not valid` })
            }

            let filterProduct = validId.filter(e => e.quantity >= 1 && e.productId)
            if (filterProduct?.length != validId.length) {
                return res.status(400).send({ status: false, message: `some proct are missing or quantity is 0` })

            }

            let totalPrice = 0

            //function for searching product id if productid is not present return 0 or else return price of that product
            let price = async (id) => {
                let temp = await productModel.findOne({ _id: id, isDeleted: false }).select({ price: 1 })
                if (!temp) return 0
                return temp.price
            }
            for (let i = 0; i < filterProduct.length; i++) {
                //totalItems += filterProduct[i].quantity
                let p = await price(filterProduct[i].productId) // price function is called here

                if (!p) return res.status(400).send({ state: false, message: `productb id ${filterProduct[i].productId} dont exist` })
                console.log(p)
                totalPrice += p * filterProduct[i].quantity   //quantity * price = totalprice

            }

            //------------------------------------------------------------------------------------------------------------------------

            let c = {}                 // empty object 
            c.userId = paramsuserId
            c.items = filterProduct
            c.totalItems = filterProduct.length
            c.totalPrice = totalPrice
            //--------------------------------------------------------------------------------------------------------------------------
            console.log(c)
            let cart = await cartModel.create(c)  //creating the model
            return res.status(201).send({ status: true, message: "cart creted success", data: cart })
        }
        else {
            //if user already has cart
            if (!data.cartId) {                  //check i f cart id given in body
                return res.status(400).send({ status: false, message: "you already have a cart please give cartID" })
            }

            //cart id validation------------------------------------------------------------------------------
            let isValidcartID = mongoose.Types.ObjectId.isValid(data.cartId);//check if objectId is objectid
            if (!isValidcartID) {
                return res.status(400).send({ status: false, message: "cart Id is Not Valid" });
            }

            let cart = await cartModel.findOne({ _id: data.cartId, isDeleted: false })
            if (!cart) {
                return res.status(400).send({ status: false, message: "cart dont exist " });
            }

            //cart is of specific user-----------if cart userid not eqaul to user id in params----------------------------
            if (cart.userId != paramsuserId) {
                return res.status(400).send({ status: false, message: "This is not your cart" });
            }

            let invalidId = []
            let validId = []
            for (let i = 0; i < data.items?.length; i++) {
                if (!mongoose.Types.ObjectId.isValid(data.items[i].productId)) {
                    invalidId.push(data.items[i].productId)
                } else {
                    validId.push(data.items[i])
                }
            }
            console.log(validId)
            if (invalidId.length > 0) {
                return res.status(400).send({ status: false, message: `"${invalidId}" product id are invalid` })
            }

            let filterBodyData = validId.filter(e => e.quantity >= 1 && e.productId && e.productId.length != 0)
            // if(filterBodyData?.length != validId.length){
            //     return res.status(400).send({status:false,message:`some proct are missing or quantity is 0`})

            // }


            //if new product is added in cart append it if the product already exist increase it quantity

            let arr = cart.items      //old data of cart

            console.log(arr)
            for (let i = 0; i < filterBodyData.length; i++) {
                let flag = 0
                for (let j = 0; j < arr.length; j++) {
                    if (filterBodyData[i].productId == arr[j].productId) { //if product already exist in our cart just increase it quantity
                        arr[j].quantity += filterBodyData[i].quantity
                        flag = 1
                        break
                    }

                }
                if (flag == 0) {
                    arr.push(filterBodyData[i])  //if product is not in our cart add it to the cart
                }
            }

            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
            let totalPrice = 0
            let totalItems = arr.length
            let price = async (id) => {
                let temp = await productModel.findOne({ _id: id, isDeleted: false }).select({ price: 1 })
                if (!temp) return 0
                return temp.price
            }

            for (let i = 0; i < arr.length; i++) {
                //totalItems += arr[i].quantity
                let p = await price(arr[i].productId)
                if (!p) return res.status(400).send({ message: `product id ${arr[i].productId} dont exist` })
                console.log(p)
                totalPrice += p * arr[i].quantity

            }
            //------------------------------------------------------------------------------------------------------------------------

            cart.items = arr
            cart.totalItems = totalItems
            cart.totalPrice = totalPrice
            //--------------------------------------------------------------------------------------------------------------------------
            cart.save()
            console.log(cart)
            return res.status(201).send({ status: true, message: "cart created success", data: cart })

        }


        //-------------------------------------totalprice--------------------------------------------------


        //---------------------------------------totalitems-------------------------------------------------
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const updateCart = async (req, res) => {
    try {
        let paramsuserId = req.params.userId
        //--------------------------------------userId----------------------------------------------------
        if (!paramsuserId) {
            return res.status(400).send({ status: false, message: "userid is required" })
        }
        let isValiduserID = mongoose.Types.ObjectId.isValid(paramsuserId);//check if objectId is objectid
        if (!isValiduserID) {
            return res.status(400).send({ status: false, message: "user Id is Not Valid" });
        }
        //if userid exist in user model
        let user = await userModel.findById(paramsuserId)
        if (!user) {
            return res.status(400).send({ status: false, message: "user dont exist" });
        }

        //====================================authorization=================================================================

        let TokenuserId = req.TokenUserId
        if (TokenuserId != paramsuserId) {
            return res.status(400).send({ status: false, message: "you are not authorized" });
        }
        //======================================================================================================================

        let data = req.body

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "cart details not given" })
        }

        if (!data.cartId) {
            return res.status(400).send({ status: false, message: "please give cartID" })
        }

        //cart id validation
        let isValidcartID = mongoose.Types.ObjectId.isValid(data.cartId);//check if objectId is objectid
        if (!isValidcartID) {
            return res.status(400).send({ status: false, message: "cart Id is Not Valid" });
        }

        let cart = await cartModel.findOne({ _id: data.cartId, isDeleted: false })
        if (!cart) {
            return res.status(400).send({ status: false, message: "cart dont exist " });
        }

        //cart is of specific user
        if (cart.userId != paramsuserId) {
            return res.status(400).send({ status: false, message: "This is not your cart" });
        }

        if (cart.items.length == 0) {
            return res.status(400).send({ status: false, message: "cart is empty" });
        }


        let invalidId = []
        let validId = []
        for (let i = 0; i < data.items?.length; i++) {
            if (!mongoose.Types.ObjectId.isValid(data.items[i].productId)) {
                invalidId.push(data.items[i].productId)
            } else {
                validId.push(data.items[i])
            }
        }
        console.log(validId)
        if (invalidId.length > 0) {
            return res.status(400).send({ status: false, message: `"${invalidId}" product id are invalid` })
        }

        let arrbody = validId.filter(e => e.removeProduct == 0 || e.removeProduct == 1)
        if (arrbody.length != data.items.length) return res.send({ message: "0:deletion,1:decrement by 1" })

        let arr = cart.items

        for (let i = 0; i < arrbody.length; i++) {

            for (let j = 0; j < arr.length; j++) {
                if (arrbody[i].productId == arr[j].productId) {   //if prodct is found
                    if (arrbody[i].removeProduct == 0) {           //if in body it removeProduct =0
                        arr[j].quantity = 0                        //make product quantity inside cart= 0
                    }
                    if (arrbody[i].removeProduct == 1) {          //if removeProduct is 1
                        if (arr[j].quantity != 0) {                   //quantity of product inside our cart is not 0 then onlt decrement
                            arr[j].quantity--                         //decrement by 1
                        }
                    }

                }
            }
        }
        console.log(arr)

        let totalPrice = 0
        //let totalItems = 0
        let price = async (id) => {
            let temp = await productModel.findOne({ _id: id, isDeleted: false }).select({ price: 1 })
            if (!temp) return 0
            return temp.price
        }
        for (let i = 0; i < arr.length; i++) {
            //totalItems += arr[i].quantity
            let p = await price(arr[i].productId)
            if (!p) return res.status(400).send({ status: false, message: `product id ${p.productId} not found !!!` })
            console.log(p)
            totalPrice += p * arr[i].quantity

        }

        let filterArr = arr.filter(e => e.quantity != 0)
        cart.items = filterArr  //filter the product with quantity = 0
        cart.totalItems = filterArr.length
        cart.totalPrice = totalPrice
        cart.save()
        console.log(cart)

        return res.status(201).send({ status: true, message: "cart updated success", data: cart })

    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


/*************************************************************************************************************/

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (Object.keys(userId) == 0) {
            return res.status(400).send({ status: false, message: "userId is required" })
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
         let TokenuserId = req.TokenUserId
         if (TokenuserId != userId) {
       return res.status(400).send({ status: false, message: "you are not authorized" });
        }


        const getData = await cartModel.findOne({ userId: userId }).select({ _id: 0 })
        if (!getData) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        return res.status(200).send({ status: true, message: "cart details", data: getData })


    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}




const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (Object.keys(userId) == 0) {
            return res.status(400).send({ status: false, message: "userId is required" })
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
           let TokenuserId = req.TokenUserId
           if (TokenuserId != userId) {
            return res.status(400).send({ status: false, message: "you are not authorized" });
              }
        const cartData = await cartModel.findOne({ userId: userId })
        if (!cartData) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        let cart = { totalItems: 0, totalPrice: 0, items: [] }
        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, cart, { new: true })
        return res.status(204).send({ status: true, message: "cart deleted successfully", data: deleteCart })


    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { createCart, updateCart,getCart,deleteCart }