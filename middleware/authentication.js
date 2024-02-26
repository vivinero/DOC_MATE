const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel')
require('dotenv').config();

const authenticate =async (req, res, next)=>{
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

        const user = await userModel.findById(decodeToken.userId);

        if (!user) {
            return res.status(404).json({
                message: "Account doesn't exist",
            })
        }
        if(user.blacklist.includes(token)){
            return res.status(400).json({
                message : "Authorization failed: Please login again",
            })
        

        }
        // if (user.isAdmin) {
        //     req.isAdmin = true;
        // }else{
        //     req.isAdmin = false;
        // }
        //pass the payload into the request user
        req.user = decodeToken
        next();
        

    } catch(err){
        if(err instanceof jwt.JsonWebTokenError){
            return res.status(500).json({
                message: 'Session timedout, please log in again'
            })
            return res.status(500).json({
                message: "Error authenticating" + err.message
            })
            
        }
        
    }

}

// const hospital = (req, res, next) => {
//     authenticate(req, res, async () => {
//         if (req.user && req.user.role === 'hospital') {
//             next();
//         } else {
//             return res.status(401).json({
//                 message: "Unauthorized access"
//             });
//         }
//     });
// }

const admin = (req, res, next) => {
    authenticate(req, res, async () => {
        if (req.user.admin) {
            next()
        } else {
            return res.status(401).json({
                message: "Unauthorized access", 
            })
        }

    })
}
module.exports = {authenticate, admin}