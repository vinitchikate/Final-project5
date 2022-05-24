const UserModel = require("../model/userModel")
const mongoose = require("mongoose")
const jwt=require('jsonwebtoken')
const bcrypt = require('bcrypt')
const aws = require('aws-sdk')

//--------------------------------------------------------------------------------------------------------------------------------------

        //name validation name can only contain [a-z],[A-Z]and space
        const validateName = (name) => {
            return String(name).trim().match(
                /^[a-zA-Z][a-zA-Z\s]+$/);
        };

        //email validation function
        const validateEmail = (email) => {
            return String(email).trim()
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };

   
        //MOBILE NUMBER VALIDATION must be number start with 6,7,8,9 and of 10 digit 
        const validateNumber = (number) => {
            return String(number).trim().match(
                ///^(\+\d{1,3}[- ]?)?\d{10}$/
                /^[6-9]\d{9}$/gi
            )
        }
//--------------------------------------------------------------------------------------------------------------------------------------

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




const register = async (req, res) => {
    try {
        const data = req.body

        //check for empty body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "please enter some DETAILS!!!" })
        }

        //fname is mandatory and must be in [Mr , Mrs , Miss]------------------------------------------------
        if (!data.fname) {
            return res.status(400).send({ status: false, message: "firest name is required!!!" })
        }
        if (!validateName(data.fname)) {
            return res.status(400).send({ status: false, message: "first name is INVALID!!!" })
        }

        //check for user name---------------------------------------------------------------------------------
        if (!data.lname) {
            return res.status(400).send({ status: false, message: "last NAME is required!!!" })
        }
        if (!validateName(data.lname)) {
            return res.status(400).send({ status: false, message: "last NAME is INVALID!!!" })
        }

        //phone no---------------------------------------------------------------------------------------------

        if (!data.phone) {
            return res.status(400).send({ status: false, message: "User phone number is missing" })
        }
        if (!validateNumber(data.phone)) {
            return res.status(400).send({ status: false, message: "User phone number is INVALID" })
        }
        //check for unique phone number
        const phone = await UserModel.findOne({ phone: data.phone })
        if (phone) {
            return res.status(400).send({ status: false, message: "User phone number already exists" })

        }

        //email--------------------------------------------------------------------------------------------------
        if (!data.email)
            return res.status(400).send({ status: false, message: "email is missing" })

        if (!validateEmail(data.email)) {
            return res.status(400).send({ status: false, message: "Invaild E-mail id " })//email validation
        }
        //check for unique email
        const email = await UserModel.findOne({ email: data.email })
        if (email) {
            return res.status(400).send({ status: false, message: "email already exist" })
        }

        //password----------------------------------------------------------------------------------------------
        if (!data.password)
            return res.status(400).send({ status: false, message: "password is missing" })

        if (data.password.length < 8 || data.password.length > 15)
            return res.status(400).send({ message: "password length must be minimum of 8 and max of 15 character" })

      

        //hashing password and storing in database
        const hashPassword = await bcrypt.hash(data.password, 10)
        data.password = hashPassword


        //address---------------------------------------------------------------------------------------------------
        if(!data.address ){
            return res.status(400).send({status:false,message:"address required"})
        }
        let address = JSON.parse(data.address)

        if(!address.shipping  || !address.billing){
            return res.status(400).send({status:false,message:"shipping and billing address required"})

        }
//---------------------------------------------------------------------
        if(!address.shipping.street || !address.billing.street){
            return res.status(400).send({status:false,message:"street is  required "})

        }
        if(!address.shipping.city || !address.billing.city){
            return res.status(400).send({status:false,message:"city is  required"})

        }
        if(!address.shipping.pincode || !address.billing.pincode){
            return res.status(400).send({status:false,message:"pincode is  required "})

        }
        //-------------------------------------------------------------------
        let Sstreet = address.shipping.street
        let Scity = address.shipping.city
        let Spincode = parseInt(address.shipping.pincode)     //shipping
        if(Sstreet){
            let validateStreet = /^[a-zA-Z0-9]/
            if (!validateStreet.test(Sstreet)) {
                return res.status(400).send({ status: false, message: "enter valid street name in shipping" })
            }
        }

        if (Scity) {
            let validateCity = /^[a-zA-z',.\s-]{1,25}$/gm
            if (!validateCity.test(Scity)) {
                return res.status(400).send({ status: false, message: "enter valid city name in shipping" })
            }
        }
        if (Spincode) {
            let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/gm      //must not start with 0,6 digits and space(optional)
            if (!validatePincode.test(Spincode)) {
                return res.status(400).send({ status: false, message: "enter valid pincode in shipping" })
            }
        }


        let Bstreet = address.billing.street
        let Bcity = address.billing.city                             //billing
        let Bpincode = parseInt(address.billing.pincode)
        if(Bstreet){
            let validateStreet = /^[a-zA-Z0-9]/
            if (!validateStreet.test(Bstreet)) {
                return res.status(400).send({ status: false, message: "enter valid street name in shipping" })
            }
        }

        if (Bcity) {
            let validateCity = /^[a-zA-z',.\s-]{1,25}$/gm
            if (!validateCity.test(Bcity)) {
                return res.status(400).send({ status: false, message: "enter valid city name in shipping" })
            }
        }
        if (Bpincode) {
            let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/gm      //must not start with 0,6 digits and space(optional)
            if (!validatePincode.test(Bpincode)) {
                return res.status(400).send({ status: false, message: "enter valid pincode in shipping" })
            }
        }

        console.log(data)

        //uploading cover photo in aws-------------------------------------------------------------------------
        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            data.profileImage = uploadedFileURL
            console.log(2)
        } else {
             return res.status(400).send({message:"profile cover image not given"})
        }


        data.address = address
        // //create user--------------------------------------------------------------------------------------------------
        const user = await UserModel.create(data)
        return res.status(201).send({ status: true, message: "success", data: user })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}

const login = async function(req,res){
    try {
       const requestBody= req.body;
       if(Object.keys(requestBody).length==0){
           res.status(400).send({status:false, message:'Invalid request parameters, Please provide login details'})
           return
       }

       //Extract params
       const {email, password} = requestBody;

       //validation starts
       if(!(email)){
           res.status(400).send({status:false, message:`Email is required`})
           return
       }
       
       if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
           res.status(400).send({status:false, message: `Email should be a valid email address`})
           return
       }

       if(!(password)){
           res.status(400).send({status:false, message: `Password is required`})
           return
       }
       //validation ends

       const match = await UserModel.findOne({email});

       if(!match){
           res.status(400).send({status:false, message:`Invalid login email`});
           return
       }
  
       //bcrypt
       let p = await bcrypt.compare(password, match.password)
        if (!p)
            return res.status(401).send({ status: false, msg: "invalid password" })


       const token =  jwt.sign({
           userId: match._id,
           iat: Math.floor(Date.now() /1000),
           exp: Math .floor(Date.now() /1000) + 10 * 60 * 60
       },
       "My private key"
       );

       res.header('x-api-key',token);
       res.status(200).send({status:true, message:`User login successfully`, data:{userId:match._id,token:token}});

   } catch (error) {
       res.status(500).send({status:false, message:error.message});
   }
}


const { isValidObjectId } = require("mongoose")



// -----------get Profile Data-----------------------------------------------------------------------------------
const getUserDetails = async function (req, res) {
    try {

        const userIdfromParams = req.params.userId
        const userIdFromToken = req.userId

        let isValiduserID = mongoose.Types.ObjectId.isValid(userIdfromParams );//check if objectId is objectid
        if (!isValiduserID) {
            return res.status(400).send({ status: false, message: "user Id is Not Valid" });
        }
        const checkId = await UserModel.findOne({ _id: userIdfromParams }).lean()
        if (!checkId) {
            return res.status(404).send({ status: false, message: "User Not Found" });
        }



        if (userIdFromToken != userIdfromParams) {
            return res.status(403).send({ status: false, message: "Unauthorized access" });
        };

        return res.status(200).send({ status: true, message: "User details", data: checkId });




    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}





module.exports = { register ,login,getUserDetails}
