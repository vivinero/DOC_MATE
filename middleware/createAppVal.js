const Joi = require('@hapi/joi');

// Validator for creating a new appointment
const validateCreateAppointment = (data) => {
    const schema = Joi.object({
        fee: Joi.number().required().valid(3000),
        date: Joi.date().iso().required().messages({
            'any.required': 'Date is required',
            'date.base': 'Invalid date format',
        }),
        time: Joi.string().required(),
        doctorName: Joi.string().trim().required().messages({
            'string.empty': 'Doctor name cannot be empty',
            'any.required': 'Doctor name is required',
        }),
        //fee: Joi.string().min(3000).required().messages({
        //     'number.base': 'Fee must be a number',
        //     'number.min': 'Fee must be at least 3000',
        //     'any.required': 'Fee is required',
        //     "number.max" : "Fee must be at most 3000"
        // }),
        speciality: Joi.string().trim().required()
                .pattern(/^[A-Za-z\s]+$/).messages({
                  'string.empty': 'Speciality cannot be empty',
                  'any.pattern.base': 'Speciality should only contain letters and no spaces',
                  'any.required': 'Speciality is required',
                }),
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
// const validateRescheduleOptions = (data) => {
//     const rescheduleOptionsSchema = Joi.object({
//         firstAvailability: Joi.number().valid(1, 2, 3).required(),
//         secondAvailability: Joi.number().valid(1, 2, 3).required(),
//         thirdAvailability: Joi.number().valid(1, 2, 3).required(),
// });
// return rescheduleOptionsSchema.validate(data)
// }


module.exports = { validateCreateAppointment, validateConfirmAppointment };
