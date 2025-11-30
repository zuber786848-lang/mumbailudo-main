const ludoUser = require("../models/ludo.user");
const ludoCommissionAdmin = require("../models/commison.admin")
const referralCommision = require("../models/refferal.commision")
const commissionPercentage = require("../models/ludo.admin.setting")

async function adminCommission(game_id, creator_id, acceptor_id, game_amount) {
    try {
        // Fetch commission percentage
        const commissionPercent = await commissionPercentage.findOne();
        const winnerDetail = await ludoUser.findById(creator_id);
        let referralCommissionAmount = 0;
        if (winnerDetail.referred_by) {
            const referred_by_id = await checkReferral(winnerDetail.referred_by)
            if (!referred_by_id) {
                referralCommissionAmount = 0;
            }
            referralCommissionAmount = await referralCommission(game_id, referred_by_id, creator_id, acceptor_id, game_amount)
        }
        // Determine the percentage to use
        let commissionAmount = null //
        // if (game_amount >= 50 && game_amount <= 300) {
        //     const percentage = commissionPercent ? commissionPercent.admin_commission_one : 5;
        //     commissionAmount = (game_amount * 2) * percentage / 100;
        // } else if (game_amount >= 301 && game_amount <= 600) {
        //     const percentage = commissionPercent ? commissionPercent.admin_commission_two : 4.5;
        //     commissionAmount = (game_amount * 2) * percentage / 100;
        // } else if (game_amount >= 601 && game_amount <= 999) {
        //     const percentage = commissionPercent ? commissionPercent.admin_commission_three : 4;
        //     commissionAmount = (game_amount * 2) * percentage / 100;
        // } else {
        //     const percentage = commissionPercent ? commissionPercent.admin_commission_four : 3;
        //     commissionAmount = (game_amount * 2) * percentage / 100;
        // }

        // if (game_amount >= 50 && game_amount <= 100) {
        //     const percentage = commissionPercent ? commissionPercent.commission_50_100 : 5;
        //     commissionAmount = (game_amount) * percentage / 100;
        // } else if (game_amount >= 101 && game_amount <= 200) {
        //     const percentage = commissionPercent ? commissionPercent.commission_101_200 : 4.5;
        //     commissionAmount = (game_amount) * percentage / 100;
        // } else if (game_amount >= 201 && game_amount <= 500) {
        //     const percentage = commissionPercent ? commissionPercent.commission_201_500 : 4;
        //     commissionAmount = (game_amount) * percentage / 100;
        // } else {
        //     const percentage = commissionPercent ? commissionPercent.commission_501_10000 : 3;
        //     commissionAmount = (game_amount) * percentage / 100;
        // }
        if (game_amount >= 50 && game_amount <= 250) {
            const percentage = commissionPercent ? commissionPercent.commission_50_250 : 5;
            commissionAmount = (game_amount) * percentage / 100;
        } else if (game_amount >= 251 && game_amount <= 500) {
            const percentage = commissionPercent ? commissionPercent.commission_251_500 : 5;
            commissionAmount = (game_amount) * percentage / 100;
        } else {
            const percentage = commissionPercent ? commissionPercent.commission_501_10000 : 5;
            commissionAmount = (game_amount) * percentage / 100;
        }
        // console.log("commission amount ", commissionAmount)
        // console.log("referral commission amount ", referralCommissionAmount)
        const totalAdminProfit = commissionAmount - referralCommissionAmount
        await ludoCommissionAdmin.create({
            game_id: game_id,
            game_amount: game_amount,
            commission_amount: totalAdminProfit,
            winner_id: creator_id,
            loser_id: acceptor_id
        });

        // Return the winning amount
        return game_amount - commissionAmount;
    } catch (error) {
        console.error("Error processing admin commission:", error);
        throw error; // Rethrow or handle as needed
    }
}


async function referralCommission(game_id, referral_id, creator_id, acceptor_id, game_amount) {
    try {
        // Fetch commission percentage
        const commissionPercent = await commissionPercentage.findOne();
        const percentage = commissionPercent ? commissionPercent.referral_commission : 1;

        // Calculate referral commission
        const referralCommission = game_amount * percentage / 100;

        // Update the referral user's amount
        const referralAmount = await ludoUser.findByIdAndUpdate(referral_id, {
            $inc: {
                // total_referral_amount: referralCommission,
                // win_amount: referralCommission
                // total_referral_amount: referralCommission,
                referral_amount: referralCommission,
            }
        }, { new: true });

        // Log the commission details
        await referralCommision.create({
            game_id: game_id,
            game_amount: game_amount,
            referral_commission_amount: referralCommission,
            winner_id: creator_id,
            loser_id: acceptor_id,
            referral_id: referral_id
        });

        // Return the adjusted game amount
        return referralCommission;
    } catch (error) {
        console.error("Error processing referral commission:", error);
        throw error; // Rethrow or handle as needed
    }
}

async function checkReferral(referred_by) {
    // Find the user who referred the current user
    const referralUser = await ludoUser.findOne({ referral_code: referred_by });
    if (!referralUser) {
        return false;
    }

    // Check if the referral user is deleted or blocked
    if (referralUser.delete || referralUser.block) {
        return false;
    }

    // Return the referral user's ID if all checks pass
    return referralUser._id;
}

module.exports = { adminCommission }