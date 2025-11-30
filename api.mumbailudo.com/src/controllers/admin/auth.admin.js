const admin = require("../../models/ludo.admin")
const moment = require('moment-timezone');
const { admin_token } = require("../../helper/token.user")
const userOTP = require("../../models/user.otp")
const { successResponse, errorResponse } = require("../../helper/status.response")
const { sendOTPLessSMS, verifyOTPLess } = require("../../helper/OTPLessSMS")
exports.Register = async (req, res) => {
    try {
        const data = req.body
        const { email, phone_no, password, referral_code } = data
        const adminExist = await admin.findOne({ phone_no: phone_no })
        if (adminExist && adminExist.phone_no == phone_no) {
            return errorResponse(res, 400, false, "admin phone number is already exist in our system")
        }
        else {
            const newadminCreated = await admin.create(data)
            if (!newadminCreated) {
                return errorResponse(res, 400, false, "Something went wrong!!!")
            }
            else {

                const tokenGenerated = await admin_token(newadminCreated)
                newadminCreated.activeToken = tokenGenerated; // Update active token in admin document
                await newadminCreated.save(); // Save admin document with updated active token
                res.setHeader("x-api-key", tokenGenerated);
                // const result = { ...newadminCreated.toObject(), token: token }
                return successResponse(res, 201, true, "Account has been created successfully, please login!!", tokenGenerated)
            }
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, error.message)
    }
}

exports.Login = async (req, res) => {
    try {
        const data = req.body
        const { phone_no, password } = data
        const adminExist = await admin.findOne({ phone_no: phone_no })
        if (!adminExist) {
            return errorResponse(res, 400, false, "admin not exist in our system")
        }
        if (adminExist.delete == true) {
            return errorResponse(res, 400, false, "admin is deleted from our system")
        }
        if (adminExist.password != password) {
            return errorResponse(res, 400, false, "admin phone number or password invalid")
        }
        if (adminExist.block == true) {
            return errorResponse(res, 400, false, "admin is blocked by the admin please contact the admin")
        }
        if (adminExist.is_admin_verified == false) {
            return errorResponse(res, 400, false, "admin is not verified")
        }
        else {
            const tokenGenerated = await admin_token(adminExist)
            adminExist.activeToken = tokenGenerated; // Update active token in admin document
            await adminExist.save(); // Save admin document with updated active token
            res.setHeader("x-api-key", tokenGenerated);
            // const result = { ...adminExist.toObject(), token: token }
            return successResponse(res, 200, true, "Login successfully!", tokenGenerated)
        }

    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }

}

exports.createAdmin = async (req, res) => {
    try {
        const data = req.body
        const { name, email, phone_no, password, role, status } = data
        const adminExist = await admin.findOne({ phone_no: phone_no })
        if (adminExist && adminExist.phone_no == phone_no) {
            return errorResponse(res, 400, false, "admin phone number is already exist in our system")
        }
        else {
            const newadminCreated = await admin.create(data)
            if (!newadminCreated) {
                return errorResponse(res, 400, false, "Something went wrong!!!")
            }
            else {
                return successResponse(res, 201, true, "Admin account has been created successfully")
            }
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, error.message)
    }
}

exports.deleteAdminAccount = async (req, res) => {
    try {

        const adminExist = await admin.findOne({ _id: req.params.id })
        if (!adminExist) {
            return errorResponse(res, 400, false, "admin not exist exist in our system")
        }
        else {
            const isAdminDeleted = await admin.findOneAndDelete({ _id: req.params.id })
            if (!isAdminDeleted) {
                return errorResponse(res, 400, false, "Something went wrong!!!")
            }
            else {
                return successResponse(res, 200, true, "Admin account has been deleted successfully")
            }
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, error.message)
    }
}

exports.adminSendOTPLess = async (req, res) => {
    // const { phone_no } = req.body;
    // const OTPExist = await userOTP.find({ phone_no: phone_no, is_verified: false })
    // if (OTPExist) {
    //     const currentTimeIST = moment().tz('Asia/Kolkata').valueOf();
    //     // console.log(currentTimeIST < OTPExist.OTP_expire_time)
    //     if (currentTimeIST < OTPExist.OTP_expire_time) {
    //         return errorResponse(res, 400, false, "Please check your message inbox for the OTP.");
    //     } else {
    //         const result = await sendOTPLessSMS(phone_no);
    //         if (!result) {
    //             return errorResponse(res, 400, false, "Invalid your phone number")
    //         }
    //         const data = { phone_no: phone_no, requestId: result.requestId }
    //         const OTPsave = await userOTP.create(data)
    //         return successResponse(res, 201, true, "OTP sent", OTPsave)
    //     }
    // } else {
    //     const result = await sendOTPLessSMS(phone_no);
    //     console.log(result)
    //     if (result) {
    //         const data = { phone_no: phone_no, requestId: result.requestId }
    //         const OTPsave = await userOTP.create(data)
    //         return successResponse(res, 201, true, "OTP sent", OTPsave)
    //     } else {
    //         return errorResponse(res, 400, false, "Invalid phone number")
    //     }


    // }

    try {
        const { phone_no } = req.body
        const adminExist = await admin.findOne({ phone_no: phone_no, is_admin_verified: true })
        if (!adminExist) {
            return errorResponse(res, 403, false, "Unauthorized access 😜✌")
        }
        else {
            const result = await sendOTPLessSMS(phone_no);
            console.log(result)

            if (result) {
                const data = { phone_no: phone_no, requestId: result.requestId }
                const OTPsave = await userOTP.create(data)
                return successResponse(res, 201, true, "OTP sent", OTPsave)
            } else {
                return errorResponse(res, 400, false, "Invalid phone number")
            }
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message);
    }

}

exports.adminVerifyOTPLess = async (req, res) => {
    try {
        const { otp, requestId } = req.body;
        const OTPExpired = await userOTP.findOne({ requestId: requestId, is_verified: false })
        if (!OTPExpired) {
            return errorResponse(res, 400, false, "OTP expired")
        }

        const userExist = await admin.findOne({ phone_no: OTPExpired.phone_no });
        // console.log(userExist)
        const currentTimeIST = moment().tz('Asia/Kolkata').valueOf();
        // console.log(userExist)
        if (userExist) {
            // Get the current time in IST
            const OTPExist = await userOTP.findOne({ phone_no: OTPExpired.phone_no, requestId: requestId, is_verified: false })
            if (!OTPExist) {
                return errorResponse(res, 400, false, "OTP expired or invalid OTP");
            }

            const OTPLessVerify = await verifyOTPLess(requestId, otp)
            if (OTPLessVerify.isOTPVerified !== true) {
                return errorResponse(res, 400, false, "OTP expired or invalid OTP");
            }
            // console.log(OTPExist.OTP_expire_time <= currentTimeIST)
            // Check if OTP has expired
            if (OTPExist.OTP_expire_time <= currentTimeIST) {
                return errorResponse(res, 400, false, "OTP expired or invalid OTP");
            }
            const verifyOTP = await userOTP.findOneAndUpdate(
                { phone_no: OTPExpired.phone_no, requestId: requestId, is_verified: false },
                { $set: { is_verified: true } },
                { new: true }
            );
            if (!verifyOTP) {
                return errorResponse(res, 400, false, "OTP expired or invalid OTP");
            } else {
                // Generate a new token for the existing user
                const tokenGenerated = await admin_token(userExist);
                userExist.activeToken = tokenGenerated; // Update active token in user document

                await userExist.save(); // Save user document with updated active token

                res.setHeader("x-api-key", tokenGenerated);
                return successResponse(res, 200, true, "OTP verified successfully", tokenGenerated);
            }
        } else {
            return errorResponse(res, 400, false, "OTP expired or invalid OTP");
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message); // Send error response to client
    }
}


exports.getAllAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Default case: return all users, sorted by the last document first
        const allAdmin = await admin
            .find()
            .sort({ _id: -1 }) // Sort by the last document first
            .skip((page - 1) * limit)
            .limit(limit);
        const totalDocs = await admin.countDocuments();

        return successResponse(res, 200, true, "success", { allAdmin, totalDocs });

    } catch (error) {
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
};





