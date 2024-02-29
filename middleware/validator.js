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
            
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
                    password: hapiJoiValidator.string().required().min(8)
                            .pattern(new RegExp(/^(?=.*[A-Za-z0-9])[A-Za-z0-9 !@#$%^&*()_+{}[\]:;<>,.?~\\/-]+$/)).messages({
                              'string.empty': 'Password cannot be empty',
                               'string.min': 'Minimum 8 characters required',
                              'any.pattern.base': 'Password should contain letters, numbers, and special characters',
                             'any.required': 'Password is required',
                             "string.pattern.base": "Empty space not allowed"
                         }),
                            // confirmPassword: hapiJoiValidator.string().required().min(8)
                            confirmPassword: Joi.any().valid(Joi.ref('password')).required().label('Confirm password').options({
                                language: {
                                  any: {
                                    allowOnly: '!!Passwords do not match',
                                  },
                                },
                              })
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


const validateAppointmentRequest = (data) => {
    const schema = joi.object({
        fullName: joi.string().regex(/^[a-zA-Z]+(?: [a-zA-Z]+)?$/).required().messages({
            'string.empty': "Full name field can't be left empty",
            'any.required': "Please full name is required",
            "string.pattern.base": "Please input a valid first name and last name"
        }),
        patientEmail: joi.string().max(40).trim().email({ tlds: { allow: false } }).messages({
            'string.empty': "Email field can't be left empty",
            'any.required': "Please Email is required"
        }),
        lastVisitation: joi.date().allow(null).optional().max('now').messages({
            'date.max': 'Last visitation date cannot be in the future'
        }),
        presentSymptoms: joi.string().trim().messages({
            'string.empty': "Prsent symptoms field can't be left empty",
            'any.required': "Please symptoms is required"
        }),
        lastDiagnosis: joi.string().trim().optional().messages({
            'string.empty': "Last diagnosis field can't be left empty",
            'any.required': "Please diagnosis is required"
        }),
        // presentSymptoms: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s]+(?: [a-zA-Z0-9\s]+)?$/).pattern(/^\S+$/).required().messages({
        //     'string.empty': "Symptoms field can't be left empty",
        //     'string.min': "Minimum of 3 characters for the hospital name field",
        //     'any.required': "Please input your current symptoms",
        //     "string.pattern.base": "Present symptoms must not be empty or contain only whitespace characters",
        //     //'string.empty': 'Present symptoms must not be empty or contain only whitespace characters'

        // }),
        // lastDiagnosis: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s]+(?: [a-zA-Z0-9\s]+)?$/).optional().messages({
        //     'string.empty': "Hospital name field can't be left empty",
        //     'string.min': "Minimum of 3 characters for the hospital name field",
        //     'any.required': "Please hospital name is required",
        //     "string.pattern.base": "Please input a valid address"
        // }),

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


// const Joi = require('joi');

// // Define schema for date input validation
// const dateSchema = Joi.date().iso().min('now').required().messages({
//   'any.required': 'Date is required',
//   'date.base': 'Invalid date format',
//   'date.min': 'Date must be in the future',
// });

// // Define schema for time input validation
// const timeSchema = Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
//   'any.required': 'Time is required',
//   'string.pattern.base': 'Invalid time format (HH:MM)',
// });


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
  validateAppointmentRequest,
  validateMessage,
    validateAdmin
}

