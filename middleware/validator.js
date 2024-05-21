const hapiJoiValidator = require("@hapi/joi");

const joi = require('@hapi/joi');

const validateUser = (data) => {
    try {
        const validateSchema = joi.object({
            firstName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().required().messages({
                'string.empty': "First name field can't be left empty",
                'string.min': "Minimum of 3 characters for the first name field",
                'any.required': "Please first name is required",
                "string.pattern.base": "No special characters, numbers or space allowed on first name"
            }),
            lastName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().required().messages({
                'string.empty': "Last name field can't be left empty",
                'string.min': "Minimum of 3 characters for the last name field",
                'any.required': "Please last name is required",
                "string.pattern.base": "No special characters, numbers or space allowed on last name"

            }),
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),

            password: joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/)
            .required()
            .messages({
              'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and must be at least 8 characters long',
              'string.empty': 'Password cannot be empty',
                               'string.min': 'Minimum 8 characters required',
                             'any.required': 'Password is required',
                            //  "string.pattern.base": "Empty space not allowed"
            }),
                    // password: hapiJoiValidator.string().required().min(8).pattern(new RegExp(/^(?=.[A-Za-z0-9])[A-Za-z0-9 !@#$%^&()_+{}[\]:;<>,.?~\\/-]+$/)).messages({  
                    //           'string.empty': 'Password cannot be empty',
                    //            'string.min': 'Minimum 8 characters required',
                    //           'any.pattern.base': 'Password should contain letters, numbers, and special characters',
                    //          'any.required': 'Password is required',
                    //          "string.pattern.base": "Empty space not allowed"
                    //      }),
                            confirmPassword: hapiJoiValidator.string().min(8)
                        //    .pattern(new RegExp(/^(?=.[A-Za-z0-9])[A-Za-z0-9 !@#$%^&()_+{}[\]:;<>,.?~\\/-]+$/)).messages({
                        //      'string.empty': 'Password cannot be empty',
                        //       'string.min': 'Minimum 8 characters required',
                        //     'any.pattern.base': 'Password should contain letters, numbers, and special characters',
                        //     // 'any.required': 'Passwords do not match',
                        //     "string.pattern.base": "Empty space not allowed"
                        //     }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        return res.status(500).json({
            error: "Error while validating user: " + error.message,
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
            error: "Error while validating user: " + error.message,
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
            error: "Error while validating user: " + error.message,
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
            error: "Error while validating user: " + error.message,
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
            error: "Error while validating user: " + error.message,
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

const validateUserProfile = (data) => {
    const schema = joi.object({
        bloodType: joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required().messages({
            'any.only': 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
            "string.empty": "Blood type field must be filled"
        }),
        gender: joi.string().valid("male", "female", "Male", "F", "M", "Female", "FEMALE", "MALE").trim().required().messages({
            'string.empty': 'Gender cannot be empty',
            'any.pattern.base': 'Gender should only contain letters and no spaces',
            'any.required': 'Gender is required',
            'any.only': 'Gender must be one of: male, female, Male, F, M, Female, FEMALE, MALE'
        }),
        phoneNumber: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).required().messages({
            'string.empty': "Phone number field can't be left empty",
            'string.min': "Phone number must be at least 11 digits long e.g: 08123456789",
            'any.required': "Please phone number is required",
            "string.pattern.base": "Invalid phone number"
        }),
        patientAddress: joi.string().trim().required().messages({
            'string.empty': 'Home address cannot be empty',
            'any.required': 'Home address is required',
        }),
        allergies: joi.string().trim().allow('').optional().messages({
            'string.empty': "Allergies field can't be left empty",
        }),
        age: joi.number().integer().min(1).max(150).required().messages({
            'number.base': 'Age must be a number',
            'number.integer': 'Age must be an integer',
            'number.min': 'Age must be at least 1',
            'number.max': 'Age must be at most 150',
            'any.required': 'Age is required'
        })
    });
    return schema.validate(data);
}

const validateUserProfileUpdate = (data) => {
    const schema = joi.object({
        bloodType: joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').messages({
            'any.only': 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
            "string.empty": "Blood type field must be filled"
        }),
        gender: joi.string().valid("male", "female", "Male", "F", "M", "Female", "FEMALE", "MALE").trim().messages({
            'string.empty': 'Gender cannot be empty',
            'any.pattern.base': 'Gender should only contain letters and no spaces',
            'any.only': 'Gender must be one of: male, female, Male, F, M, Female, FEMALE, MALE'
        }),
        phoneNumber: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).messages({
            'string.empty': "Phone number field can't be left empty",
            'string.min': "Phone number must be at least 11 digits long e.g: 08123456789",
            "string.pattern.base": "Invalid phone number"
        }),
        patientAddress: joi.string().trim().messages({
            'string.empty': 'Home address cannot be empty',
        }),
        allergies: joi.string().trim().allow('').optional().messages({
            'string.empty': "Allergies field can't be left empty",
        }),
        age: joi.number().integer().min(1).max(150).messages({
            'number.base': 'Age must be a number',
            'number.integer': 'Age must be an integer',
            'number.min': 'Age must be at least 1',
            'number.max': 'Age must be at most 150',
        })
    });
    return schema.validate(data);
}







const validateAdmin = (data) => {
    const schema = joi.object({
        hospitalName: joi.string().trim().min(3).required().messages({
            'string.empty': 'Hospital name cannot be empty',
            'string.min': 'Hospital name must be at least 3 characters long',
            'string.max': 'Hospital name cannot exceed 30 characters',
            'any.required': 'Hospital name is required',
        }),
        hospitalAddress: joi.string().trim().required().messages({
            'string.empty': 'Hospital address cannot be empty',
            'any.required': 'Hospital address is required',
        }),
        email: joi.string().trim().email().required().messages({
            'string.empty': 'Email cannot be empty',
            'string.email': 'Invalid email format',
            'any.required': 'Email is required',
        }),
        phoneNumber: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).required().messages({
            'string.empty': "Phone number field can't be left empty",
            'string.min': "Phone number must be at least 11 digits long e.g: 08123456789",
            'any.required': "Please phone number is required",
            "string.pattern.base": "Invalid phone number"
        }),
        password: joi.string().trim().min(8).required().messages({
            'string.empty': 'Password cannot be empty',
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is required',
        }),
        confirmPassword: joi.string().trim().valid(joi.ref('password')).required().messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Confirm password is required',
        }),
    });

    return schema.validate(data);
};

const validateProductInput = (data) => {
    try {
        const validateSchema = joi.object({
            productName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Product Name field can't be left empty",
                'string.min': "Minimum of 3 characters for the Product Name field",
                'any.required': "Please Product Name is required"
            }),
            category: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "category field can't be left empty",
                'string.min': "Minimum of 3 characters for the category field",
                'any.required': "Please category is required"
            }),
            brand: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Brand field can't be left empty",
                'string.min': "Minimum of 3 characters for the brand field",
                'any.required': "Please brand is required"
            }),
            productDescription: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Product description field can't be left empty",
                'string.min': "Minimum of 3 characters for the Product description field",
                'any.required': "Please Product description is required"
            }),
            costPrice: joi.number().min(1).required().messages({
                'number.empty': "Cost Price field can't be left empty",
                'number.min': "Minimum of 3 characters for the Cost Price field",
                'any.required': "Please Cost Price is required"
            }),
            sellingPrice: joi.number().min(1).required().messages({
                'number.empty': "Selling Price field can't be left empty",
                'number.min': "Minimum of 3 characters for the Selling Price field",
                'any.required': "Please Selling Price is required"
            }),
            stockQty: joi.number().min(1).required().messages({
                'number.empty': "Stock quantity field can't be left empty",
                'number.min': "Minimum of 3 characters for the Stock quantity field",
                'any.required': "Please Stock quantity is required"
            }),
            VAT: joi.number().min(0).messages({
                'number.empty': "VAT field can't be left empty",
                'number.min': "Minimum of 3 characters for the VAT field",
                'any.required': "Please VAT is required"
            }),
            reorderLevel: joi.number().min(1).optional().messages({
                'number.empty': "Reorder level field can't be left empty",
                'number.min': "Minimum of 3 characters for the Reorder level field",
                'any.required': "Please Reorder level is required"
            }),

        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateProductUpdate = (data) => {
    try {
        const validateSchema = joi.object({
            productName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the Product Name field",
            }),
            category: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the category field",
            }),
            brand: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the brand field",
            }),
            productDescription: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the Product description field",
                'any.required': "Please Product description is required"
            }),
            costPrice: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Cost Price field",
            }),
            sellingPrice: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Selling Price field",
            }),
            stockQty: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Stock quantity field",
            }),
            VAT: joi.number().min(0).messages({
                'number.min': "Minimum of 3 characters for the VAT field",
                'any.required': "Please VAT is required"
            }),
            reorderLevel: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Reorder level field",
            }),

        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}






module.exports = {
  validateUser,
  validateUserLogin,
  validateResetPassword,
  validateUserForgotPassword,
  validateAppointmentRequest,
  validateMessage,
  validateUserProfile,
  validateUserProfileUpdate,
    validateAdmin,
    validateProductInput,
    validateProductUpdate,
}

