const jwt = require('jsonwebtoken');
const patientModel = require('../models/userModel')
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

        const user = await patientModel.findById(decodeToken.userId);

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

        req.user = decodeToken
        next();
        

    } catch(error){
        if(error instanceof jwt.JsonWebTokenError){
            return res.status(500).json({
                message: 'Session timedout, please log in again'
            })
            // return res.status(500).json({
            //     message: "Error authenticating" + error.message
            // })
            
        }
        
    }

}

const authenticateAdmin = async (req, res, next) => {
    try {
        await authenticate(req, res, () => {
            if (req.user.isAdmin) {
                next();
            } else {
                return res.status(403).json({
                    error: "Unauthorized access: Admin privileges required"
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {authenticate, authenticateAdmin}