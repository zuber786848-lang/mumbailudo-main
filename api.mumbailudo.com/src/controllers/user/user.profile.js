const jwt = require("jsonwebtoken");
const { errorResponse } = require("../../helper/status.response")
const { successResponse } = require("../../helper/status.response")
const { verifyJwtToken } = require("../../helper/token.user")
const ludoUser = require("../../models/ludo.user")
const ludoGame = require("../../models/ludo.game")

exports.userProfile = async (req, res) => {
    try {
        // Fetch user profile details excluding sensitive fields
        const user_profile_details = await ludoUser.findById(req.user_id).select({ password: 0, activeToken: 0 });

        if (!user_profile_details) {
            return errorResponse(res, 404, false, "User not found");
        }

        // Count total completed games for the user
        const totalGamePlayed = await ludoGame.countDocuments({
            status: "completed",
            $or: [
                { creator_id: req.user_id },
                { acceptor_id: req.user_id }
            ]
        });
        const totalReferralPlayed = await ludoUser.countDocuments({
            referred_by: user_profile_details.referral_code
        });

        // Include the total games played in the response
        const responseData = {
            ...user_profile_details.toObject(), // Convert Mongoose document to plain object
            totalGamePlayed,
            totalReferralPlayed
        };

        return successResponse(res, 200, true, "Profile fetched successfully", responseData);

    } catch (e) {
        console.error(e); // Use console.error for error logging
        return errorResponse(res, 500, false, "An error occurred while fetching profile");
    }
}
