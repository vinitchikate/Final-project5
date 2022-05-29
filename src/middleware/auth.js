const jwt = require('jsonwebtoken')


const auth = async (req,res,next) =>{
    try{
        let bearer = req.headers["authorization"]
        if(!bearer){
            return res.status(401).send({ status: false, message: "Missing authentication token in request" })

        }
        let t=bearer.split(" ")
        let token = t[1]
        


        if (!token) return res.status(403).send({ status: false, message: "Missing authentication token in request" })

        
        let decodedToken = jwt.verify(token, "My private key")
        
        if (!decodedToken) {
            return res.status(403).send({ status: false, message: "Invalid authentication token in request" })
        }

     

        req.TokenUserId = decodedToken.userId;
        
        next()
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

module.exports={auth}