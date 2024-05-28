const adminModel = require("../models/adminModel.js");
const sendEmail = require("../middleware/email.js");
const generateDynamicEmail = require("../verifyAdmin.js");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
// const {validateUser} = require("../middleware/validator.js")
const cloudinary = require("../middleware/cloudinary")
const notificationModel = require("../models/notificateModel")
const Payment = require('../models/paymentModel');
const { validateAdmin } = require("../middleware/validator.js");
const patientModel = require("../models/userModel.js");
const paymentModel = require("../models/paymentModel.js")
const appointmentModel = require("../models/appModel.js");
const hospitalModel = require("../models/adminModel.js");


const register = async (req, res) => {
    try {
        const { error } = validateAdmin(req.body);
        if (error) {
            res.status(500).json({
                message: error.details[0].message
            })
            return;
        } else {
            //Get the required field from the request object body

            const hospitalName = req.body.hospitalName.toLowerCase();
            const hospitalAddress = req.body.hospitalAddress;
            const email = req.body.email.toLowerCase();
            const password = req.body.password;
            const phoneNumber = req.body.phoneNumber;
            const confirmPassword = req.body.confirmPassword



            const checkUser = await adminModel.findOne({ email: email.toLowerCase() })
            if (checkUser) {
                return res.status(400).json({
                    message: "Hospital already exists"
                })
            }

            //Encrypt the user's password

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            // if (password !== confirmPassword) {
            //     return res.status(400).json({
            //         message: "Password must match"
            //     })
            // }

            //Create a user
            const user = new adminModel({
                hospitalName,
                email,
                password: hashedPassword,
                hospitalAddress,
                phoneNumber,
            }
            )

            const token = jwt.sign({ userId: user._id, hospitalName: user.hospitalName, hospitalAddress: user.hospitalAddress, email: user.email }, process.env.jwtSecret, { expiresIn: "300s" })



            const link = `${req.protocol}://${req.get("host")}/verify-admin/${user.id}/${token}`


            sendEmail({

                email: user.email,
                subject: 'KINDLY VERIFY YOUR ACCOUNT',
                html: generateDynamicEmail(link, user.hospitalName)


            })


            await user.save();

            return res.status(201).json({
                message: "Your profile has been created! A link has been sent to your email to verify your email address",
                data: user
            })


        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })

    }
}

//Function to verify a new user with a link
// const verifyAdmin = async (req, res) => {
//     try {
//         const id = req.params.id;
//         //   const token = req.params.token;
//         const admin = await adminModel.findById(id);

//         // Verify the token
//         jwt.verify(admin.token, process.env.jwtSecret);


//         // Update the user if verification is successful
//         const updatedAdmin = await adminModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });

//         if (updatedAdmin.isVerified === true) {
//             return res.status(200).send("<h1>You have been successfully verified. Kindly visit the login page.</h1>");
//         }
//         //handle your redirection here
//         res.redirect(`${req.protocol}://${req.get('host')}/adminlogin` )

//     } catch (error) {
//         if (error instanceof jwt.JsonWebTokenError) {
//             // Handle token expiration
//             const id = req.params.id;
//             const updatedAdmin = await adminModel.findById(id);
//             //const { firstName, lastName, email } = updatedUser;
//             const newtoken = jwt.sign({ email: updatedAdmin.email, firstName: updatedAdmin.firstName, lastName: updatedAdmin.lastName }, process.env.jwtSecret, { expiresIn: "300s" });
//             updatedAdmin.token = newtoken;

//             updatedAdmin.save();

//             const link = `${req.protocol}://${req.get('host')}/verify-admin/${id}/${token}`;
//             sendEmail({
//                 email: updatedAdmin.email,
//                 html: generateDynamicEmail(link, updatedAdmin.firstName, updatedAdmin.lastName),
//                 subject: "RE-VERIFY YOUR ACCOUNT"
//             });
//             return res.status(401).send("<h1>This link is expired. Kindly check your email for another email to verify.</h1>");
//         } else {
//             return res.status(500).json({
//                 message: "Internal server error: " + error.message,
//             });

//         };
//     }
// }

const verifyAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        const token = req.params.token;
        const admin = await adminModel.findById(id);

        // Verify if the token has expired
        try {
            jwt.verify(token, process.env.jwtSecret);
        } catch (err) {
            // Token has expired
            const newToken = jwt.sign({ email: admin.email, firstName: admin.firstName, lastName: admin.lastName }, process.env.jwtSecret, { expiresIn: "300s" });
            admin.token = newToken;
            await admin.save();

            // Send a new verification email
            const link = `${req.protocol}://${req.get('host')}/verify/${id}/${newToken} `;
            sendEmail({
                email: admin.email,
                html: generateDynamicEmail(link, admin.firstName, admin.lastName),
                subject: "RE-VERIFY YOUR ACCOUNT"
            });

            return res.status(401).send("<h1>This link is expired. Kindly check your email for another email to verify.</h1>");
        }

        // Update the user if verification is successful
        const updatedAdmin = await adminModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });

        if (updatedAdmin.isVerified === true) {
            // Redirect the user to the login page after successful verification
            //return res.redirect( `${req.protocol}://${req.get('host')}/login`);
            return res.redirect(`https://docmate-tau.vercel.app/#/hospitalLogin`);

        }
    } catch (error) {
        // Handle other errors
        return res.status(500).json({
            message: "Internal server error: " + error.message
        });
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
            id: admin._id,
            isVerified: admin.isVerified,
            profilePicture: admin.profilePicture,
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
    catch (error) {
        return res.status(500).json({
            message: "Internal server error " + error.message,
        })
    }
}

const forgotpassWordAdmin = async (req, res) => {
    const resetFunc = require("../forgetAdmin.js")
    try {
        const checkUser = await adminModel.findOne({ email: req.body.email })
        if (!checkUser) {
            res.status(404).json("Email doesn't exist")
        } else {
            const subject = " Kindly reset your password"
            const link = `${req.protocol}://https://docmate-tau.vercel.app/#/setPasswordHospital${checkUser.id}`
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

        const confirmPassword = req.body.confirmPassword

        const id = req.params.id

        const salt = bcrypt.genSaltSync(10);

        const hashedPassword = bcrypt.hashSync(password, salt);

        const data = { password: hashedPassword }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Password must match"
            })
        }

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
            } catch (error) {
                return error
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
        return res.status(500).json({
            error: 'An error occurred while uploading the profile picture.' + error.message
        });
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

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

const getAllRequest = async (req, res) => {
    try {
        const notification = await notificationModel.find().sort({ createdAt: -1 });
        if (!notification) {
            res.status(404).json({
                message: "No request found",
            });
        } else {
            res.status(201).json({
                message: "All appointment request.",
                data: notification,
                totalNumberOfAppointmentRequests: notification.length,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
};

const viewOneAppointRequest = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;

        const request = await notificationModel.findById(appointmentId);
        if (!request) {
            return res.status(404).json({
                message: 'The appointment request not found'
            })
            return;
        } else {
            return res.status(200).json({
                message: `The appointment request with : ${request.fullName} has been found`,
                data: request
            })
        }
    } catch (err) {
        res.status(500).json({
            message: "internal server error: " + err.message
        })
    }

}
const getOneAdmin = async (req, res) => {
    try {
        const Id = req.user.userId;

        const user = await adminModel.findById(Id);
        if (!user) {
            return res.status(404).json({
                message: 'Hospital no found'
            })

        } else
            return res.status(200).json({
                message: `The hospital's id: ${Id} has been found`,
                data: user
            })
    }
    catch (error) {
        return res.status(500).json({
            message: "internal server error: " + error.message
        })
    }
}





const deleteRequest = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const request = await notificationModel.findById(appointmentId);
        if (!request) {
            return res.status(404).json({
                message: 'The appointment request not found'
            })

        }

        await notificationModel.findByIdAndDelete(appointmentId)
        return res.status(200).json({
            message: `The appointment request with appointmentId: ${appointmentId} deleted successfully`,
            data: request
        })

    } catch (err) {
        res.status(500).json({
            message: "Internal server  error: " + err.message,
        })
    }
}

//   exports.getAllHospitals = async (req, res) => {
//     try {
//         const comment = await commentModel.find()
//         if (comment.length === 0) {
//             return res.status(200).json({
//                 message: "No Comment found"
//             })
//         }
//         return res.status(200).json({
//             message: "These are the comments in the blog",
//             comment
//         })
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         })
//     }
// }


// const getAllPatient = async (req, res) => {
//     try {
//         const patient = await patientModel.find().sort({ createdAt: -1 }).populate();
//         if (patient.length === 0) {
//             return res.status(200).json({
//                 message: "There are currently no Patients in the database."
//             })
//         } else {
//             return res.status(200).json({
//                 message: "List of available patients",
//                 totalNumberOfPatients: patient.length,
//                 data: patient
//             })
//         }

//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         })
//     }
// }



// const getAllPatientsInHospital = async (req, res) => {
//     try {
//         const id = req.user.userId
//         const {HospitalId} = req.params
//         const Patient = await patientModel.findById(id, {HospitalId})
//         if (!Patient || Patient.length === 0) {
//             return res.status(404).json({
//                 error: "No patient found in this hospital"
//             })
//         }
//         res.status(200).json({
//             message: `Patients in hospital ID ${HospitalId} have been found`
//         })
//     } catch (error) {
//         res.status(500).json({
//             error: error.message
//         })
//     }
// };


const getAllPatientsInHospital = async (req, res) => {
    try {
        console.log(req.user)
        const id = req.user.userId;
        // Query the database to find all patients in the specified hospital
        const patients = await patientModel.find({ hospitals: id });

        if (!patients || patients.length === 0) {
            return res.status(404).json({
                error: "No patients found in this hospital"
            });
        }

        res.status(200).json({
            message: `Patients in hospital ID ${hospitalId} have been found`,
            data: patients
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};




const getOnePatient = async (req, res) => {
    try {
        const Id = req.params.Id;

        const request = await patientModel.findById(Id);
        if (!request) {
            return res.status(404).json({
                message: 'No Patient found'
            })

        } else {
            return res.status(200).json({
                message: `The patient with: ${request.firstName} has been found`,
                data: newData
            })
        }
    } catch (err) {
        return res.status(500).json({
            message: "internal server error: " + err.message
        })
    }

}
// const deleteOnePatient = async (req, res) => {
//     try {
//         const id = req.params.id
//         const findPatient = await patientModel.findByIdAndDelete(id)
//         if (!findPatient) {
//             return res.status(404).json({
//                 message: "Unable to find patient to be deleted"
//             })
//         }
//         return res.status(200).json({
//             message: `The patient with: ${findPatient.firstName} has been found`
//         })
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         })
//     }
// }


const updateAdminProfile = async (req, res) => {
    try {
        // const userId = req.user.userId;
        const { id } = req.params
        const { email, address, phoneNumber } = req.body;

        // check for errors
        if (!email || !address || !phoneNumber) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }
        //update user's info
        const updatedInfo = await adminModel.findByIdAndUpdate(id, { email, address, phoneNumber }, { new: true });

        //check if the user exist
        if (!updatedInfo) {
            return res.status(400).json({
                message: "Unable to update user"
            })
        }
        // throw a success response
        res.status(200).json({
            message: "Admin information updated successfully",
            updatedInfo
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error: " + error.message
        });
    }
};
const getPayments = async (req, res) => {
    try {
        //const userId = req.user.userId;
        const hospitalId = req.user.userId;
        if (!hospitalId) {
            return res.status(404).json({ message: "You are not authenticated" }); // Note the added return statement
        }
        const payments = await Payment.find({ hospital: hospitalId });
        return res.status(200).json({ message: 'Payments retrieved successfully', payments, }); // Only one response is sent
    } catch (error) {
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
};





// const getPayments = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const hospitalId = req.user.hospitalId; // Assuming you have a hospitalId in the user object

//         if (!userId || !hospitalId) {
//             res.status(404).json({ message: "You are not authenticated" });
//         }

//         const payments = await Payment.find({ hospital: hospitalId }); // Filter payments by hospitalId

//         return res.status(200).json({
//             message: 'Payments retrieved successfully',
//             payments,
//         });
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error: ' + error.message });
//     }
// };


//     try {
//         const userId = req.user.userId
//         if(!userId){
//             res.status(404).json({
//                 message: "You are not authenticated"
//             })
//         }
//         const payments = await Payment.find();

//         res.status(200).json({
//             message: 'Payments retrieved successfully',
//             payments
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: 'Internal server error: ' + error.message
//         });
//     }
// };

const deletePayment = async (req, res) => {
    try {
        const user = req.user.userId
        const paymentId = req.params.paymentId;

        // Check if paymentId is provided
        if (!paymentId) {
            return res.status(400).json({
                error: 'Payment ID is required'
            });
        }

        // Find and delete the payment record by ID
        const deletedPayment = await Payment.findByIdAndDelete(paymentId);

        if (!deletedPayment) {
            return res.status(404).json({
                message: 'Payment not found'
            });
        }

        res.status(200).json({
            message: 'Payment deleted successfully',
            payment: deletedPayment
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error: ' + error.message
        });
    }
};

const deleteAllPayments = async (req, res) => {
    try {
        const userId = req.user.userId
        // Delete all payment records
        await Payment.deleteMany({});

        res.status(200).json({
            message: 'All payments deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error: ' + error.message
        });
    }
};








// const checkPaymentStatus = async (req, res) => {
//     try {
//         const paymentId = req.params.paymentId;
//         //Payment model defined
//         const payment = await paymentModel.findById(paymentId);

//         if (!payment) {
//             // If payment is not found
//             return "Payment not found";
//         }

//         if (payment.status === "paid") {
//             // If payment status is already "paid"
//             return res.status(200).json({
//                 error: "Payment has already been made"
//             });
//         }

//         // Update users payment status to be paid
//         payment.status = "paid";
//         await payment.save();

//         // Return success confirmation message
//         res.status(200).json({
//             message: "Payment confirmed"
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: "Internal server error: " + error.message
//         });
//     }
// };

// const checkPaymentStatus = async (req, res) => {
//     try {
//         const hospitalId = req.user.hospitalId; 
//         const paymentId = req.params.paymentId;

//         // Check if payment belongs to the specified hospital
//         const payment = await paymentModel.findOne({ _id: paymentId, hospitalId });

//         if (!payment) {
//             // If payment is not found or doesn't belong to the hospital
//             return res.status(404).json({
//                 message: "Payment not found" 
//             });
//         }

//         if (payment.status === "paid") {
//             // If payment status is already "paid"
//             return res.status(200).json({ 
//                 message: "Payment has already been made" 
//             });
//         }

//         // Update payment status to "paid"
//         payment.status = "paid";
//         await payment.save();

//         // Return success confirmation message
//         return res.status(200).json({ 
//             message: "Payment confirmed" 
//         });
//     } catch (error) {
//         return res.status(500).json({ 
//             message: "Internal server error: " + error.message 
//         });
//     }
// };






module.exports = {
    register, verifyAdmin, loginAdmin, getOneAdmin, forgotpassWordAdmin, getOnePatient, resetpasswordAdmin, uploadProfilePictureAdmin, deleteProfilePictureAdmin, logOutAdmin, getAllRequest, deleteRequest, viewOneAppointRequest, getPayments, deletePayment, deleteAllPayments, updateAdminProfile, getAllPatientsInHospital
}
