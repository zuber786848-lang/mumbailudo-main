const { errorResponse, successResponse } = require("../../helper/status.response");
const ludoKyc = require("../../models/ludo.kyc");
const ludoUser = require("../../models/ludo.user");
exports.kycUpdate = async (req, res) => {
    try {
        const { kycId, status } = req.query
        const kycExist = await ludoKyc.findById(kycId)

        if (!kycExist) {
            return errorResponse(res, 400, false, "Error", "kyc is not found")
        }
        // if (kycExist.status == "approved") {
        //     return errorResponse(res, 400, false, "Error", "kyc is already approved")
        // }
        const userUpdate = await ludoUser.findByIdAndUpdate(kycExist.user_id, { $set: { kyc_status: status } })
        const kycUpdate = await ludoKyc.findOneAndUpdate(
            { _id: kycExist._id, status: "pending" },
            { $set: { status: status } },
            { new: true }
        );
        return successResponse(res, 200, true, "success", kycUpdate)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

exports.viewUserKyc = async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 10 } = req.query;

        const userKyc = await ludoKyc.find({ status: status }).populate(["user_id"])
            .skip((page - 1) * limit)
            .limit(limit);

        const totalDocs = await ludoKyc.countDocuments({ status: status });

        return successResponse(res, 200, true, "success", { userKyc, totalDocs });

    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}