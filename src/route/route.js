const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const productController = require("../controller/productController")
const CartController = require("../controller/cartController")
const orderController = require("../controller/orderController")
const middleware = require("../middleware/auth.js")


//UserModel APIs
 router.post("/register",userController.register)
 router.post('/Login', userController.login)
 router.get("/user/:userId/profile",middleware.auth,userController.getUserDetails)
 router.put('/user/:userId/profile',middleware.auth,userController.updateUser)

 ///--------------------------ProductModel APIs-----------------------------------///
router.post("/products", productController.createProduct);   // createProduct
router.get("/products", productController.getAllProduct);   //getAllProducts
router.get("/products/:productId", productController.getProductById);   //getProductById
router.put("/products/:productId",  productController.updatedProduct);    //updateProduct
router.delete("/products/:productId", productController.deleteProduct);   //deleteProduct

//---------------------------------CartModel APIs---------------------------------------------//

router.post("/users/:userId/cart",middleware.auth,CartController. createCart );
router.put("/users/:userId/cart",middleware.auth, CartController.updateCart);
router.get("/users/:userId/cart",middleware.auth, CartController.getCart);
router.delete("/users/:userId/cart",middleware.auth, CartController.deleteCart);

//---------------------------------orderModel----------------------------------------------------//
router.post("/users/:userId/orders",middleware.auth,orderController.createOrder);

router.put("/users/:userId/orders",middleware.auth,orderController.updateOrder);





// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "please provide Id in params"
    })
})
module.exports=router;


