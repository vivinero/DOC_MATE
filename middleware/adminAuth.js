const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel')
require('dotenv').config();

const adminAuthenticate =async (req, res, next)=>{
    try{
        const hasAuthorization = req.headers.authorization;


        // check if user has a token
        if (!hasAuthorization){
            return res.status(401).json ({
                message: "You are not allowed to perform this operation"
            })
        }
        //seperate the token from the bearer
        const token = hasAuthorization.split(' ')[1];
        if(!token){
            return res.status(400).json({
                message: "Invalid token"
            })
        }
        
        //decode the token
        const decodeToken = jwt.verify(token, process.env.jwtSecret); 

        const admin = await adminModel.findById(decodeToken.userId);

        if (!admin) {
            return res.status(404).json({
                message: "Account doesn't exist",
            })
        }
        if(admin.blacklist.includes(token)){
            return res.status(400).json({
                message : "Authorization failed: Please login again",
            })
        

        }
        //pass the payload into the request ad
        req.user = decodeToken
        next();
        

    } catch(err){
        if(err instanceof jwt.JsonWebTokenError){
            return res.status(500).json({
                message: 'Session timedout, please log in again'
            })
            
        }
        return res.status(500).json({
            message: "Error authenticating:" + " " + err.message
        })
        
    }

}

module.exports = {adminAuthenticate}