const Joi = require('@hapi/joi');

// Validator for creating a new appointment
const validateCreateAppointment = (data) => {
    const schema = Joi.object({
        doctorName: Joi.string().required(),
        fee: Joi.string().required(),
        date: Joi.date().required(),
        time: Joi.string().required(),
    });
    return schema.validate(data);
};
// Validator for confirming appointment

const validateConfirmAppointment = (data) => {
    const schema = Joi.object({
        appointmentId: Joi.string().required()
    });
    return schema.validate(data);
};

// Validator for rescheduling an appointment
const validateRescheduleAppointment = (data) => {
    const schema = Joi.object({
        selectedOptionIndex: Joi.number().integer().min(0).required()
    });
    return schema.validate(data);
};

module.exports = { validateCreateAppointment, validateConfirmAppointment, validateRescheduleAppointment };
