const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const productController = require("../controller/productController")
const middleware = require("../middleware/auth.js")


//UserModel APIs
 router.post("/register",userController.register)
 router.post('/Login', userController.login)
router.get("/user/:userId/profile",middleware.tokenValidator,userController.getUserDetails)
 router.put('/user/:userId/profile',middleware.tokenValidator,userController.updateUser)

 ///--------------------------ProductModel APIs-----------------------------------///
 router.post("/products", productController.createProduct);   // createProduct
//router.get("/products", productController.getAllProducts);   //getAllProducts
router.get("/products/:productId", productController.getProductById);   //getProductById
//router.put("/products/:productId",  productController.updateProduct);    //updateProduct
router.delete("/products/:productId", productController.deleteProduct);   //deleteProduct



// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you request is not available"
    })
})
module.exports=router;


