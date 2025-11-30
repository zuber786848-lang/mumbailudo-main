const { errorResponse, successResponse } = require("../../helper/status.response");
const ludoUser = require("../../models/ludo.user")
exports.referralUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const userExist = await ludoUser.findById(req.user_id)
        const referralUser = await ludoUser.find({ referred_by: userExist.referral_code }).skip((page - 1) * limit).limit(limit).select({ _id: 0, name: 1 })
        const referralCount = await ludoUser.countDocuments({ referred_by: userExist.referral_code })
        return successResponse(res, 200, true, "success", { referralUser, totalReferralUser: referralCount })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}
