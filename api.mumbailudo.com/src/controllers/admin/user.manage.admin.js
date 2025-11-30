const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { successResponse, errorResponse } = require("../../helper/status.response");
const ludoUser = require("../../models/ludo.user");

exports.userBlock = async (req, res) => {
    try {
        const { userId, blockReseason } = req.query
        const blocked = await ludoUser.findById(userId)
        if (!blocked) {
            return errorResponse(res, 400, false, "user not exist in our system")
        }
        if (blocked.block == true) {
            return errorResponse(res, 400, false, "user already blocked")
        }
        if (blocked.delete == true) {
            return errorResponse(res, 400, false, "user is already deleted")
        }
        const userBlocked = await ludoUser.findByIdAndUpdate(userId, { $set: { block: true, block_reseason: blockReseason, activeToken: '' } }, { new: true }).select({ phone_no: 0, password: 0 })

        return successResponse(res, 200, true, "user blocked succesfully", userBlocked)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internalse server error", error.error)
    }
}

exports.userUnblock = async (req, res) => {
    try {
        const { userId } = req.query
        const blocked = await ludoUser.findById(userId)
        if (!blocked) {
            return errorResponse(res, 400, false, "user not exist in our system")
        }
        // if (blocked.block == true) {
        //     return errorResponse(res, 400, false, "user already blocked")
        // }
        if (blocked.delete == true) {
            return errorResponse(res, 400, false, "user is already deleted")
        }
        const userUnblocked = await ludoUser.findByIdAndUpdate(userId, { $set: { block: false, activeToken: '' } }, { new: true }).select({ phone_no: 0, password: 0 })

        return successResponse(res, 200, true, "user unblocked succesfully", userUnblocked)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internalse server error", error.error)
    }
}

exports.userDelete = async (req, res) => {
    try {
        const { userId } = req.query;
        const userExist = await ludoUser.findById(userId)
        if (!userExist) {
            return errorResponse(res, 400, false, "user not exist")
        }
        if (userExist.delete == true) {
            return errorResponse(res, 400, false, "user is already deleted")
        }
        const userDelete = await ludoUser.findByIdAndUpdate(userId, { $set: { delete: true, activeToken: '' } }, { new: true }).select({ phone_no: 0, password: 0 })
        return successResponse(res, 200, true, "user deleted success", userDelete)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internalse server error", error.error)
    }
}