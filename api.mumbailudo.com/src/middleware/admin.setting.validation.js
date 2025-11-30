const Joi = require("joi");
const { errorResponse } = require("../helper/status.response")

exports.settingValidation = (req, res, next) => {
    const schema = Joi.object({
        // website_title: Joi.string().optional().allow(''), // Allow empty string if optional
        // website_logo: Joi.string().optional().allow(''), // Added validation for website_logo
        // admin_commission_one: Joi.number().optional().min(0), // Ensure commission is a number and non-negative
        // admin_commission_two: Joi.number().optional().min(0),
        // admin_commission_three: Joi.number().optional().min(0),
        // admin_commission_four: Joi.number().optional().min(0),
        // support_number: Joi.string().optional(),
        // whatsApp_number: Joi.string().optional(),
        // support_email: Joi.string().optional(),
        // mantainece_mode: Joi.boolean().optional(),
        // custom_message: Joi.array().items(Joi.object().unknown()).optional(),
        // referral_commission: Joi.number().optional().min(0), // Ensure commission is a number and non-negative
        // set_referral_amount: Joi.number().optional().min(0), // Ensure referral amount is a number and non-negative
        // set_bonus_amount: Joi.number().optional().min(0), // Ensure bonus amount is a number and non-negative
        // social_media_links: Joi.object().optional(), // Validate as an object if provided
        // _id:Joi.string().optional()
        website_title: Joi.string().trim().allow(''),
        message: Joi.string().trim().allow(''),
        website_logo: Joi.string().trim().allow(''),
        company_name: Joi.string().optional(),
        support_number: Joi.string().trim().optional(),
        whatsApp_number: Joi.string().trim().optional(),
        support_email: Joi.string().trim().optional(),
        mantainece_mode: Joi.boolean().optional(),
        custom_message: Joi.array().items(Joi.object().unknown()).optional(),
        admin_commission_one: Joi.number().optional().min(0),
        admin_commission_two: Joi.number().optional().min(0),
        admin_commission_three: Joi.number().optional().min(0),
        admin_commission_four: Joi.number().optional().min(0),
        referral_commission: Joi.number().optional().min(0),
        set_referral_amount: Joi.number().optional().min(0),
        set_bonus_amount: Joi.number().optional().min(0),
        social_media_links: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
        payment_accept_upi_id: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
        commpany_address: Joi.string().optional(),
        commpany_mobile: Joi.string().optional(),
        commpany_email: Joi.string().optional(),
        commpany_website: Joi.string().optional(),
        version: Joi.string().optional(),
        telegram_link: Joi.string().optional(),
        upi_payment_gateway_key: Joi.string().optional(),
        wrong_update_penalty: Joi.number().optional(),
        no_update_penalty: Joi.number().optional(),
        withdraw_time: Joi.string().optional(),
        commission1: Joi.number().optional(),
        commission2: Joi.number().optional(),
        commission3: Joi.number().optional(),
        commission4: Joi.number().optional(),
        minimum_game_amount: Joi.number().optional(),
        maximum_game_amount: Joi.number().optional(),
        minimum_withdrawal_amount: Joi.number().optional(),
        maximum_withdrawal_amount: Joi.number().optional(),
        minimum_deposit_amount: Joi.number().optional(),
        maximum_deposit_amount: Joi.number().optional(),
        upi_id1: Joi.string().optional(),
        upi_id2: Joi.string().optional(),
        upi_id3: Joi.string().optional(),
        upi_id4: Joi.string().optional(),
        upi_id5: Joi.string().optional(),
        // qr_code_image_1: Joi.string().optional(),
        // qr_code_image_2: Joi.string().optional(),
        // bank_details: Joi.array().items(
        //     Joi.object({
        //         +
        //     })
        // ).optional(),
        createdAt: Joi.string().optional(),
        updatedAt: Joi.string().optional(),
        __v: Joi.number().optional(),
        _id: Joi.string().optional(),
    });
    const { error } = schema.validate(req.body);

    if (error) {
        const errorMessage = error.details[0].message.replace(/['"]+/g, "");
        return errorResponse(res, 400, false, 'Validation error', errorMessage);
    }

    next();
}