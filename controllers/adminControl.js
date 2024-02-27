const adminModel = require("../models/adminModel.js");
const sendEmail = require("../middleware/email.js");
const generateDynamicEmail = require("../verify.js");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
// const {validateUser} = require("../middleware/validator.js")
const cloudinary = require("../middleware/cloudinary")


const {validateAdmin} = require("../middleware/validator.js")

const register = async (req, res) => {
    try {
        const { error } = validateAdmin(req.body);
            if (error) {
                res.status(400).json({
                    message: error.details[0].message
                })
            }
            // Get the required field from the request object body

            const { hospitalName, hospitalAddress, email, phoneNumber, password, confirmPassword } = req.body
            console.log(req.body)

            const checkUser = await adminModel.findOne({ email })
            if (checkUser) {
                return res.status(400).json({
                    message: "Hospital already exists"
                })
            }

            //Encrypt the user's password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            if (password !== confirmPassword) {
                return res.status(404).json({
                    message: "Please enter the correct password"
                })
            }

            //Create a user
            const admin = new adminModel({
                hospitalName,
                email,
                password: hashedPassword,
                phoneNumber,
                hospitalAddress
            })


            const token = jwt.sign({ userId: admin._id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email }, process.env.jwtSecret, { expiresIn: "300s" })
            admin.token = token;

            const link = `${ req.protocol }://${req.get("host")}/verify/${admin.id}/${token}`

            sendEmail({
                email: admin.email,
                subject: 'KINDLY VERIFY YOUR ACCOUNT',
                html: generateDynamicEmail(link, admin.hospitalName)
            })
            await admin.save();

            return res.status(201).json({
                message: "Your profile has been created! A link has been sent to your email to verify your email address",
                data: admin
            })
            
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}



//Function to verify a new user with a link
const verifyAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        //   const token = req.params.token;
        const admin = await adminModel.findById(id);

        // Verify the token
        jwt.verify(admin.token, process.env.jwtSecret);


        // Update the user if verification is successful
        const updatedAdmin = await adminModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });

        if (updatedAdmin.isVerified === true) {
            return res.status(200).send("<h1>You have been successfully verified. Kindly visit the login page.</h1>");
        }
        //handle your redirection here
        res.redirect(`${req.protocol}://${req.get('host')}/login` )

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            // Handle token expiration
            const id = req.params.id;
            const updatedAdmin = await adminModel.findById(id);
            //const { firstName, lastName, email } = updatedUser;
            const newtoken = jwt.sign({ email: updatedAdmin.email, firstName: updatedAdmin.firstName, lastName: updatedAdmin.lastName }, process.env.jwtSecret, { expiresIn: "300s" });
            updatedAdmin.token = newtoken;
            
            updatedAdmin.save();

            const link = `${req.protocol}://${req.get('host')}/verify/${id}`;
            sendEmail({
                email: updatedAdmin.email,
                html: generateDynamicEmail(link, updatedAdmin.firstName, updatedAdmin.lastName),
                subject: "RE-VERIFY YOUR ACCOUNT"
            });
            return res.status(401).send("<h1>This link is expired. Kindly check your email for another email to verify.</h1>");
        } else {
            return res.status(500).json({
                message: "Internal server error: " + error.message,
            });

        };
    }
}



const loginAdmin = async (req, res) => {
    try {

        //Get the data from the request body
        const data = {
            email: req.body.email.toLowerCase(),
            password: req.body.password
        }
        //check if the user info provided exists in the database
        const admin = await adminModel.findOne({
            email: data.email.toLowerCase()
        });

        if (!admin) {
            return res.status(404).json({
                message: "Invalid login details"
            })

        }
        const checkPassword = bcrypt.compareSync(data.password, admin.password);
        if (!checkPassword) {
            return res.status(404).json({
                message: "Password is incorrect"
            })

        }
        

        const token = jwt.sign({
            userId: admin._id,
            email: admin.email,
        }, process.env.jwtSecret, { expiresIn: "1day" });

        const user = {
            hospitalName: admin.hospitalName,
            email: admin.email,
            isVerified: admin.isVerified,
        };
        admin.token = token;
        await admin.save();
        if (admin.isVerified === true) {
            return res.status(200).json({
                message: ` ${admin.hospitalName} has successfully logged in`,
                data: user,
                token: token
            })
        }
        else {
            return res.status(400).json({
                message: "Sorry, your account is not verified yet. Please check your mail "
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            message: "Internal server error " + err.message,
        })
    }
}
// const makeAdmin = async (req, res, next) => {
//     try {
//         const adminId = req.params.adminId
//         const admin = await adminModel.findById(adminId)

//         const adminData = await adminModel.findByIdAndUpdate(adminId, { isAdmin: true }, { new: true })
//         if (!admin) {
//             return res.status(400).json({
//                 message: `Admin with id ${adminId} does not exist`
//             })
//         }
//         else {
//             return res.status(201).json({
//                 message: `Admin with id ${adminId} updated as an Admin`,
//                 data: adminData

//             })
//         }

//     } catch (err) {
//         res.status(500).json({
//             message: err.message
//         })
//     }

// }
const forgotpassWordAdmin = async (req, res) => {
    const resetFunc = require("../forget.js")
    try {
        const checkUser = await adminModel.findOne({ email: req.body.email })
        if (!checkUser) {
            res.status(404).json("Email doesn't exist")
        } else {
            const subject = " Kindly reset your password"
            const link = `${req.protocol}://${req.get("host")}/reset/${checkUser.id}`
            const html = resetFunc(link, checkUser.firstName, checkUser.lastName)
            sendEmail({
                email: checkUser.email,
                subject: subject,
                html: html
            })


            res.status(200).json("kindly check your email for a link to reset your password")

        }
    } catch (error) {
        res.status(500).json(error.message)
    }

}


const resetpasswordAdmin = async (req, res) => {
    try {
        const password = req.body.password

        const id = req.params.id

        const salt = bcrypt.genSaltSync(10);

        const hashedPassword = bcrypt.hashSync(password, salt);

        const data = { password: hashedPassword }

        const reset = await adminModel.findByIdAndUpdate(id, data, { new: true })


        res.status(200).json(`your password has been succesfully changed`)

    } catch (error) {
        res.status(500).json(error.message)
    }
}

const uploadProfilePictureAdmin = async (req, res) => {
    try {
        const userId = req.user.userId
        const user = await adminModel.findById(userId)
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']; // Add more MIME types if needed

        // Check if the uploaded file's MIME type is allowed
        if (!allowedMimeTypes.includes(req.files.profilePicture.mimetype)) {
            return res.status(400).json({ Error: 'Only image files are allowed' });
        }
        const profilePicture = req.files.profilePicture.tempFilePath
        const fileUploader = await cloudinary.uploader.upload(profilePicture, { folder: "DocMate-Media" }, (err, profilePicture) => {
            try {

                // Delete the temporary file
                fs.unlinkSync(req.files.profilePicture.tempFilePath);

                return profilePicture
            } catch (err) {
                return err
            }
        })

        const data = {
            url: fileUploader.url,
            public_id: fileUploader.public_id
        }
        await adminModel.findByIdAndUpdate(userId, { profilePicture: data }, { new: true })
        res.status(200).json({
            message: "Profile picture updated successfully"
        });

    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while uploading the profile picture.' + error.message });
    }
};

const deleteProfilePictureAdmin = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await adminModel.findById(userId);
        if (!user) {
            res.status(404).json({
                message: 'Image does not exist'
            })
            return;
        }
        //const deletePic = user.profilePicture
        // // const index = user.profilePicture.indexOf(deletePic)
        const deleteImg = { $unset: { profilePicture: 1 } }
        await adminModel.findByIdAndUpdate(userId, deleteImg, { new: true })

        return res.status(200).json({
            message: `Profile picture deleted successfully`
        })

    } catch (err) {
        return res.status(500).json({
            message: "Internal server  error: " + err.message,
        })
    }
}
const logOutAdmin = async (req, res) => {
    try {
        //Get the user's Id from the request user payload
        const { userId } = req.user
        //
        const hasAuthorization = req.headers.authorization;
        //check if it is empty
        if (!hasAuthorization) {
            return res.status(401).json({ message: "Authorization token not found" })
        }
        //Split the token from the bearer
        const token = hasAuthorization.split(" ")[1];

        const user = await adminModel.findById(userId);

        //check if the user does not exist
        if (!user) {
            return res.status(404).json({ message: "Account not found" })
        }

        //Blacklist the token
        user.blacklist.push(token);

        await user.save();

        //Return a response

        return res.status(200).json({ message: "You have logged out successfully" })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}





module.exports = {
    register, verifyAdmin, loginAdmin, forgotpassWordAdmin, resetpasswordAdmin, uploadProfilePictureAdmin, deleteProfilePictureAdmin, logOutAdmin}
