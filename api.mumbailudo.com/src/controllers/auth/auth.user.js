require('dotenv').config();
const jwt = require('jsonwebtoken')
const moment = require('moment-timezone');
const useragent = require('useragent');
const os = require('os');

const DeviceDetector = require('node-device-detector');
const { userAgentParser } = require('../../helper/user.device.information');
const { successResponse, errorResponse } = require("../../helper/status.response")
const { token } = require("../../helper/token.user")
const ludoGame = require("../../models/ludo.game")
const ludoUser = require("../../models/ludo.user")
const ludoBonus = require("../../models/ludo.admin.setting")
const userOTP = require("../../models/user.otp")
const { generateUniqueReferralCode } = require("../../helper/referral.code");
const { sendOTPFast2SMS } = require("../../helper/fast2SMS.OTP")
const { sendOTPLessSMS, verifyOTPLess } = require("../../helper/OTPLessSMS")
exports.userRegister = async (req, res) => {
    try {
        const data = req.body
        const { email, phone_no, password, referral_code } = data
        // Extract IP address and device info
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const deviceInfo = userAgentParser(userAgent);
        console.log("userIp ", ipAddress)
        console.log("user device ", deviceInfo)
        const userExist = await ludoUser.findOne({ phone_no: phone_no })
        if (userExist && userExist.phone_no == phone_no) {
            return errorResponse(res, 400, false, "user phone number is already exist in our system")
        }
        else {
            const ludoBonusDetail = await ludoBonus.findOne()
            let referred_by = null
            if (referral_code) {
                referred_by = referral_code
            }
            if (ludoBonus) {
                data.total_bonus_amount = ludoBonusDetail.set_bonus_amount
                data.wallet_balance = ludoBonusDetail.set_bonus_amount
            }
            data.referred_by = referred_by;
            data.referral_code = await generateUniqueReferralCode()

            // Include device info and IP address in user data
            data.device_info = deviceInfo;
            data.ip_address = ipAddress;
            const newUserCreated = await ludoUser.create(data)
            if (!newUserCreated) {
                return errorResponse(res, 400, false, "Something went wrong!!!")
            }
            else {

                const tokenGenerated = await token(newUserCreated)
                newUserCreated.activeToken = tokenGenerated; // Update active token in admin document
                await newUserCreated.save(); // Save admin document with updated active token
                res.setHeader("x-api-key", tokenGenerated);
                // const result = { ...newUserCreated.toObject(), token: token }
                return successResponse(res, 201, true, "Account has been created successfully, please login!!", tokenGenerated)
            }
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message);
    }

}

exports.userLogin = async (req, res) => {
    try {
        const data = req.body
        const { phone_no, password } = data
        const userExist = await ludoUser.findOne({ phone_no: phone_no, is_user_verified: true })

        if (!userExist) {
            return errorResponse(res, 400, false, "User not exist in our system");
        }
        if (userExist.password != password) {
            return errorResponse(res, 400, false, "User password invalid");
        }
        if (userExist.delete == true) {
            return errorResponse(res, 400, false, "User is deleted from our system");
        }
        if (userExist.block == true) {
            return errorResponse(res, 400, false, "User is blocked by the admin please contact the admin");
        }
        if (userExist.is_user_verified == false) {
            return errorResponse(res, 400, false, "User is not verified");
        }
        else {
            const tokenGenerated = await token(userExist)
            userExist.activeToken = tokenGenerated; // Update active token in admin document
            await userExist.save(); // Save admin document with updated active token

            res.setHeader("x-api-key", tokenGenerated);
            // const result = { ...userExist.toObject(), token: token }
            return successResponse(res, 200, true, "Login successfully!", tokenGenerated)
        }

    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message);
    }

}

exports.userLogOut = async (req, res) => {
    try {
        const userLogOut = await ludoUser.findOneAndUpdate({ activeToken: req.token }, { $set: { activeToken: '' } })
        return successResponse(res, 200, true, "success", "logout successfully")
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message);
    }
}


exports.sendOTP = async (req, res) => {
    const { phone_no } = req.body;
    const OTP = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    // console.log(OTP)
    const OTPExist = await userOTP.findOne({ phone_no: phone_no, is_verified: false })
    if (OTPExist) {
        const currentTimeIST = moment().tz('Asia/Kolkata').valueOf();
        // console.log(currentTimeIST < OTPExist.OTP_expire_time)
        if (currentTimeIST < OTPExist.OTP_expire_time) {
            return errorResponse(res, 400, false, "Please check your message inbox for the OTP.");
        } else {
            const result = await sendOTPFast2SMS(phone_no, OTP);
            if (!result) {
                return errorResponse(res, 400, false, "Invalid you phone number")
            }
            const data = { phone_no: phone_no, OTP: OTP }
            const OTPsave = await userOTP.create(data)
            return successResponse(res, 201, true, "OTP sent")
        }
    } else {
        const result = await sendOTPFast2SMS(phone_no, OTP);
        console.log(result)

        if (result.return) {
            const data = { phone_no: phone_no, OTP: OTP }
            const OTPsave = await userOTP.create(data)
            return successResponse(res, 201, true, result.message[0])
        } else {
            return errorResponse(res, 400, false, "Invalid phone number")
        }


    }
};


exports.verifyOTP = async (req, res) => {
    const { phone_no, otp, referral_code } = req.body;
    // Parse the user agent string
    // const agent = useragent.parse(uaString);
    const userIpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    // const userDeviceInfo = await userAgentParser(userAgent);
    // Parse the user agent string
    const userDeviceInfoOS = {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        type: os.type(),
        release: os.release(),
        cpus: os.cpus()
    };

    console.log(userDeviceInfoOS);
    const deviceName = os.hostname();
    const agent = useragent.parse(userAgent);
    const detector = new DeviceDetector({
        clientIndexes: true,
        deviceIndexes: true,
        deviceAliasCode: false,
        deviceTrusted: false,
        deviceInfo: false,
        maxUserAgentSize: 500,
    });
    const result = detector.detect(userAgent);
    const userDeviceInfo = {
        os: agent.os.toString(),
        device: agent.device.toString(),
        userAgent: agent.toString()
    };
    const userExist = await ludoUser.findOne({ phone_no: phone_no });
    const currentTimeIST = moment().tz('Asia/Kolkata').valueOf();
    // console.log(userExist)
    if (userExist) {
        // Get the current time in IST
        const OTPExist = await userOTP.findOne({ phone_no: phone_no, OTP: otp, is_verified: false })
        if (!OTPExist) {
            return errorResponse(res, 400, false, "OTP expired or invalid OTP");
        }
        // console.log(OTPExist.OTP_expire_time <= currentTimeIST)
        // Check if OTP has expired
        if (OTPExist.OTP_expire_time <= currentTimeIST) {
            return errorResponse(res, 400, false, "OTP expired or invalid OTP");
        }
        const verifyOTP = await userOTP.findOneAndUpdate(
            { phone_no: phone_no, OTP: otp, is_verified: false },
            { $set: { is_verified: true } },
            { new: true }
        );

        if (!verifyOTP) {
            return errorResponse(res, 400, false, "OTP expired or invalid OTP");
        } else {
            // Generate a new token for the existing user
            const tokenGenerated = await token(userExist);
            userExist.activeToken = tokenGenerated; // Update active token in user document
            userExist.ip_address = userIpAddress
            userExist.device_info = userDeviceInfo
            userExist.device_detector = result
            userExist.deviceName = deviceName
            await userExist.save(); // Save user document with updated active token

            res.setHeader("x-api-key", tokenGenerated);
            return successResponse(res, 200, true, "OTP verified successfully", tokenGenerated);
        }
    } else {

        const OTPExist = await userOTP.findOne({ phone_no: phone_no, OTP: otp, is_verified: false })
        // console.log(OTPExist)
        if (!OTPExist) {
            return errorResponse(res, 400, false, "OTP expired or invalid OTP");
        }
        if (OTPExist.OTP_expire_time <= currentTimeIST) {
            return errorResponse(res, 400, false, "OTP expired or invalid OTP");
        }

        // Handle the case where the user does not exist
        const ludoBonusDetail = await ludoBonus.findOne();
        let referred_by = null;

        if (referral_code) {
            referred_by = referral_code;
        }

        const newUserData = {
            phone_no,
            referred_by,
            referral_code: await generateUniqueReferralCode(),
            device_info: userDeviceInfo,
            ip_address: userIpAddress,
            device_detector: result,
            deviceName: deviceName,

            total_bonus_amount: ludoBonusDetail ? ludoBonusDetail.set_bonus_amount : 0,
            wallet_balance: ludoBonusDetail ? ludoBonusDetail.set_bonus_amount : 0,
            // Add other necessary fields as required
        };
        const newUserCreated = await ludoUser.create(newUserData);

        if (!newUserCreated) {
            return errorResponse(res, 400, false, "Something went wrong!");
        } else {
            // Generate a new token for the newly created user
            const tokenGenerated = await token(newUserCreated);
            newUserCreated.activeToken = tokenGenerated; // Update active token in user document
            await newUserCreated.save(); // Save user document with updated active token

            res.setHeader("x-api-key", tokenGenerated);

            const verifyOTP = await userOTP.findOneAndUpdate(
                { phone_no: phone_no, OTP: otp, is_verified: false },
                { $set: { is_verified: true } },
                { new: true }
            );

            return successResponse(res, 201, true, "Account has been created successfully, please login!", tokenGenerated);
        }
    }

};

exports.sendOTPLess = async (req, res) => {
    const { phone_no } = req.body;
    const OTPExist = await userOTP.findOne({ phone_no: phone_no, is_verified: false })
    if (OTPExist) {
        const currentTimeIST = moment().tz('Asia/Kolkata').valueOf();
        // console.log(currentTimeIST < OTPExist.OTP_expire_time)
        if (currentTimeIST < OTPExist.OTP_expire_time) {
            return errorResponse(res, 400, false, "Please check your message inbox for the OTP.");
        } else {
            const result = await sendOTPLessSMS(phone_no);
            if (!result) {
                return errorResponse(res, 400, false, "Invalid your phone number")
            }
            const data = { phone_no: phone_no, requestId: result.requestId }
            const OTPsave = await userOTP.create(data)
            return successResponse(res, 201, true, "OTP sent", OTPsave)
        }
    } else {
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
}

exports.verifyOTPLess = async (req, res) => {
    try {
        const { otp, requestId, referral_code } = req.body;
        const OTPExpired = await userOTP.findOne({ requestId: requestId, is_verified: false })
        if (!OTPExpired) {
            return errorResponse(res, 400, false, "OTP expired")
        }
        // Parse the user agent string
        const userIpAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        // Parse the user agent string
        const userDeviceInfoOS = {
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            type: os.type(),
            release: os.release(),
            cpus: os.cpus()
        };

        // console.log(userDeviceInfoOS);
        const deviceName = os.hostname();
        const agent = useragent.parse(userAgent);
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
            deviceTrusted: false,
            deviceInfo: false,
            maxUserAgentSize: 500,
        });
        const result = detector.detect(userAgent);
        const userDeviceInfo = {
            os: agent.os.toString(),
            device: agent.device.toString(),
            userAgent: agent.toString()
        };
        const userExist = await ludoUser.findOne({ phone_no: OTPExpired.phone_no });
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
                const tokenGenerated = await token(userExist);
                userExist.activeToken = tokenGenerated; // Update active token in user document
                userExist.ip_address = userIpAddress
                userExist.device_info = userDeviceInfo
                userExist.device_detector = result
                userExist.deviceName = deviceName
                await userExist.save(); // Save user document with updated active token

                res.setHeader("x-api-key", tokenGenerated);
                return successResponse(res, 200, true, "OTP verified successfully", tokenGenerated);
            }
        } else {

            const OTPExist = await userOTP.findOne({ phone_no: OTPExpired.phone_no, requestId: requestId, is_verified: false })
            // console.log(OTPExist)
            if (!OTPExist) {
                return errorResponse(res, 400, false, "OTP expired or invalid OTP");
            }

            const OTPLessVerify = await verifyOTPLess(requestId, otp)
            if (OTPLessVerify.isOTPVerified !== true) {
                return errorResponse(res, 400, false, "OTP expired or invalid OTP");
            }
            if (OTPExist.OTP_expire_time <= currentTimeIST) {
                return errorResponse(res, 400, false, "OTP expired or invalid OTP");
            }

            // Handle the case where the user does not exist
            const ludoBonusDetail = await ludoBonus.findOne();
            let referred_by = null;

            if (referral_code) {
                referred_by = referral_code;
            }

            const newUserData = {
                phone_no: OTPExpired.phone_no,
                referred_by,
                referral_code: await generateUniqueReferralCode(),
                device_info: userDeviceInfo,
                ip_address: userIpAddress,
                device_detector: result,
                deviceName: deviceName,

                total_bonus_amount: ludoBonusDetail ? ludoBonusDetail.set_bonus_amount : 0,
                wallet_balance: ludoBonusDetail ? ludoBonusDetail.set_bonus_amount : 0,
                // Add other necessary fields as required
            };
            const newUserCreated = await ludoUser.create(newUserData);

            if (!newUserCreated) {
                return errorResponse(res, 400, false, "Something went wrong!");
            } else {
                // Generate a new token for the newly created user
                const tokenGenerated = await token(newUserCreated);
                newUserCreated.activeToken = tokenGenerated; // Update active token in user document
                await newUserCreated.save(); // Save user document with updated active token

                res.setHeader("x-api-key", tokenGenerated);

                const verifyOTP = await userOTP.findOneAndUpdate(
                    { phone_no: OTPExpired.phone_no, requestId: requestId, is_verified: false },
                    { $set: { is_verified: true } },
                    { new: true }
                );
                return successResponse(res, 201, true, "Account has been created successfully, please login!", tokenGenerated);
            }
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message); // Send error response to client
    }
}


