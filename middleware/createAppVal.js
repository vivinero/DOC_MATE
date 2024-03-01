const Joi = require('@hapi/joi');

// Validator for creating a new appointment
const validateCreateAppointment = (data) => {
    const schema = Joi.object({
        fee: Joi.string().required(),
        // date: Joi.date().required(),
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
const validateRescheduleOptions = (data) => {
    const rescheduleOptionsSchema = Joi.object({
        firstAvailability: Joi.number().valid(1, 2, 3).required(),
});
return rescheduleOptionsSchema.validate(data)
}


module.exports = { validateCreateAppointment, validateConfirmAppointment,  validateRescheduleOptions };
