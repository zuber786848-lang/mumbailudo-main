require('dotenv').config();
const { successResponse, errorResponse } = require("../../helper/status.response")
const ludoKyc = require('../../models/ludo.kyc');
const ludoUser = require('../../models/ludo.user');

exports.userKyc = async (req, res) => {
    try {
        const { aadhar_name, aadhar_number } = req.body

         // Access the uploaded files via req.files
        const aadharFront = req.files['aadhar_front'] ? req.files['aadhar_front'][0] : null;
        const aadharBack = req.files['aadhar_back'] ? req.files['aadhar_back'][0] : null;

        if (!aadharFront || !aadharBack) {
            return errorResponse(res, 400, false, "Both aadhar_front and aadhar_back files are required.");
        }

        let isKycApproved = await ludoKyc.findOne({user_id: req.user_id, status: "approved"})
        let isKycPending = await ludoKyc.findOne({user_id: req.user_id, status: "pending"})

        if(isKycApproved){
            return errorResponse(res, 404, false, "Kyc already submited or approved!!!", isKycApproved)
        }else if(isKycPending){
            return errorResponse(res, 404, false, "Your kyc are pending please wait for admin approved.!!", isKycPending)
        }
        const isKycCreated = await ludoKyc.create({
            user_id: req.user_id,
            aadhar_name,
            aadhar_number,
            aadhar_front: aadharFront.filename,
            aadhar_back: aadharBack.filename
        })

        const isUserKycUpdate = await ludoUser.findOneAndUpdate({_id: req.user_id}, {$set:{kyc_status: "submited"}}, {new: true})

        if (!isKycCreated && !isUserKycUpdate) {
            return errorResponse(res, 400, false, "Kyc not happend. Something went wrong!!!")
        }else {
            return successResponse(res, 201, true, "Kyc submited successfully. please wait for admin approve!!", isKycCreated)
        }
    } catch (e) {
        console.log(e)
        return errorResponse(res, 500, false, e.message)
    }

}
