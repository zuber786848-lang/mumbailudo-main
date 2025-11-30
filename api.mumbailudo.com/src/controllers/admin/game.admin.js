const { errorResponse, successResponse } = require("../../helper/status.response");
const ludoUser = require("../../models/ludo.user")
const ludoGame = require("../../models/ludo.game")
const ludoCommission = require("../../models/commison.admin")
const { adminCommission } = require("../../helper/game.commission")

// only for the admin here admin can see all user battels
exports.gamesView = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query
        let query = {}
        if (status) {
            query.status = status
        }
        const games = await ludoGame.find(query).populate({ path: "winner_id", select: "_id name" })
            .populate({ path: "luser_id", select: "_id name" }).populate({ path: "creator_id", select: "_id name" }).populate({ path: "acceptor_id", select: "_id name" }).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
        const totalDocs = await ludoGame.countDocuments(query);
        // const gameHistory = await ludoGame.find({ acceptor_id: userId, creator_id: userId, status: "completed" })
        return successResponse(res, 200, true, "success", { games, totalDocs })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

//only for the admin here admin can see any particular user battle
exports.gameView = async (req, res) => {
    try {
        const { gameId } = req.query

        const games = await ludoGame.findById(gameId).populate({ path: "winner_id", select: "_id name" })
            .populate({ path: "luser_id", select: "_id name" }).populate({ path: "creator_id", select: "_id name" }).populate({ path: "acceptor_id", select: "_id name" })
        // const gameHistory = await ludoGame.find({ acceptor_id: userId, creator_id: userId, status: "completed" })
        return successResponse(res, 200, true, "success", { games })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

// only for the admin here admin can see total commission amount and commision details can see by the admin
exports.adminCommissionDetail = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query

        const pageNumber = parseInt(page)
        const limitNumber = parseInt(limit)

        const commissionView = await ludoCommission.find().skip((pageNumber - 1) * limitNumber).limit(limitNumber).sort({ createdAt: -1 })
            .populate({ path: 'winner_id', select: '_id name' }).populate({ path: 'loser_id', select: '_id name' });

        // Calculate totalCommissionAmount
        const totalCommission = await ludoCommission.find()
        const totalCommissionAmount = totalCommission.reduce((total, commission) => total + commission.commission_amount, 0);

        const totalDocs = await ludoCommission.countDocuments();
        return successResponse(res, 200, true, "sucess", { commissionView, totalDocs, totalCommissionAmount })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

// only for the admin here user battel can handle by the admin means admin can cancle the battle or make winner of any player in the game
exports.gameUpdate = async (req, res) => {
    try {
        const { winnerId, status, gameId, completionReason } = req.query
        const gameExist = await ludoGame.findById(gameId)
        if (!gameExist) {
            return errorResponse(res, 400, false, "Error", "game is not exist")
        }
        if (gameExist.status === "completed") {
            return errorResponse(res, 400, false, "Error", "game is already completed")
        }
        if (gameExist.status === "canceled") {
            return errorResponse(res, 400, false, "Error", "game is canceled by both users and money is return already")
        }
        const isEqualCreator = gameExist.creator_id.equals(winnerId);
        const isEqualAcceptor = gameExist.acceptor_id.equals(winnerId);
        if (status == "canceled") {
            console.log("I am here")
            // Update wallet balances
            const creatorDetail = await ludoUser.findOneAndUpdate(
                { _id: gameExist.creator_id },
                {
                    $inc: {
                        wallet_balance: gameExist.wallet_creator_amount_deducted,
                        win_amount: gameExist.win_creator_amount_deducted,
                        bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                    }
                },
                { new: true }
            );
            const acceptorDetail = await ludoUser.findOneAndUpdate(
                { _id: gameExist.acceptor_id },
                {
                    $inc: {
                        wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                        win_amount: gameExist.win_acceptor_amount_deducted,
                        bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                    }
                },
                { new: true }
            );
            const updateGame = await ludoGame.findOneAndUpdate(
                { _id: gameId },
                {
                    $set: {
                        admin_id: req.user_id,
                        status: "completed", admin_completion_reason: completionReason,
                        creator_game_status: status, acceptor_game_status: status,
                        creator_game_canceled_reason: completionReason,
                        acceptor_game_canceled_reason: completionReason,
                        win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                        win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                        bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                    },
                    $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                },
                { new: true }
            );

            if (updateGame) {
                return successResponse(res, 200, true, "success", updateGame);
            }
            else {
                return errorResponse(res, 400, false, "game not exist")
            }
        }
        if (isEqualCreator) {

            const winMoney = await adminCommission(gameExist._id, gameExist.creator_id, gameExist.acceptor_id, gameExist.game_amount)
            // console.log("winning ", winMoney)
            const winnerDetail = await ludoUser.findByIdAndUpdate(gameExist.creator_id, {
                $inc: { total_win_amount: winMoney, win_amount: gameExist.game_amount + winMoney }
            }, { new: true });
            const updateGame = await ludoGame.findByIdAndUpdate(gameId, {
                $set: {
                    winner_id: gameExist.creator_id, luser_id: gameExist.acceptor_id,
                    creator_game_status: 'win', acceptor_game_status: 'lose', status: "completed",
                    winner_amount: winMoney,
                    creator_game_canceled_reason: completionReason,
                    acceptor_game_canceled_reason: completionReason,
                    admin_id: req.user_id, admin_completion_reason: completionReason
                },

                $inc: { creator_closing_balance: gameExist.game_amount + winMoney + winnerDetail.bonus_amount }
            }, { new: true })

            return successResponse(res, 200, true, "You have resolved the conflict game sucess", updateGame)

        }
        else if (isEqualAcceptor) {

            const winMoney = await adminCommission(gameExist._id, gameExist.acceptor_id, gameExist.creator_id, gameExist.game_amount)
            console.log("winning ", winMoney)
            const winnerDetail = await ludoUser.findByIdAndUpdate(gameExist.acceptor_id,
                {

                    $inc: { total_win_amount: winMoney, win_amount: gameExist.game_amount + winMoney }
                },
                { new: true });

            const updateGame = await ludoGame.findByIdAndUpdate(gameId, {
                $set: {
                    winner_id: gameExist.acceptor_id, luser_id: gameExist.creator_id,
                    acceptor_game_status: 'win', creator_game_status: 'lose',
                    winner_amount: winMoney,
                    status: "completed", admin_id: req.user_id, admin_completion_reason: completionReason
                },
                $inc: { acceptor_closing_balance: gameExist.game_amount + winMoney + winnerDetail.bonus_amount }
            }, { new: true })

            return successResponse(res, 200, true, "sucess", updateGame)
        } else {
            return successResponse(res, 200, true, "winner is not present", gameExist)
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

//only for the admin here user win amount can see by ascending and descending order
exports.ascendingDescendingWinAmount = async (req, res) => {
    try {
        // Default to descending order if no sortOrder query parameter is provided
        const order = (req.query.sort || '').toLowerCase();
        // console.log("Requested sort order:", order);

        // Determine sort order: 'asc' for ascending, default to descending
        const sortOrder = (order === 'asc' || order === '1') ? 1 : -1;
        // console.log("Sort order for query:", sortOrder);
        const win = await ludoUser.find()
            .select({ _id: 1, name: 1, phone_no: 1, win_amount: 1 })
            .sort({ win_amount: sortOrder });
        return successResponse(res, 200, true, win)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}