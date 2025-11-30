const Joi = require("joi");
const { errorResponse } = require("../helper/status.response")
exports.gameUpdateValidation = (req, res, next) => {
    const schema = Joi.object({
        status: Joi.string().optional(),
        completionReason: Joi.string().optional(),
        winnerId: Joi.string().optional(),
        gameId: Joi.string().required()
    })
    const { error } = schema.validate(req.query);

    if (error) {
        const errorMessage = error.details[0].message.replace(/['"]+/g, "");
        return errorResponse(res, 400, false, 'Validation error', errorMessage);
    }

    next();
}