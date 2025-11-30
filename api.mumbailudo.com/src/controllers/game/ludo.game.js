const { errorResponse, successResponse } = require("../../helper/status.response")
const { adminCommission } = require("../../helper/game.commission")
const ludoGame = require("../../models/ludo.game");
const ludoUser = require("../../models/ludo.user");
// const ludoCommissionAdmin = require("../../models/commison.admin")
// const referralCommision = require("../../models/refferal.commision")
const adminSetting = require("../../models/ludo.admin.setting")

exports.gameCreate = async (req, res) => {
    try {
        const { game_amount } = req.body;

        // Fetch admin settings
        const adminSettingExist = await adminSetting.findOne();
        const minimumGameAmount = adminSettingExist?.minimum_game_amount || 50;
        const maximumGameAmount = adminSettingExist?.maximum_game_amount || 200000;
        const denomination = adminSettingExist?.denomination || 10;

        // Validate game amount
        if (game_amount < minimumGameAmount) {
            return errorResponse(res, 400, false, `Game amount should be above ${minimumGameAmount} Rs.`);
        }
        if (game_amount > maximumGameAmount) {
            return errorResponse(res, 400, false, `Game amount should be less than ${maximumGameAmount} Rs.`);
        }
        if (game_amount % denomination !== 0) {
            return errorResponse(res, 400, false, `Game amount must be in denominations of ${denomination} Rs.`);
        }

        // Fetch user balance
        const userBalance = await ludoUser.findById(req.user_id).select('wallet_balance win_amount bonus_amount');
        const totalBalance = userBalance?.wallet_balance + userBalance?.win_amount + userBalance?.bonus_amount || 0;

        if (totalBalance < game_amount || totalBalance === 0) {
            return errorResponse(res, 400, false, "Please add money to your wallet to create a new game.");
        }

        // Check for existing games
        const gameExist = await ludoGame.findOne({
            status: { $in: ["pending", "requested", "running"] },
            $or: [{ creator_id: req.user_id }, { acceptor_id: req.user_id }]
        });
        if (gameExist) {
            const isEqualCreator = gameExist.creator_id && gameExist.creator_id.equals(req.user_id);
            const isEqualAcceptor = gameExist.acceptor_id && gameExist.acceptor_id.equals(req.user_id);
            console.log("creator ", isEqualCreator)
            console.log("acceptor ", isEqualAcceptor)
            if (isEqualCreator) {
                const gameExistCreator = await ludoGame.findOne({
                    $and: [
                        { creator_id: req.user_id },
                        { creator_game_status: { $in: ["pending", "running"] } }
                    ]
                });
                if (gameExistCreator) {
                    return errorResponse(res, 400, false, "You must submit results for your ongoing games or cancel them to create a new bet.");
                }
            }
            if (isEqualAcceptor) {
                const gameExistAcceptor = await ludoGame.findOne({
                    $and: [
                        { acceptor_id: req.user_id },
                        { acceptor_game_status: { $in: ["pending", "running"] } }
                    ]
                })
                if (gameExistAcceptor) {
                    return errorResponse(res, 400, false, "You must submit results for your ongoing games or cancel them to create a new bet.");
                }
            }
        }
        // if (gameExist) {
        //     return errorResponse(res, 400, false, "You must submit results for your ongoing games or cancel them to create a new bet. I am outside");
        // }

        const gameExist3 = await ludoGame.find({
            status: { $in: ["new"] },
            $or: [{ creator_id: req.user_id }, { acceptor_id: req.user_id }]
        });

        if(gameExist3.length > 2){
            return errorResponse(res, 400, false, "Game creation limit reached max 3");
        }
        // Create new game
        const gameCreate = await ludoGame.create({
            creator_id: req.user_id,
            game_amount,
            status: "new"
        });

        if (!gameCreate) {
            return errorResponse(res, 400, false, "Something went wrong, game not created");
        }

        // Set timeout to change game status if not accepted
        setTimeout(async () => {
            const battle = await ludoGame.findById(gameCreate._id);
            if (battle && battle.status === "new") {
                await ludoGame.deleteOne({ _id: gameCreate._id });
            }
        }, 5 * 60 * 1000); // 5 minutes


        return successResponse(res, 201, true, "Game created successfully", gameCreate);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
};
exports.gameOpen = async (req, res) => {
    try {

        const isGame = await ludoGame.find({
            $or: [
                {
                    status: "new"
                },
                {
                    status: "requested"
                },
                {
                    status: "running"
                },
                {
                    status: "conflict"
                },

            ],
        }).populate({
            path: "creator_id",
            select: "name phone" // Specify the fields you want to include
        })
        .populate({
            path: "acceptor_id",
            select: "name phone" // Specify the fields you want to include
        }).select({room_code: 0});

        if (!isGame) {
            return errorResponse(res, 400, false, "Some thing went wrong game not fetch")
        } else {
            return errorResponse(res, 200, true, "Game fetch successfully", isGame)
        }


    } catch (error) {
        return errorResponse(res, 500, false, "internal server error", error.message);
    }
}
exports.gameDelete = async (req, res) => {
    try {

        let isGame = await ludoGame.findOneAndDelete({
            $and: [
                {
                    $or: [
                        { status: "new" },
                    ]
                },
                {
                    $or: [
                        { creator_id: req.user_id },
                        { acceptor_id: req.user_id }
                    ]
                }
            ],
            _id: req.params.id
        })

        if (!isGame) {
            return errorResponse(res, 400, false, "Some thing went wrong game not fetch")
        } else {
            return errorResponse(res, 200, true, "Game delete successfully", isGame)
        }


    } catch (error) {
        return errorResponse(res, 500, false, "internal server error", error.message);
    }
}
exports.requestToPlay = async (req, res) => {
    try {
        const isGameExist = await ludoGame.findById(req.params.id)
        if (!isGameExist) {
            return errorResponse(res, 400, false, "Some thing went wrong game not fetch")
        }
        if (isGameExist.status != "new") {
            return errorResponse(res, 400, false, "Game is in pendding or in running")
        }
        const userExist = await ludoUser.findById(req.user_id)
        const totalBalance = userExist.wallet_balance + userExist.win_amount + userExist.bonus_amount

        if (totalBalance < isGameExist.game_amount) {
            return errorResponse(res, 400, false, "You have not sufficient balance to play the game")
        }

       // Check for existing games
       const gameExist = await ludoGame.findOne({
        status: { $in: ["new", "pending", "requested", "running"] },
        $or: [{ creator_id: req.user_id }, { acceptor_id: req.user_id }]
        });
        if (gameExist) {
            const isEqualCreator = gameExist.creator_id && gameExist.creator_id.equals(req.user_id);
            const isEqualAcceptor = gameExist.acceptor_id && gameExist.acceptor_id.equals(req.user_id);
            console.log("creator ", isEqualCreator)
            console.log("acceptor ", isEqualAcceptor)
            if (isEqualCreator) {
                const gameExistCreator = await ludoGame.findOne({
                    $and: [
                        { creator_id: req.user_id },
                        { creator_game_status: { $in: [ "running"] } }
                    ]
                });
                if (gameExistCreator) {
                    return errorResponse(res, 400, false, "You must submit results for your ongoing games or cancel them to play a new bet.");
                }
            }
            if (isEqualAcceptor) {
                const gameExistAcceptor = await ludoGame.findOne({
                    $and: [
                        { acceptor_id: req.user_id },
                        { acceptor_game_status: { $in: [ "running"] } }
                    ]
                })
                if (gameExistAcceptor) {
                    return errorResponse(res, 400, false, "You must submit results for your ongoing games or cancel them to play a new bet.");
                }
            }
        }

        // Update the game status to 'requested'
        const updatedGame = await ludoGame.findOneAndUpdate(
            { _id: req.params.id, status: "new" },
            { $set: { acceptor_id: req.user_id, status: "requested" } },
            { new: true }
        );

        if (!updatedGame) {
            return errorResponse(res, 400, false, "Something went wrong: game update failed");
        } else {
            return successResponse(res, 200, true, "User game requested successfully", updatedGame);
        }


    } catch (error) {
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}
exports.rejectRequest = async (req, res) => {
    try {

        const isGame = await ludoGame.findOneAndUpdate({
            _id: req.params.id,
            status: "requested"
        }, { $set: { acceptor_id: null, status: "new" } }, { new: true })

        if (!isGame) {
            return errorResponse(res, 400, false, "Some thing went wrong game not fetch")
        } else {
            return errorResponse(res, 200, true, "User game request rejected successfully", isGame)
        }


    } catch (error) {
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}
exports.deleteRequest = async (req, res) => {
    try {

        const isGame = await ludoGame.findOneAndUpdate({
            _id: req.params.id,
            status: "requested",
            acceptor_id: req.user_id,
        }, { $set: { acceptor_id: null, status: "new" } }, { new: true })

        if (!isGame) {
            return errorResponse(res, 400, false, "Some thing went wrong game not fetch")
        } else {
            return errorResponse(res, 200, true, "User game request delete successfully", isGame)
        }


    } catch (error) {
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}
exports.startRequestGamePlay = async (req, res) => {
    try {
        // Check if the game exists with the specified status and creator ID
        const gameExist = await ludoGame.findOne({ _id: req.params.id, status: "requested", creator_id: req.user_id });

        if (!gameExist) {
            return errorResponse(res, 400, false, "Error", "Game not found.");
        }

        // Fetch creator and acceptor details using their IDs
        const [creator, acceptor] = await Promise.all([
            ludoUser.findById(gameExist.creator_id),
            ludoUser.findById(gameExist.acceptor_id),
        ]);

        if (!creator || !acceptor) {
            return errorResponse(res, 400, false, "Error", "User not found.");
        }

        const creatorBalance = creator.wallet_balance + creator.win_amount + creator.bonus_amount;
        const acceptorBalance = acceptor.wallet_balance + acceptor.win_amount + acceptor.bonus_amount;

        if (creatorBalance < gameExist.game_amount || acceptorBalance < gameExist.game_amount) {
            return errorResponse(res, 400, false, "Insufficient balance", "Insufficient balance in your wallet or win.");
        }

        const calculateBalances = (user, gameAmount) => {
            const walletDeducted = Math.min(user.wallet_balance, gameAmount);
            let remainingGameAmount = gameAmount - walletDeducted;

            const winDeducted = Math.min(user.win_amount, remainingGameAmount);
            remainingGameAmount -= winDeducted;

            const bonusDeducted = Math.min(user.bonus_amount, remainingGameAmount);

            return {
                wallet_balance: user.wallet_balance - walletDeducted,
                win_amount: user.win_amount - winDeducted,
                bonus_amount: user.bonus_amount - bonusDeducted,
                wallet_deducted: walletDeducted,
                win_deducted: winDeducted,
                bonus_deducted: bonusDeducted,
            };
        };

        // Calculate new balances for both users
        const creatorUpdateData = calculateBalances(creator, gameExist.game_amount);
        const acceptorUpdateData = calculateBalances(acceptor, gameExist.game_amount);

        // Update user balances
        await Promise.all([
            ludoUser.findByIdAndUpdate(gameExist.creator_id, { $set: creatorUpdateData }, { new: true }),
            ludoUser.findByIdAndUpdate(gameExist.acceptor_id, { $set: acceptorUpdateData }, { new: true }),
        ]);

        // Update the game status to "running"
        const updatedGame = await ludoGame.findOneAndUpdate(
            { _id: req.params.id, status: "requested", creator_id: req.user_id },
            {
                $set: {
                    status: "running",
                    creator_closing_balance: creatorUpdateData.wallet_balance + creatorUpdateData.win_amount + creatorUpdateData.bonus_amount,
                    acceptor_closing_balance: acceptorUpdateData.wallet_balance + acceptorUpdateData.win_amount + acceptorUpdateData.bonus_amount,
                    wallet_creator_amount_deducted: creatorUpdateData.wallet_deducted,
                    win_creator_amount_deducted: creatorUpdateData.win_deducted,
                    bonus_creator_amount_deducted: creatorUpdateData.bonus_deducted,
                    wallet_acceptor_amount_deducted: acceptorUpdateData.wallet_deducted,
                    win_acceptor_amount_deducted: acceptorUpdateData.win_deducted,
                    bonus_acceptor_amount_deducted: acceptorUpdateData.bonus_deducted,
                }
            },
            { new: true }
        );

        if (!updatedGame) {
            return errorResponse(res, 400, false, "Error", "Something went wrong, game not updated.");
        }

        // Find all games to delete with status "new" or "requested"
        const gamesToDelete = await ludoGame.find({
            $or: [
                { status: "new", $or: [{ creator_id: gameExist.creator_id }, { acceptor_id: gameExist.creator_id }] },
                { status: "requested", $or: [{ creator_id: gameExist.creator_id }, { acceptor_id: gameExist.creator_id }] },
                { status: "new", $or: [{ creator_id: gameExist.acceptor_id }, { acceptor_id: gameExist.acceptor_id }] },
                { status: "requested", $or: [{ creator_id: gameExist.acceptor_id }, { acceptor_id: gameExist.acceptor_id }] },
            ]
        });

        // Delete matching games if any
        if (gamesToDelete.length > 0) {
            await ludoGame.deleteMany({ _id: { $in: gamesToDelete.map(game => game._id) } });
        }

        // Successfully started the game
        return successResponse(res, 200, true, "User game request started successfully", updatedGame);

    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}
exports.gameDetails = async (req, res) => {
    try {

        const isGame = await ludoGame.findOne({
            $and: [
                {
                    $or: [
                        { status: "running" },
                        { status: "conflict" },
                    ]
                },
                {
                    $or: [
                        { creator_id: req.user_id },
                        { acceptor_id: req.user_id }
                    ]
                }
            ],
            _id: req.params.id
        }).populate({
            path: "creator_id",
            select: "name phone" // Specify the fields you want to include
        })
        .populate({
            path: "acceptor_id",
            select: "name phone" // Specify the fields you want to include
        });

        if (!isGame) {
            return errorResponse(res, 400, false, "Some thing went wrong game not fetch")
        } else {
            return errorResponse(res, 200, true, "Game details fetch successfully", isGame)
        }


    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}
// exports.setRoomCode = async (req, res) => {
//     try {

//         const isGame = await ludoGame.findOneAndUpdate({
//             $and: [
//                 {
//                     $or: [
//                         { status: "running" },
//                     ]
//                 },
//                 {
//                     $or: [
//                         { creator_id: req.user_id },
//                     ]
//                 }
//             ],
//             _id: req.params.id
//         }, { $set: { room_code: req.body.room_code, acceptor_game_status: "running", creator_game_status: "running" } }, { new: true })

//         if (!isGame) {
//             return errorResponse(res, 400, false, "Some thing went wrong game not fetch")
//         } else {
//             return errorResponse(res, 200, true, "Game details fetch successfully", isGame)
//         }


//     } catch (error) {
//         console.log(error)
//         return errorResponse(res, 500, false, "Internal server error", error.message);
//     }
// }

exports.setRoomCode = async (req, res) => {
    try {
        // Find the game to check its current status
        const game = await ludoGame.findOne({
            _id: req.params.id,
            status: "running",
            creator_id: req.user_id,
            $or: [
                { creator_game_status: { $in: ["win", "lose", "canceled",] } },
                { acceptor_game_status: { $in: ["win", "lose", "canceled",] } }
            ]
        });


        if (game) {
            return errorResponse(res, 400, false, "Game is already canceled");
        }

        // // Check if the acceptor has already submitted a result
        // if (game.acceptor_game_status !== "pending") {
        //     return errorResponse(res, 400, false, "Cannot set room code. Acceptor has already submitted a result.");
        // }

        // Update the game with the room code
        const updatedGame = await ludoGame.findOneAndUpdate(
            { _id: req.params.id, status: "running", creator_id: req.user_id },
            {
                $set: {
                    room_code: req.body.room_code,
                    acceptor_game_status: "running",
                    creator_game_status: "running"
                }
            },
            { new: true }
        );

        if (!updatedGame) {
            return errorResponse(res, 400, false, "Something went wrong, game could not be updated");
        } else {
            return errorResponse(res, 200, true, "Game details updated successfully", updatedGame);
        }

    } catch (error) {
        console.log(error);
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}

// async function adminCommission(game_id, creator_id, acceptor_id, game_amount) {
//     try {
//         // Fetch commission percentage
//         const commissionPercent = await commissionPercentage.findOne();
//         const winnerDetail = await ludoUser.findById(creator_id);
//         let referralCommissionAmount = 0;
//         if (winnerDetail.referred_by) {
//             const referred_by_id = await checkReferral(winnerDetail.referred_by)
//             if (!referred_by_id) {
//                 referralCommissionAmount = 0;
//             }
//             referralCommissionAmount = await referralCommission(game_id, referred_by_id, creator_id, acceptor_id, game_amount)
//         }
//         // Determine the percentage to use
//         let commissionAmount = null //
//         if (game_amount >= 100 && game_amount <= 300) {
//             const percentage = commissionPercent ? commissionPercent.admin_commission_one : 5;
//             commissionAmount = (game_amount * 2) * percentage / 100;
//         } else if (game_amount >= 301 && game_amount <= 600) {
//             const percentage = commissionPercent ? commissionPercent.admin_commission_two : 4.5;
//             commissionAmount = (game_amount * 2) * percentage / 100;
//         } else if (game_amount >= 601 && game_amount <= 999) {
//             const percentage = commissionPercent ? commissionPercent.admin_commission_three : 4;
//             commissionAmount = (game_amount * 2) * percentage / 100;
//         } else {
//             const percentage = commissionPercent ? commissionPercent.admin_commission_four : 3;
//             commissionAmount = (game_amount * 2) * percentage / 100;
//         }

//         const totalAdminProfit = commissionAmount - referralCommissionAmount
//         await ludoCommissionAdmin.create({
//             game_id: game_id,
//             game_amount: game_amount,
//             commission_amount: totalAdminProfit,
//             winner_id: creator_id,
//             loser_id: acceptor_id
//         });

//         // Return the winning amount
//         return game_amount - commissionAmount;
//     } catch (error) {
//         console.error("Error processing admin commission:", error);
//         throw error; // Rethrow or handle as needed
//     }
// }


// async function referralCommission(game_id, referral_id, creator_id, acceptor_id, game_amount) {
//     try {
//         // Fetch commission percentage
//         const commissionPercent = await commissionPercentage.findOne();
//         const percentage = commissionPercent ? commissionPercent.referral_commission : 1;

//         // Calculate referral commission
//         const referralCommission = game_amount * percentage / 100;

//         // Update the referral user's amount
//         const referralAmount = await ludoUser.findByIdAndUpdate(referral_id, {
//             $inc: {
//                 total_referral_amount: referralCommission,
//                 win_amount: referralCommission
//             }
//         }, { new: true });

//         // Log the commission details
//         await referralCommision.create({
//             game_id: game_id,
//             game_amount: game_amount,
//             referral_commission_amount: referralCommission,
//             winner_id: creator_id,
//             loser_id: acceptor_id,
//             referral_id: referral_id
//         });

//         // Return the adjusted game amount
//         return referralCommission;
//     } catch (error) {
//         console.error("Error processing referral commission:", error);
//         throw error; // Rethrow or handle as needed
//     }
// }

// async function checkReferral(referred_by) {
//     // Find the user who referred the current user
//     const referralUser = await ludoUser.findOne({ referral_code: referred_by });
//     if (!referralUser) {
//         return false;
//     }

//     // Check if the referral user is deleted or blocked
//     if (referralUser.delete || referralUser.block) {
//         return false;
//     }

//     // Return the referral user's ID if all checks pass
//     return referralUser._id;
// }

exports.submitGameResult = async (req, res) => {
    try {
        const { status, cancelReason } = req.body
        // console.log(req.body)
        const gameScreenshort = req.files && req.files['game_screenshort'] ? req.files['game_screenshort'][0] : null;

        const gameExist = await ludoGame.findOne({
            $and: [
                { status: "running" },
                {
                    $or: [
                        { creator_id: req.user_id },
                        { acceptor_id: req.user_id }
                    ]
                },
                { _id: req.params.id }
            ]
        });
        // console.log(gameExist)
        if (!gameExist) {
            return errorResponse(res, 400, false, "Some thing went wrong game not fetch")
        }
        const isEqualCreator = gameExist.creator_id.equals(req.user_id);
        const isEqualAcceptor = gameExist.acceptor_id.equals(req.user_id);

        if (isEqualCreator) {
            if (status === "win") {
                if (!gameScreenshort) {
                    // Return an error response if the game screenshot is missing
                    return errorResponse(res, 400, false, "Error", "game screenshot is required.")
                }
                if (gameExist.acceptor_game_status === "lose") {
                    // Here game creator will be win
                    const winMoney = await adminCommission(gameExist._id, gameExist.creator_id, gameExist.acceptor_id, gameExist.game_amount)

                    // game_id, referral_id, creator_id, acceptor_id, game_amount
                    const winnerDetail = await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: { total_win_amount: winMoney, win_amount: gameExist.game_amount + winMoney }
                        },
                        { new: true });
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                winner_id: gameExist.creator_id, luser_id: gameExist.acceptor_id,
                                creator_game_status: status, winner_amount: winMoney, status: "completed",
                                creator_game_screenshort: gameScreenshort.filename,
                                creator_game_screenshort_time: Date.now(), creator_game_status_time: Date.now()
                            },
                            $inc: { creator_closing_balance: gameExist.game_amount + winMoney }
                        },
                        { new: true });
                    // if (winnerDetail) {
                    //     console.log("creator win this game")
                    // }

                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.acceptor_game_status === "win") {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "conflict", creator_game_status: status,
                                creator_game_screenshort: gameScreenshort.filename,
                                creator_game_screenshort_time: Date.now(), creator_game_status_time: Date.now()
                            }
                        },
                        { new: true });
                    return successResponse(res, 200, true, "success", updateGame);

                }

                else if (gameExist.acceptor_game_status === "canceled") {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "conflict", creator_game_status: status,
                                creator_game_screenshort: gameScreenshort.filename,
                                creator_game_screenshort_time: Date.now(), creator_game_status_time: Date.now()
                            }
                        },
                        { new: true });
                    return successResponse(res, 200, true, "success", updateGame);
                }
                else {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                creator_game_status: status, creator_game_screenshort: gameScreenshort.filename,
                                creator_game_screenshort_time: Date.now(), creator_game_status_time: Date.now()
                            }
                        },
                        { new: true }
                    );
                    return successResponse(res, 200, true, "success", updateGame);
                }
            }
            else if (status === "lose") {
                // Here game acceptor will be win means game acceptor closing amount and win amount will be increase
                if (gameExist.acceptor_game_status === "win") {
                    const winMoney = await adminCommission(gameExist._id, gameExist.acceptor_id, gameExist.creator_id, gameExist.game_amount)

                    const winnerDetail = await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: { total_win_amount: winMoney, win_amount: gameExist.game_amount + winMoney }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                winner_id: gameExist.acceptor_id, luser_id: gameExist.creator_id, winner_amount: winMoney,
                                status: "completed", creator_game_status: status, creator_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount + winMoney }
                        },
                        { new: true });

                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.acceptor_game_status === "lose") {
                    // const updateGame = await ludoGame.findOneAndUpdate(
                    //     { _id: req.params.id, status: "running" },
                    //     { $set: { status: "conflict", creator_game_status: status } },
                    //     { new: true }
                    // );
                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_creator_amount_deducted,
                                win_amount: gameExist.win_creator_amount_deducted,
                                bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                            }
                        },
                        { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                                win_amount: gameExist.win_acceptor_amount_deducted,
                                bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                            }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "completed", creator_game_status: "canceled", acceptor_game_status: "canceled",
                                // creator_game_canceled_reason: cancelReason,
                                win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                                win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                                bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                                creator_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                        },
                        { new: true });
                    return successResponse(res, 200, true, "success", updateGame);

                } else if (gameExist.acceptor_game_status === "canceled") {
                    // const updateGame = await ludoGame.findOneAndUpdate(
                    //     { _id: req.params.id, status: "running" },
                    //     { $set: { status: "conflict", creator_game_status: status } },
                    //     { new: true }
                    // );
                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_creator_amount_deducted,
                                win_amount: gameExist.win_creator_amount_deducted,
                                bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                            }
                        },
                        { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                                win_amount: gameExist.win_acceptor_amount_deducted,
                                bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                            }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "completed", creator_game_status: "canceled", acceptor_game_status: "canceled",
                                // creator_game_canceled_reason: cancelReason,
                                win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                                win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                                bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                                creator_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                        },
                        { new: true });
                    return successResponse(res, 200, true, "success", updateGame);
                }
                else {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        { $set: { status: "running", creator_game_status: status, creator_game_status_time: Date.now() } },
                        { new: true }
                    );
                    return successResponse(res, 200, true, "success", updateGame);
                }
            }
            else if (status === "canceled") {
                if (!cancelReason) {
                    return errorResponse(res, 400, false, "Error", "please submit cancle reason")
                }
                if (gameExist.acceptor_game_status === "canceled") {
                    // here both user has return the  deducted amount

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_creator_amount_deducted,
                                win_amount: gameExist.win_creator_amount_deducted,
                                bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                            }
                        },
                        { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                                win_amount: gameExist.win_acceptor_amount_deducted,
                                bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                            }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "completed", creator_game_status: status, acceptor_game_status: status,
                                creator_game_canceled_reason: cancelReason,
                                win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                                win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                                bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                                creator_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                        },
                        { new: true });

                    // Update wallet balances
                    // await ludoUser.findOneAndUpdate(
                    //     { _id: updateGame.creator_id },
                    //     { $inc: { wallet_balance: gameExist.game_amount } },
                    //     { new: true });

                    // await ludoUser.findOneAndUpdate(
                    //     { _id: updateGame.acceptor_id },
                    //     { $inc: { wallet_balance: gameExist.game_amount } },
                    //     { new: true });

                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.acceptor_game_status === "win") {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "conflict", creator_game_status: status,
                                creator_game_canceled_reason: cancelReason, creator_game_status_time: Date.now()
                            }
                        },
                        { new: true }
                    );
                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.acceptor_game_status == "lose") {
                    // const updateGame = await ludoGame.findOneAndUpdate(
                    //     { _id: req.params.id, status: "running" },
                    //     { $set: { status: "conflict", creator_game_status: status, creator_game_canceled_reason: cancelReason } },
                    //     { new: true }
                    // );
                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_creator_amount_deducted,
                                win_amount: gameExist.win_creator_amount_deducted,
                                bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                            }
                        },
                        { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                                win_amount: gameExist.win_acceptor_amount_deducted,
                                bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                            }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "completed", creator_game_status: "canceled", acceptor_game_status: "canceled",
                                creator_game_canceled_reason: cancelReason,
                                win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                                win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                                bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                                creator_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                        },
                        { new: true });
                    return successResponse(res, 200, true, "success", updateGame);
                } else {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                creator_game_status: status, creator_game_canceled_reason: cancelReason,
                                creator_game_status_time: Date.now()
                            }
                        },
                        { new: true }
                    );
                    return successResponse(res, 200, true, "success", updateGame);
                }
            }
        }

        else if (isEqualAcceptor) {
            if (status === "win") {
                if (!gameScreenshort) {
                    // Return an error response if the game screenshot is missing
                    return errorResponse(res, 400, false, "Error", "game screenshot is required.")
                }
                else if (gameExist.creator_game_status === "lose") {
                    // here game acceptor will win the amount
                    const winMoney = await adminCommission(gameExist._id, gameExist.acceptor_id, gameExist.creator_id, gameExist.game_amount)

                    const winnerDetail = await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: { total_win_amount: winMoney, win_amount: gameExist.game_amount + winMoney }
                        });
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                winner_id: gameExist.acceptor_id, luser_id: gameExist.creator_id, winner_amount: winMoney,
                                status: "completed", acceptor_game_status: status,
                                acceptor_game_screenshort: gameScreenshort.filename,
                                acceptor_game_screenshort_time: Date.now(), acceptor_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount + winMoney }
                        },
                        { new: true });



                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.creator_game_status === "win") {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "conflict", acceptor_game_status: status,
                                acceptor_game_screenshort: gameScreenshort.filename,
                                acceptor_game_screenshort_time: Date.now(), acceptor_game_status_time: Date.now()
                            }
                        },
                        { new: true }
                    );
                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.creator_game_status == "canceled") {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "conflict", acceptor_game_status: status,
                                acceptor_game_screenshort: gameScreenshort.filename,
                                acceptor_game_screenshort_time: Date.now(), acceptor_game_status_time: Date.now()
                            }
                        },
                        { new: true }
                    );
                }
                else {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                acceptor_game_status: status, acceptor_game_screenshort: gameScreenshort.filename,
                                acceptor_game_screenshort_time: Date.now(), acceptor_game_status_time: Date.now()
                            }
                        },
                        { new: true }
                    );
                    return successResponse(res, 200, true, "success", updateGame);
                }
            }
            else if (status === "lose") {
                // Here game creator will be win and his closing amount and win amount will be increase
                if (gameExist.creator_game_status === "win") {
                    const winMoney = await adminCommission(gameExist._id, gameExist.creator_id, gameExist.acceptor_id, gameExist.game_amount)
                    const winnerDetail = await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: { total_win_amount: winMoney, win_amount: gameExist.game_amount + winMoney }
                        },
                        { new: true });
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                winner_id: gameExist.creator_id, luser_id: gameExist.acceptor_id,
                                winner_amount: winMoney, status: "completed", acceptor_game_status: status,
                                acceptor_game_status_time: Date.now()
                            },
                            $inc: { creator_closing_balance: gameExist.game_amount + winMoney }
                        },
                        { new: true });



                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.creator_game_status === "lose") {
                    // const updateGame = await ludoGame.findOneAndUpdate(
                    //     { _id: req.params.id, status: "running" },
                    //     { $set: { status: "conflict", acceptor_game_status: status } },
                    //     { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_creator_amount_deducted,
                                win_amount: gameExist.win_creator_amount_deducted,
                                bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                            }
                        },
                        { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                                win_amount: gameExist.win_acceptor_amount_deducted,
                                bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                            }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "completed", acceptor_game_status: "canceled", creator_game_status: "canceled",
                                // acceptor_game_canceled_reason: cancelReason,
                                win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                                win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                                bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                                acceptor_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                        },
                        { new: true });
                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.creator_game_status === "canceled") {
                    // const updateGame = await ludoGame.findOneAndUpdate(
                    //     { _id: req.params.id, status: "running" },
                    //     { $set: { status: "conflict", acceptor_game_status: status } },
                    //     { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_creator_amount_deducted,
                                win_amount: gameExist.win_creator_amount_deducted,
                                bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                            }
                        },
                        { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                                win_amount: gameExist.win_acceptor_amount_deducted,
                                bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                            }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "completed", acceptor_game_status: "canceled", creator_game_status: "canceled",
                                // acceptor_game_canceled_reason: cancelReason,
                                win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                                win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                                bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                                acceptor_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                        },
                        { new: true });

                    return successResponse(res, 200, true, "success", updateGame);
                }
                else {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        { $set: { acceptor_game_status: status, acceptor_game_status_time: Date.now() } },
                        { new: true });
                    return successResponse(res, 200, true, "success", updateGame);
                }
            }
            else if (status === "canceled") {
                if (!cancelReason) {
                    return errorResponse(res, 400, false, "Error", "please submit cancle reason")
                }
                if (gameExist.creator_game_status === "canceled") {

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_creator_amount_deducted,
                                win_amount: gameExist.win_creator_amount_deducted,
                                bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                            }
                        },
                        { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                                win_amount: gameExist.win_acceptor_amount_deducted,
                                bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                            }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "completed", acceptor_game_status: status,
                                acceptor_game_canceled_reason: cancelReason,
                                win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                                win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                                bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                                acceptor_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                        },
                        { new: true });

                    // // Update wallet balances
                    // await ludoUser.findOneAndUpdate(
                    //     { _id: updateGame.creator_id },
                    //     { $inc: { wallet_balance: gameExist.game_amount } },
                    //     { new: true });
                    // await ludoUser.findOneAndUpdate(
                    //     { _id: updateGame.acceptor_id },
                    //     { $inc: { wallet_balance: gameExist.game_amount } },
                    //     { new: true });

                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.creator_game_status === "win") {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "conflict", acceptor_game_status: status,
                                acceptor_game_canceled_reason: cancelReason,
                                acceptor_game_status_time: Date.now()
                            }
                        },
                        { new: true }
                    );
                    return successResponse(res, 200, true, "success", updateGame);
                }
                else if (gameExist.creator_game_status == "lose") {
                    // const updateGame = await ludoGame.findOneAndUpdate(
                    //     { _id: req.params.id, status: "running" },
                    //     { $set: { status: "conflict", acceptor_game_status: status, acceptor_game_canceled_reason: cancelReason } },
                    //     { new: true }
                    // );
                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.creator_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_creator_amount_deducted,
                                win_amount: gameExist.win_creator_amount_deducted,
                                bonus_creator_amount_deducted: gameExist.bonus_creator_amount_deducted
                            }
                        },
                        { new: true });

                    await ludoUser.findOneAndUpdate(
                        { _id: gameExist.acceptor_id },
                        {
                            $inc: {
                                wallet_balance: gameExist.wallet_acceptor_amount_deducted,
                                win_amount: gameExist.win_acceptor_amount_deducted,
                                bonus_acceptor_amount_deducted: gameExist.bonus_acceptor_amount_deducted
                            }
                        },
                        { new: true });

                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                status: "completed", acceptor_game_status: status, creator_game_status: status,
                                acceptor_game_canceled_reason: cancelReason,
                                win_creator_amount_deducted: 0, wallet_creator_amount_deducted: 0,
                                win_acceptor_amount_deducted: 0, wallet_acceptor_amount_deducted: 0,
                                bonus_creator_amount_deducted: 0, bonus_acceptor_amount_deducted: 0,
                                acceptor_game_status_time: Date.now()
                            },
                            $inc: { acceptor_closing_balance: gameExist.game_amount, creator_closing_balance: gameExist.game_amount }
                        },
                        { new: true });

                    return successResponse(res, 200, true, "success", updateGame);
                }
                else {
                    const updateGame = await ludoGame.findOneAndUpdate(
                        { _id: req.params.id, status: "running" },
                        {
                            $set: {
                                acceptor_game_status: status, acceptor_game_canceled_reason: cancelReason,
                                acceptor_game_status_time: Date.now()
                            }
                        },
                        { new: true }
                    );
                    return successResponse(res, 200, true, "success", updateGame);
                }
            }
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}

exports.gameHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query

        const gameHistory = await ludoGame.find({
            $or: [
                { creator_id: req.user_id },
                { acceptor_id: req.user_id }
            ],
            status: "completed"
        }).populate({ path: "winner_id", select: "_id name" })
            .populate({ path: "luser_id", select: "_id name" }).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
        const totalDocs = await ludoGame.countDocuments({
            $or: [
                { creator_id: req.user_id },
                { acceptor_id: req.user_id }
            ],
            status: "completed"
        });
        // const gameHistory = await ludoGame.find({ acceptor_id: userId, creator_id: userId, status: "completed" })
        return successResponse(res, 200, true, "success", { gameHistory, totalDocs })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}
