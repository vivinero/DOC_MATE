const Joi = require('@hapi/joi');

// Validator for creating a new appointment
const validateCreateAppointment = (data) => {
    const schema = Joi.object({
        fee: Joi.string().required(),
        date: Joi.date().required(),
        time: Joi.string().required(),
        doctorName: Joi.string().trim().required().messages({
            'string.empty': 'Doctor name cannot be empty',
            'any.required': 'Doctor name is required',
        }),
        fee: Joi.number().min(3000).required().messages({
            'number.base': 'Fee must be a number',
            'number.min': 'Fee must be at least 3000',
            'any.required': 'Fee is required',
        })
    });
    return schema.validate(data);
};
// Validator for confirming appointment

const validateConfirmAppointment = (data) => {
    const schema = Joi.object({
        // appointmentId: Joi.string().required()
    });
    return schema.validate(data);
};

// // Validator for rescheduling an appointment
const validateRescheduleAppointment = (data) => {
    const schema = Joi.object({
        selectedOptionIndex: Joi.number().integer().min(0).required()
    });
    return schema.validate(data);
};

//validation reschedule options
const validateRescheduleOptions = (data) => {
    const schema = Joi.object({
        option: Joi.number().valid(1, 2, 3).required() // Validating the option selected (1, 2, or 3)
    });
    return schema.validate(data);
};


module.exports = { validateCreateAppointment, validateConfirmAppointment, validateRescheduleAppointment, validateRescheduleOptions };
