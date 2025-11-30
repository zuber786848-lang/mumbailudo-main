const jwt = require("jsonwebtoken");
const { errorResponse } = require("../../helper/status.response")
const { successResponse } = require("../../helper/status.response")
const { verifyJwtToken } = require("../../helper/token.user")
const ludoUser = require("../../models/ludo.user")

exports.userUpdate = async (req, res) => {
    try {
        const { name, password, email } = req.body;
        const updateFields = {};

        if (name) {
            updateFields.name = name;
        }
        if (password) {
            updateFields.password = password;
        }
        if (email) {
            updateFields.email = email;
        }

        const updateUser = await ludoUser.findByIdAndUpdate(req.user_id, { $set: updateFields }, { new: true }).select({ password: 0 });

        if (!updateUser) {
            return errorResponse(res, 404, false, "User not found");
        }
        return successResponse(res, 200, true, "success", updateUser)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}