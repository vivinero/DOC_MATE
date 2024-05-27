const patientModel = require("../models/userModel.js");
const sendEmail = require("../middleware/email.js");
const generateDynamicEmail = require("../verify.js");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const multer = require("multer")
const cloudinary = require("../middleware/cloudinary.js")
const fs = require("fs")
const Payment = require('../models/paymentModel'); // Import the Payment model
const hospitalModel = require("../models/adminModel.js")
const mongoose = require("mongoose");
require('dotenv').config()


const {
    validateUser,
    validateUserLogin,
    validateResetPassword,
    validateUserForgotPassword,
    validateUserProfile,
    validateDateTime

} = require("../middleware/validator.js")

const signUp = async (req, res) => {
    try {
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            })

        } else {
            //Get the required field from the request object body

            const firstName = req.body.firstName.trim();
            const lastName = req.body.lastName.trim();
            const email = req.body.email.trim();
            const password = req.body.password.trim();
            const confirmPassword = req.body.confirmPassword.trim();


            const checkPatient = await patientModel.findOne({ email: email.toLowerCase() })
            if (checkPatient) {
                return res.status(400).json({
                    message: "Profile already exists"
                })
            }

            //Encrypt the user's password

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: "Password must match"
                })
            }

            //Create a user
            const patient = new patientModel({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                confirmPassword: hashedPassword
            }
            )

            const token = jwt.sign({ userId: patient._id, firstName: patient.firstName, lastName: patient.lastName, email: patient.email }, process.env.jwtSecret, { expiresIn: "300s" })
            patient.token = token;


            const link = `${ req.protocol }://${req.get("host")}/verify/${patient.id}/${token}`
            sendEmail({

                email: patient.email,
                subject: 'KINDLY VERIFY YOUR ACCOUNT',
                html: generateDynamicEmail(link, patient.firstName, patient.lastName)


            })

            patient.patientId = patient._id

            await patient.save();

            return res.status(201).json({
                message: "Your profile has been created! A link has been sent to your email to verify your email address",
                data: patient
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })

    }
}


//Function to verify a new user with a link
// const verify = async (req, res) => {
//     try {
//         const id = req.params.id;
//           const token = req.params.token;
//         const patient = await patientModel.findById(id);

//         // Verify the token
//         jwt.verify(token, process.env.jwtSecret);


//         // Update the user if verification is successful
//         const updatedPatient = await patientModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });

//         if (updatedPatient.isVerified === true) {
//             // return res.status(200).send("<h1>You have been successfully verified. Kindly visit the login page.</h1>");
//             res.redirect(`${req.protocol}://${req.get('host')}/login` )
//         }
//         //handle your redirection here
        

//     } catch (error) {
//         if (error instanceof jwt.JsonWebTokenError) {
//             // Handle token expiration
//             const id = req.params.id;
//             const updatedPatient = await patientModel.findById(id);
//             //const { firstName, lastName, email } = updatedUser;
//             const newtoken = jwt.sign({ email: updatedPatient.email, firstName: updatedPatient.firstName, lastName: updatedPatient.lastName }, process.env.jwtSecret, { expiresIn: "300s" });
//             updatedPatient.token = newtoken;
//             updatedPatient.save();

//             const link = `${req.protocol}://${req.get('host')}/verify/${id}`;
//             sendEmail({
//                 email: updatedPatient.email,
//                 html: generateDynamicEmail(link, updatedPatient.firstName, updatedPatient.lastName),
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

const verify = async (req, res) => {
    try {
        const id = req.params.id;
        const token = req.params.token;
        const patient = await patientModel.findById(id);

        // Verify if the token has expired
        try {
            jwt.verify(token, process.env.jwtSecret);
        } catch (err) {
            // Token has expired
            const newToken = jwt.sign({ email: patient.email, firstName: patient.firstName, lastName: patient.lastName }, process.env.jwtSecret, { expiresIn: "300s" });
            patient.token = newToken;
            await patient.save();
            
            // Send a new verification email
            const link =  `${req.protocol}://${req.get('host')}/verify/${id}/${newToken} `;
            sendEmail({
                email: patient.email,
                html: generateDynamicEmail(link, patient.firstName, patient.lastName),
                subject: "RE-VERIFY YOUR ACCOUNT"
            });

            return res.status(401).send("<h1>This link is expired. Kindly check your email for another email to verify.</h1>");
        }

        // Update the user if verification is successful
        const updatedPatient = await patientModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });

        if (updatedPatient.isVerified === true) {
            // Redirect the user to the login page after successful verification
            return res.redirect(`https://docmate-tau.vercel.app/#/patientLogin`);
        }
    } catch (error) {
        // Handle other errors
        return res.status(500).json({
            message: "Internal server error: " + error.message
        });
    }
}


const login = async (req, res) => {
    try {

        //Get the data from the request body
        const data = {
            email: req.body.email.toLowerCase(),
            password: req.body.password
        }
        //check if the user info provided exists in the database
        const patient = await patientModel.findOne({
            email: data.email.toLowerCase()
        });

        if (!patient) {
            return res.status(404).json({
                message: "Invalid login details"
            })

        }
        const checkPassword = bcrypt.compareSync(data.password, patient.password);
        if (!checkPassword) {
            return res.status(404).json({
                message: "Password is incorrect"
            })

        }

        const token = jwt.sign({
            userId: patient._id,
            email: patient.email,
        }, process.env.jwtSecret, { expiresIn: "1day" });

        const user = {
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            isVerified: patient.isVerified,
            id: patient._id,
            bloodType: patient.bloodType,
            patientAddress: patient.patientAddress,
            allergies: patient.allergies,
            gender: patient.gender,
            phoneNumber: patient.phoneNumber,
            profilePicture: patient.profilePicture,

        };
        patient.token = token;
        await patient.save();
        if (patient.isVerified === true) {
            return res.status(200).json({
                message: `Welcome ${patient.firstName}`,
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

const forgotpassWord = async (req, res) => {
    const resetFunc = require("../forget.js")
    try {
        const { error } = validateUserForgotPassword(req.body);
        if (error) {
            res.status(500).json({
                message: error.details[0].message
            })
            return;
        } else {
            const patient = await patientModel.findOne({ email: req.body.email })
            if (!patient) {
                res.status(404).json("Email doesn't exist")
            } else {
                const subject = " Kindly reset your password"
                const link = `https://docmate-tau.vercel.app/#/setPassword/${patient.id}`
                const html = resetFunc(link, patient.firstName, patient.lastName)
                sendEmail({
                    email: patient.email,
                    subject: subject,
                    html: html
                })
                res.status(200).json("kindly check your email for a link to reset your password")
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error " + error.message,
        })
    }

}


const resetpassword = async (req, res) => {
    try {
        const { error } = validateResetPassword(req.body);
        if (error) {
            res.status(500).json({
                message: error.details[0].message
            })
            return;
        } else {
            const password = req.body.password
            const confirmPassword =req.body.password

            const id = req.params.id

            const salt = bcrypt.genSaltSync(10);

            const hashedPassword = bcrypt.hashSync(password, salt);

            const data = { password: hashedPassword }
            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: "Password must match"
                })
            }

            const reset = await patientModel.findByIdAndUpdate(id, data, { new: true })


            res.status(200).json("your password has been succesfully changed")
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error " + error.message,
        })
    }
}

const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.userId

        const user = await patientModel.findById(userId)
        
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

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
        await patientModel.findByIdAndUpdate(userId, { profilePicture: data }, { new: true })

        res.status(200).json({
            message: "Profile picture updated successfully"
        });

    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while uploading the profile picture.' + error.message });
    }
};


const deleteProfilePicture = async (req, res) => {
    try {
        const userId = req.user.userId;
        const patient = await patientModel.findById(userId);
        if (!patient) {
            res.status(404).json({
                message: 'Image does not exist'
            })
            return;
        }
        //const deletePic = user.profilePicture
        // // const index = user.profilePicture.indexOf(deletePic)
        const deleteImg = { $unset: { profilePicture: 1 } }
        await patientModel.findByIdAndUpdate(userId, deleteImg, { new: true })

        return res.status(200).json({
            message: `Profile picture deleted successfully`
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server  error: " + error.message,
        })
    }
}

// const updateProfile = async (req, res) => {
//     try {
//         const { error } = validateUserProfile(req.body);
//         if (error) {
//             return res.status(500).json({
//                 message: error.details[0].message
//             })

//         } else {
//         const userId = req.params.userId;       
//         const profile = await patientModel.findById(userId);
//         if (!profile) {
//             return res.status(404).json({
//                 message: "The Patient's  information not found"
//             })
            
//         }

//         const profileData = {
//             bloodType: req.body.bloodType || profile.bloodType,
//             allergies: req.body.allergies || profile.allergies,
//             patientAddress: req.body.patientAddress || profile.patientAddress,
//             phoneNumber: req.body.phoneNumber || profile.phoneNumber,
//             gender: req.body.gender || profile.gender
//         }

//         const newProfile = await patientModel.findByIdAndUpdate(userId, profileData, {new:true});
//         console.log(newProfile)
//         if (!newProfile) { 
//             return res.status(404).json({
//                 message: "The Patient's information not found"
//             })
            
//         } 
        

//         newProfile.profileUpdated = true;
        
//         await newProfile.save();
//         const newData = {
//             firstName: newProfile.firstName,
//             lastName: newProfile.lastName,
//             bloodType: newProfile.bloodType,
//             allergies: newProfile.allergies,
//             patientAddress: newProfile.patientAddress,
//             phoneNumber: newProfile.phoneNumber,
//             gender: newProfile.gender
//         }
            

        
//         return res.status(200).json({
//             message: "Your profile has been updated successfully",
//             data: newData
//         })
//     }
        
//     } catch (err) {
//         return res.status(500).json({
//             message: "Internal server error: " +err.message
//         })
//     } 
// }

const createProfile = async (req, res) => {
    try {
        // Validate the user profile data
        const { error } = validateUserProfile(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        // Extract user ID from request parameters
        const userId = req.params.userId;

        // Find the user profile by ID
        const profile = await patientModel.findById(userId);
        if (!profile) {
            return res.status(404).json({
                message: "The patient's information was not found"
            });
        }

        

        // Prepare updated profile data
        const profileData = {
            bloodType: req.body.bloodType,
            allergies: req.body.allergies,
            patientAddress: req.body.patientAddress,
            phoneNumber: req.body.phoneNumber,
            gender: req.body.gender,
            age: req.body.age,
            profileUpdated: true
        };

        // Update the user profile
        const newProfile = await patientModel.updateOne({_id:userId}, profileData, { new: true });
        if (!newProfile) {
            return res.status(404).json({
                message: "Failed to update the patient's information"
            });
        }
        // newProfile.profileUpdated = true
        // await newProfile.save()

        // const newData = {
        //     firstName: newProfile.firstName,
        //     lastName: newProfile.lastName,
        //     bloodType: newProfile.bloodType,
        //     allergies: newProfile.allergies,
        //     patientAddress: newProfile.patientAddress,
        //     phoneNumber: newProfile.phoneNumber,
        //     gender: newProfile.gender,
        //     age: newProfile.age
        // }
        // Respond with success message and updated profile data
        return res.status(200).json({
            message: "Your profile has been updated successfully",
            data: newProfile
        });
    } catch (error) {
        // Handle internal server error
        console.error("Error updating user profile:", error);
        return res.status(500).json({
            message: "Internal server error" + error.message
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        // Validate the user profile data
        const { error } = validateUserProfile(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        // Extract user ID from request parameters
        const userId = req.params.userId;

        // Find the user profile by ID
        const profile = await patientModel.findById(userId);
        if (!profile) {
            return res.status(404).json({
                message: "The patient's information was not found"
            });
        }

        

        // Prepare updated profile data
        const profileData = {
            bloodType: req.body.bloodType || profile.bloodType,
            allergies: req.body.allergies || profile.allergies,
            patientAddress: req.body.patientAddress || profile.patientAddress,
            phoneNumber: req.body.phoneNumber || profile.phoneNumber,
            gender: req.body.gender || profile.gender,
            age: req.body.age || profile.age,
            profileUpdated: true
        };

        // Update the user profile
        const newProfile = await patientModel.updateOne({_id:userId}, profileData, { new: true });
        if (!newProfile) {
            return res.status(404).json({
                message: "Failed to update the patient's information"
            });
        }
        // newProfile.profileUpdated = true
        // await newProfile.save()

        // const newData = {
        //     firstName: newProfile.firstName,
        //     lastName: newProfile.lastName,
        //     bloodType: newProfile.bloodType,
        //     allergies: newProfile.allergies,
        //     patientAddress: newProfile.patientAddress,
        //     phoneNumber: newProfile.phoneNumber,
        //     gender: newProfile.gender,
        //     age: newProfile.age
        // }
        // Respond with success message and updated profile data
        return res.status(200).json({
            message: "Your profile has been updated successfully",
            data: newProfile
        });
    } catch (error) {
        // Handle internal server error
        console.error("Error updating user profile:", error);
        return res.status(500).json({
            message: "Internal server error" + error.message
        });
    }
}



const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await hospitalModel.find().sort({createdAt: -1}).populate();
        if (hospitals.length === 0) {
           return res.status(200).json({
                message: "There are currently no Hospitals in the database."
            })
        }else {
            return res.status(200).json({
                message: `There are ${hospitals.length} in the database`,
                data: hospitals
            })
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const getOnePatient = async (req, res) => {
    try {
      const Id = req.user.userId;
  
      const user = await patientModel.findById(Id);
      if (!user) {
        return res.status(404).json({
          message: 'User cannot be found'
        })

      } else {
        return res.status(200).json({
          message: `The user's id: ${Id} has been found`,
          data: user
        })
      }
    } catch (error) {
     return res.status(500).json({
        message: "internal server error: " + error.message
      })
    }
  
  }
 


const getOneHospital = async (req, res) => {
    try {
      const Id = req.params.Id;
  
      const request = await hospitalModel.findById(Id).populate();
      if (!request) {
        return res.status(404).json({
          message: 'No hospital found'
        })

      } else {
        return res.status(200).json({
          message: `The hospital with id: ${Id} found`,
          data: request
        })
      }
    } catch (err) {
     return res.status(500).json({
        message: "internal server error: " + err.message
      })
    }
  
  }

 
  
  const confirmPayment = async (req, res) => {
      try {
          const { firstName, lastName, email, phoneNumber, hospitalId, appointmentDate } = req.body;
          const userId = req.user.userId;
  
          // Validate the request body
          if (!firstName || !lastName || !email || !phoneNumber || !hospitalId || !appointmentDate) {
              return res.status(400).json({
                  error: 'All fields are required'
              });
          }
  
          // Validate the date (optional, for example, check if it's a valid date)
          if (isNaN(Date.parse(appointmentDate))) {
              return res.status(400).json({
                  error: 'Invalid date format'
              });
          }
  
          // Check if the hospital exists
          if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
              return res.status(400).json({
                  error: 'Invalid hospital ID format'
              });
          }
  
          const hospital = await hospitalModel.findById(hospitalId);
          if (!hospital) {
              return res.status(404).json({
                  error: 'Hospital not found'
              });
          }
  
          // Save payment details to the database
          const payment = new Payment({
              firstName,
              lastName,
              email,
              phoneNumber,
              hospitalId: hospitalId, // Store hospitalId in the payment
              appointmentDate,
              userId
          });
         // payment.hospitalId.push(hospitalId)
          await payment.save();
  
          // Return the patient details as confirmation
          res.status(200).json({
              message: 'Payment confirmed and details received',
              patientDetails: {
                  firstName,
                  lastName,
                  email,
                  phoneNumber,
                  hospitalId,
                  appointmentDate,
                  userId
              },
          });
      } catch (error) {
          res.status(500).json({
              error: 'Internal server error: ' + error.message
          });
      }
  };
  
 
  

// const confirmPayment = async (req, res) => {
//     try {
//         const { firstName, lastName, email, phoneNumber, hospitalId, appointmentDate } = req.body;
//         const userId = req.user.userId;

//         // Validate the request body
//         if (!firstName || !lastName || !email || !phoneNumber || !hospitalId || !appointmentDate) {
//             return res.status(400).json({
//                 error: 'All fields are required'
//             });
//         }

//         // Validate the date (optional, for example, check if it's a valid date)
//         if (isNaN(Date.parse(appointmentDate))) {
//             return res.status(400).json({
//                 error: 'Invalid date format'
//             });
//         }

//         // Save payment details to the database
//         const payment = new Payment({
//             firstName,
//             lastName,
//             email,
//             phoneNumber,
//             hospitalId,
//             appointmentDate,
//             userId
//         });

//         await payment.save();

//         // Return the patient details as confirmation
//         res.status(200).json({
//             message: 'Payment confirmed and details received',
//             patientDetails: {
//                 firstName,
//                 lastName,
//                 email,
//                 phoneNumber,
//                 hospitalId,
//                 appointmentDate,
//                 userId
//             },
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: 'Internal server error: ' + error.message
//         });
//     }
// };

// const confirmPayment = async (req, res) => {
//     try {
//         const { firstName, lastName, email, phoneNumber, hospitalId, appointmentDate } = req.body;
//         const userId = req.user.userId;

//         // Validate the request body
//         if (!firstName || !lastName || !email || !phoneNumber || !hospitalId || !appointmentDate) {
//             return res.status(400).json({
//                 error: 'All fields are required'
//             });
//         }

//          // Validate the date (optional, for example, check if it's a valid date)
//          if (isNaN(Date.parse(appointmentDate))) {
//             return res.status(400).json({
//                 error: 'Invalid date format'
//             });
//         }


//         // Return the patient details as confirmation
//         res.status(200).json({
//             message: 'Payment confirmed and details received',
//             patientDetails: {
//                 firstName,
//                 lastName,
//                 email,
//                 phoneNumber,
//                 hospitalId,
//                 appointmentDate,
//                 userId
//             },
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: 'Internal server error: ' + error.message
//         });
//     }
// };

// module.exports = router;



const logOut = async (req, res) => {
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

        const user = await patientModel.findById(userId);

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

// const searchHospital = async (req, res) => {
//     try {
//         // Get the user's search query
//         const searchQuery = req.query.q;
//         if (!searchQuery) {
//             return res.status(400).json({
//                 error: "Can't search an empty field"
//             });
//         }
//         // Debug: Log the search query
//         console.log(`Searching for hospitals with query: ${searchQuery}`);

//         // Search hospitals by name
//         let hospitals = await hospitalModel.find({ hospitalName: { $regex: `^${searchQuery}`, $options: 'i' } })
//         console.log(`Found hospitals: ${hospitals}`); 
//             // If no hospital found, return an error
//             if (!hospitals || hospitals.length === 0) {
//                 return res.status(404).json({
//                     error: `No result found for ${searchQuery}`
//                 });
//             }
//  else {
//             // Extract hospital details from the hospital search
//             hospitals = hospitals.map(hospital => ({
//                 id: hospital._id,
//                 name: hospital.hospitalName,
//                 email: hospital.email,
//                 address: hospital.hospitalAddress,
//             }));
//         }

//         // Return the hospitals found
//         return res.status(200).json({
//             message: `${hospitals.length} hospital(s) found for ${searchQuery}`,
//             data: hospitals
//         });

//     } catch (err) {
//         return res.status(500).json({
//             error: err.message
//         });
//     }
// }



const searchHospital = async (req, res) => {
  try {
    // Extract the search query from the request
    const searchQuery = req.query.q;
    console.log(req.query);
    let hospitals;

    if (searchQuery) {

      // If search query is provided, filter hospitals by name starting with the query
      hospitals = await hospitalModel.find({
        hospitalName: { $regex: `^${searchQuery}`, $options: 'i' }
      })
        .sort({ hospitalName: 1 }); // Sort hospitals alphabetically by name
    } else {
      // If no search query is provided, return an empty array
      hospitals = [];
    }
    console.log(`Search query: ${searchQuery}`);
    console.log(`Hospitals: ${hospitals}`);


    if (hospitals.length === 0) {
      return res.status(200).json({ message: "No hospitals found." });
    } else {
      return res.status(200).json({
        message: "List of hospitals",
        totalNumberOfHospitals: hospitals.length,
        data: hospitals
        
      });
      
    }

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }}







module.exports = {
    signUp, verify, login, forgotpassWord, updateProfile, resetpassword, getOnePatient, getAllHospitals, getOneHospital, uploadProfilePicture, confirmPayment, deleteProfilePicture, logOut, searchHospital
}
