const hapiJoiValidator = require("@hapi/joi");

const joi = require('@hapi/joi');

const validateUser = (data) => {
    try {
        const validateSchema = joi.object({
            firstName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().required().messages({
                'string.empty': "First name field can't be left empty",
                'string.min': "Minimum of 3 characters for the first name field",
                'any.required': "Please first name is required",
                "string.pattern.base": "Please no space is allowed/No special characters allowed"
            }),
            lastName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().required().messages({
                'string.empty': "Last name field can't be left empty",
                'string.min': "Minimum of 3 characters for the last name field",
                'any.required': "Please last name is required"
            }),
            // userName: joi.string().min(3).max(30).alphanum().trim().required().messages({
            //     'string.empty': "Username field can't be left empty",
            //     'string.min': "Minimum of 3 characters for the username field",
            //     'any.required': "Please username is required"
            // }),
            phoneNumber: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).required().messages({
                'string.empty': "Phone number field can't be left empty",
                'string.min': "Phone number must be atleast 11 digit long e.g: 08123456789",
                'any.required': "Please phone number is required",
                "string.pattern.base": "Invalid phone number"
            }),
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            gender: hapiJoiValidator.string().valid("male", "female", "Male", "F", "M", "Female", "FEMALE", "MALE").trim().required().min(4).max(6)
                    .pattern(/^[A-Za-z\s]+$/).messages({
                      'string.empty': 'Gender cannot be empty',
                      'string.min': 'Minimum 4 characters required for gender',
                      'string.max': 'Maximum 6 characters allowed',
                      'any.pattern.base': 'Gender should only contain letters and no spaces',
                      'any.required': 'Gender is required',
                    }),
                    password: hapiJoiValidator.string().required().min(8)
                            .pattern(new RegExp(/^(?=.*[A-Za-z0-9])[A-Za-z0-9 !@#$%^&*()_+{}[\]:;<>,.?~\\/-]+$/)).messages({
                              'string.empty': 'Password cannot be empty',
                               'string.min': 'Minimum 8 characters required',
                              'any.pattern.base': 'Password should contain letters, numbers, and special characters',
                             'any.required': 'Password is required',
                             "string.pattern.base": "Empty space not allowed"
                         }),
                            confirmPassword: hapiJoiValidator.string().required().min(8)
                           .pattern(new RegExp(/^(?=.*[A-Za-z0-9])[A-Za-z0-9 !@#$%^&*()_+{}[\]:;<>,.?~\\/-]+$/)).messages({
                             'string.empty': 'Password cannot be empty',
                              'string.min': 'Minimum 8 characters required',
                            'any.pattern.base': 'Password should contain letters, numbers, and special characters',
                            'any.required': 'Passwords do not match',
                            "string.pattern.base": "Empty space not allowed"
                            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        return res.status(500).json({
            Error: "Error while validating user: " + error.message,
        })
    }
}


const validateUserLogin = (data) => {
    try {
        const validateSchema = joi.object({
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            userName: joi.string().min(3).max(30).alphanum().trim().messages({
                'string.empty': "Username field can't be left empty",
                'string.min': "Minimum of 3 characters for the username field",
                'any.required': "Please username is required"
            }),
            password: joi.string().min(8).max(20).regex(/^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        return res.status(500).json({
            Error: "Error while validating user: " + error.message,
        })
    }
}


const validateUserForgotPassword = (data) => {
    try {
        const validateSchema = joi.object({
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            })
        })
        return validateSchema.validate(data);
    } catch (error) {
        return res.status(500).json({
            Error: "Error while validating user: " + error.message,
        })
    }
}

const validateResetPassword = (data) => {
    try {
        const validateSchema = joi.object({
            password: hapiJoiValidator.string().required().min(8)
                            .pattern(new RegExp(/^[A-Za-z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/)).messages({
                              'string.empty': 'Password cannot be empty',
                               'string.min': 'Minimum 8 characters required',
                              'any.pattern.base': 'Password should contain letters, and numbers',
                             'any.required': 'Password is required',
                         }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        return res.status(500).json({
            Error: "Error while validating user: " + error.message,
        })
    }
}

const validateMessage = (data) => {
    try {
        const validateSchema = joi.object({
            firstName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().required().messages({
                'string.empty': "First name field can't be left empty",
                'string.min': "Minimum of 3 characters for the first name field",
                'any.required': "Please first name is required",
                "string.pattern.base": "Please no space is allowed/No special characters allowed"
            }),
            lastName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().required().messages({
                'string.empty': "Last name field can't be left empty",
                'string.min': "Minimum of 3 characters for the last name field",
                'any.required': "Please last name is required"
            }),
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            title: joi.string().trim().messages({
                'string.empty': "Title field can't be left empty",
                'any.required': "Please title is required"
            }),
        
            content: joi.string().trim().messages({
                'string.empty': "Content field can't be left empty",
                'any.required': "Please content is required"
            }),
            
        })
        return validateSchema.validate(data);
    } catch (error) {
        return res.status(500).json({
            Error: "Error while validating user: " + error.message,
        })
    }
}


const validateDateTime = (data) => {
    const schema = joi.object({
        patientName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+(?: [a-zA-Z]+)?$/).required().messages({
            'string.empty': "First name field can't be left empty",
            'string.min': "Minimum of 3 characters for the first name field",
            'any.required': "Please first name is required",
            "string.pattern.base": "Please input a valid name"
        }),
    patientEmail: joi.string().max(40).trim().email( {tlds: {allow: false} } ).messages({
        'string.empty': "Email field can't be left empty",
        'any.required': "Please Email is required"
    }),
    
        date: joi.date().iso().required().messages({
            'any.required': 'Date is required',
            'date.base': 'Invalid date format',
        }),
        // specialist: hapiJoiValidator.string().trim().required().valid("optician", "Optician")
        // .pattern(/^[A-Za-z\s]+$/).messages({
        //   'string.empty': 'specialist cannot be empty',
        // //   'string.min': 'Minimum 4 characters required for gender',
        // //   'string.max': 'Maximum 6 characters allowed',
        //   'any.pattern.base': 'Gender should only contain letters and no spaces',
        //   'any.required': 'Specialist is required',
        // }),
    });

    return schema.validate(data);
};



const Joi = require('joi');

// Define schema for date input validation
const dateSchema = Joi.date().iso().min('now').required().messages({
  'any.required': 'Date is required',
  'date.base': 'Invalid date format',
  'date.min': 'Date must be in the future',
});

// Define schema for time input validation
const timeSchema = Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
  'any.required': 'Time is required',
  'string.pattern.base': 'Invalid time format (HH:MM)',
});

// Example usage
//const validateDateTime = (date, time) => {
    // function validateDateTime(dateString) {
    //     // Regular expression for YYYY-MM-DD format
    //     const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    
    //     // Test if the input string matches the expected format
    //     return dateFormat.test(dateString);
    // }
    
    // // Example usage
    // const dateInput = "2023-12-31";
    // if (validateDateTime(dateInput)) {
    //     console.log("Date is in valid format");
    // } else {
    //     console.log("Date is not in valid format");
    // }
    
//   const dateResult = dateSchema.validate(date);
//   const timeResult = timeSchema.validate(time);

//   if (dateResult.error) {
//     return dateResult.error.message;
//   }
//   if (timeResult.error) {
//     return timeResult.error.message;
//   }

//   return 'Date and time are valid';
// };

const validateAdmin = (data) => {
    const schema = Joi.object({
        hospitalName: Joi.string().trim().min(3).max(30).required().messages({
            'string.empty': 'Hospital name cannot be empty',
            'string.min': 'Hospital name must be at least 3 characters long',
            'string.max': 'Hospital name cannot exceed 30 characters',
            'any.required': 'Hospital name is required',
        }),
        hospitalAddress: Joi.string().trim().required().messages({
            'string.empty': 'Hospital address cannot be empty',
            'any.required': 'Hospital address is required',
        }),
        email: Joi.string().trim().email().required().messages({
            'string.empty': 'Email cannot be empty',
            'string.email': 'Invalid email format',
            'any.required': 'Email is required',
        }),
        phoneNumber: Joi.string().trim().required().messages({
            'string.empty': 'Phone number cannot be empty',
            'any.required': 'Phone number is required',
        }),
        password: Joi.string().trim().min(8).required().messages({
            'string.empty': 'Password cannot be empty',
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is required',
        }),
        confirmPassword: Joi.string().trim().valid(Joi.ref('password')).required().messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Confirm password is required',
        }),
    });

    return schema.validate(data);
};



module.exports = {
  validateUser,
  validateUserLogin,
  validateResetPassword,
  validateUserForgotPassword,
  validateDateTime,
  validateMessage,
    validateAdmin
}

