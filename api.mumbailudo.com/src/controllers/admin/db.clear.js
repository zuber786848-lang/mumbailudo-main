const { errorResponse, successResponse } = require("../../helper/status.response");
const ludoGame = require("../../models/ludo.game");
const ludoTransaction = require("../../models/ludo.transaction");
const ludoUser = require("../../models/ludo.user");

exports.clearDatabase = async (req, res) => {

    try {
        let isUserDbClear = await ludoUser.deleteMany({})
        let isLudoGameDbClear = await ludoGame.deleteMany({})
        let isLudoTransactionDbClear = await ludoTransaction.deleteMany({})
        if (isUserDbClear && isLudoGameDbClear && isLudoTransactionDbClear) {
            return successResponse(res, 200, true, "Database Clear successfully!✔✌🎉");
        } else {
            return errorResponse(res, 404, false, "Database not clear successfully")
        }


    } catch (e) {
        return errorResponse(res, 500, false, e.message)
    }

}