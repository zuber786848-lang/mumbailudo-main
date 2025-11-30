// Deduct the game amount from both users' wallet balances and/or win amounts
// const creatorUpdateData = {
//     wallet_balance: Math.max(0, creator.wallet_balance - gameExist.game_amount),
//     win_amount: Math.max(0, creator.win_amount - Math.max(0, gameExist.game_amount - creator.wallet_balance))
// };

// const acceptorUpdateData = {
//     wallet_balance: Math.max(0, acceptor.wallet_balance - gameExist.game_amount),
//     win_amount: Math.max(0, acceptor.win_amount - Math.max(0, gameExist.game_amount - acceptor.wallet_balance))
// };
// Old code
// // Check if both users have sufficient balance
// if (creator.wallet_balance >= gameExist.game_amount && acceptor.wallet_balance >= gameExist.game_amount) {
//     // Deduct the game amount from both users' wallet balances
//     const creatorAmountDebit = await ludoUser.findByIdAndUpdate(
//         gameExist.creator_id,
//         { $set: { wallet_balance: creator.wallet_balance - gameExist.game_amount } },
//         { new: true }
//     );

//     const acceptorAmountDebit = await ludoUser.findByIdAndUpdate(
//         gameExist.acceptor_id,
//         { $set: { wallet_balance: acceptor.wallet_balance - gameExist.game_amount } },
//         { new: true }
//     );

//     // Update the game status to "running" and set closing balances
//     const isGame = await ludoGame.findOneAndUpdate(
//         { _id: req.params.id, status: "requested", creator_id: req.user_id },
//         { $set: { status: "running", creator_closing_balance: creatorAmountDebit.wallet_balance + creatorAmountDebit.win_amount, acceptor_closing_balance: acceptorAmountDebit.wallet_balance + acceptorAmountDebit.win_amount } },
//         { new: true }
//     );

//     if (!isGame) {
//         // Handle the case where the game update fails
//         return errorResponse(res, 400, false, "Error", "Something went wrong, game not updated.")
//     } else {
//         // Successfully started the game
//         return successResponse(res, 200, true, "User game request started successfully", isGame)
//     }
// } else {
//     // Handle the case where one or both users have insufficient balance
//     return errorResponse(res, 400, false, "Error", "Insufficient balance.")
// }

// const calculateBalances = (user, gameAmount) => {
//     let newWalletBalance = Math.max(0, user.wallet_balance - gameAmount);
//     let remainingGameAmount = Math.max(0, gameAmount - user.wallet_balance);
//     let newWinAmount = Math.max(0, user.win_amount - remainingGameAmount);

//     return {
//         wallet_balance: newWalletBalance,
//         win_amount: newWinAmount
//     };
// };

// // Update the game status to "running" and set closing balances
// const isGame = await ludoGame.findOneAndUpdate(
//     { _id: req.params.id, status: "requested", creator_id: req.user_id },
//     { $set: { status: "running", creator_closing_balance: creatorAmountDebit.wallet_balance + creatorAmountDebit.win_amount, acceptor_closing_balance: acceptorAmountDebit.wallet_balance + acceptorAmountDebit.win_amount } },
//     { new: true });



// async function adminProfit(gameAmount, winID) {
//     const winner = await User.findById(winID);
//     const settings = await SiteSettings.findOne({});
//     let referralAmount = 0;
//     let referralPer = 0;
//     if (winner.referral) {
//         referralPer = 2;
//         const referralUser = await User.find({ referral_code: winner.referral });
//         const referralTxn = new ReferralHis();
//         referralTxn.referral_code = winner.referral;
//         referralTxn.earned_from = winID;
//         referralTxn.amount = gameAmount * ((settings.ReferencePercentage) / 100);
//         referralAmount = gameAmount * ((settings.ReferencePercentage) / 100);
//         referralUser[0].referral_earning += gameAmount * ((settings.ReferencePercentage) / 100);
//         referralUser[0].referral_wallet += gameAmount * ((settings.ReferencePercentage) / 100);
//         referralTxn.closing_balance = referralUser[0].referral_wallet;
//         await referralTxn.save();
//         await referralUser[0].save();
//     }
//     let profit = null;

//     console.log("++++++===UUUUUUUUUUUUUUUUUUUTTTTTTTTTTTTTTTTTTTTTTTTTTTtEEEEEEEEEEEEEEEEEEEEEEEwWWWWW", settings)
//     if (gameAmount >= 0 && gameAmount <= 100) {
//         profit = gameAmount * settings.commissionSettingOne / 100;
//         console.log("++++++===UUUUUUUUUUUUUUUUUUUTTTTTTTTTcommissionSettingOneTTTTTTTTTTTTTTTTTTtEEEEEEEEEEEEEEEEEEEEEEEwWWWWW", profit)
//     }
//     else if (gameAmount > 101 && gameAmount <= 200) {
//         profit = gameAmount * settings.commissionSettingTwo / 100;
//         console.log("++++++===UUUUUUUUUUUUUUUUUUUTTTTTTTTTcommissionSettingTwoTTTTTTTTTTTTTTTTTTtEEEEEEEEEEEEEEEEEEEEEEEwWWWWW", profit)
//     } else if (gameAmount > 201 && gameAmount <= 500) {
//         profit = gameAmount * settings.commissionSettingThree / 100;
//         console.log("++++++===UUUUUUUUUUUUUUUUUUUTTTTTTTTTcommissionSettingThreeTTTTTTTTTTTTTTTTTTtEEEEEEEEEEEEEEEEEEEEEEEwWWWWW", profit)
//     } else if (gameAmount > 500) {
//         profit = gameAmount * settings.commissionSettingFour / 100;
//         console.log("++++++===UUUUUUUUUUUUUUUUUUUTTTTTTTTTcommissionSettingFourTTTTTTTTTTTTTTTTTTtEEEEEEEEEEEEEEEEEEEEEEEwWWWWW", profit)

//     }
//     winner.wonAmount += (gameAmount - profit);
//     await winner.save();
//     let winnAmount = gameAmount - profit;
//     let earnAdmin = profit - referralAmount;

//     return { winnAmount: winnAmount, earnAdmin: earnAdmin };
// }