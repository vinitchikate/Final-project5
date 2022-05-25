const mongoose = require("mongoose")
const productModel = require("../model/productModel")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const aws = require('aws-sdk')
const validator = require("../validator/validator")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "neha/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            console.log(3)
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
        console.log(1)

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"

    })
}

const createProduct = async function (req, res) {
    try {
        const products = req.body
       // products.availableSizes = JSON.parse(products.availableSizes)
        // return res.send(products)
        if (!validator.isValidObject(products)) {
            return res.status(400).send({status: false, message: "Please Provide all required field" })
        }
        const { title, description,style, price } = products
        let availableSizes = products.availableSizes
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "Please Provide Title" })
        }
       
        const titleInUse = await productModel.findOne({title: title})
        if(titleInUse){
            return res.status(400).send({status: false, message: "enter different Title" })
        }
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please Provide Description" })
        }
       
        if (!validator.isValid(style)) {
            return res.status(400).send({ status: false, message: "Please Provide style" })
        }
        if (!validator.isValidString(style)){
            return res.status(400).send({ status: false, message: "Please Provide a valid style" })
        }
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: "Please Provide Price" })
        }
        if(!/^[0-9.]*$/.test(price)){
            return res.status(400).send({ status: false, message: "Please Provide Valid Price" })

        }
        if(!/^[0-9]*$/.test(products.installments)){
            return res.status(400).send({ status: false, message: "Please Provide Valid Installments" })

        }
        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Please Provide Available Sizes" })
        }
        
        availableSizes = JSON.parse(availableSizes)
        // return res.send({data: availableSizes})
        for (let i of availableSizes){
            // console.log(i)
            if(!validator.isValidSize(i)){
                return res.status(400).send({ status: false, message: 'Please Provide Available Sizes from S,XS,M,X,L,XXL,XL' })
            }
        }
        products.availableSizes = availableSizes
        let files = req.files
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            products.productImage = uploadedFileURL
        }else{
           return res.status(400).send({ status: false, message: "plz enter a product Img" })
        }
        
        // return res.send({data: products})
        const product = await productModel.create(products)
        return res.status(201).send({ status: true, message: 'Success', data: product })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports.createProduct = createProduct
