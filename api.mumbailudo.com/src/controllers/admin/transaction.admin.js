const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { successResponse, errorResponse } = require("../../helper/status.response");
const ludoTransaction = require('../../models/ludo.transaction');
const ludoUser = require("../../models/ludo.user");

// this api function can be use by only admin to  fetch all transaction using pagination
// exports.getTransaction = async (req, res) => {
//     try {
//         const { request_type, status } = req.query;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         // Constructing the query object
//         let query = {};
//         if (request_type) query.request_type = request_type;
//         if (status != "all"){
//             query.status = status; // Only add status if it's provided
//         } 

//         // Fetching data with pagination
//         const requestGet = await ludoTransaction.find(query)
//             .populate({ path: "user_id", select: "name phone_no account_holder_name IFSC_Code account_number UPI_ID" })
//             .sort({ createdAt: -1 })
//             .skip((page - 1) * limit)
//             .limit(limit);

//         // Getting the total number of documents
//         const totalDocs = await ludoTransaction.countDocuments(query);

//         // Sending the response
//         return successResponse(res, 200, true, "success", { requestGet, totalDocs });
//     } catch (error) {
//         console.log(error);
//         return errorResponse(res, 500, false, "Internal server error", error.message);
//     }
// };

exports.getTransaction = async (req, res) => {
    try {
        const { request_type, status, phone_no, transaction_id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Constructing the query object
        let query = {};
        if (request_type) query.request_type = request_type;
        if (status && status !== "all") query.status = status; // Only add status if it's not "all"

        // Handling transaction_id filter
        if (transaction_id) {
            if (transaction_id.length === 4) {
                // Filter by the last 4 digits
                query.transaction_id = { $regex: `${transaction_id}$`, $options: 'i' }; // Regex to match the last 4 digits
            } else {
                // Filter by the full transaction_id
                query.transaction_id = transaction_id;
            }
            console.log('Query with transaction_id:', query);
        }

        // Handling phone_no filter
        if (phone_no) {
            // Ensure phone_no is a number if it's stored as such in the database
            query['user_id.phone_no'] = phone_no;
        }

        // Fetching data with pagination
        const requestGet = await ludoTransaction.find(query)
            .populate({ path: "user_id", select: "name phone_no account_holder_name IFSC_Code account_number UPI_ID" })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Getting the total number of documents
        const totalDocs = await ludoTransaction.countDocuments(query);

        // Sending the response
        return successResponse(res, 200, true, "success", { requestGet, totalDocs });
    } catch (error) {
        console.log('Error:', error);
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
};





exports.depositApporved = async (req, res) => {
    try {
        const { _id } = req.body
        const approvedExist = await ludoTransaction.findById({ _id: _id })

        if (!approvedExist) {
            return successResponse(res, 400, false, "Error", "Transaction request not exist")
        }
        if (approvedExist.status == "approved") {
            return successResponse(res, 400, false, "Error", "Transaction approved already")
        }
        // if (approvedExist.status == "rejected") {
        //     return successResponse(res, 400, false, "Error", "Transaction rejected already")
        // }
        const approvedDeposit = await ludoTransaction.findByIdAndUpdate(_id,
            { $set: { status: "approved", approved_at: Date.now(), approved_by: req.user_id } },
            { new: true })
        if (!approvedDeposit) {
            return successResponse(res, 400, false, "Error", "Transaction is not completed")
        }
        const userExist = await ludoUser.findById(approvedDeposit.user_id)
        const updateUser = await ludoUser.findOneAndUpdate({ _id: approvedDeposit.user_id, is_user_verified: true, delete: false, block: false },
            {
                $set: {
                    wallet_balance: userExist.wallet_balance + approvedDeposit.deposit_amount, total_deposit_amt: userExist.total_deposit_amt + approvedDeposit.deposit_amount
                }
            })
        if (approvedDeposit && updateUser) {
            return successResponse(res, 200, true, "Transaction approved successfully", approvedDeposit)
        } else {
            return errorResponse(res, 400, false, "Error", "deposit approve is not completed")
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message);
    }

}

exports.depositRejected = async (req, res) => {
    try {
        const { _id, rejected_reason } = req.body

        const rejectedExist = await ludoTransaction.findById(_id)
        if (!rejectedExist) {
            return successResponse(res, 400, false, "Error", "Transaction request not exist")
        }
        if (rejectedExist.status == "rejected") {
            return successResponse(res, 400, false, "Error", "Transaction rejected already")
        }
        if (rejectedExist.status == "approved") {
            const userExist = await ludoUser.findById(rejectedExist.user_id);
            if (!userExist) {
                return errorResponse(res, 400, false, "Error", "user not exist");
            }

            let { wallet_balance, win_amount, total_bonus_amount, total_referral_amount, total_win_amount, total_deposit_amt } = userExist;

            let remainingPenalty = rejectedExist.deposit_amount;

            // Deduct from wallet_balance if it's available
            if (wallet_balance > 0) {
                const deductionFromWallet = Math.min(wallet_balance, remainingPenalty);
                wallet_balance -= deductionFromWallet;
                remainingPenalty -= deductionFromWallet;
                total_deposit_amt -= deductionFromWallet;
            }

            // Deduct from win_amount if it's available
            if (remainingPenalty > 0 && win_amount > 0) {
                const deductionFromWinAmount = Math.min(win_amount, remainingPenalty);
                win_amount -= deductionFromWinAmount;
                remainingPenalty -= deductionFromWinAmount;
                total_win_amount -= deductionFromWinAmount;
            }

            // Deduct from total_bonus_amount if it's available
            if (remainingPenalty > 0 && total_bonus_amount > 0) {
                const deductionFromBonus = Math.min(total_bonus_amount, remainingPenalty);
                total_bonus_amount -= deductionFromBonus;
                remainingPenalty -= deductionFromBonus;
            }

            // Deduct from total_referral_amount if it's available
            if (remainingPenalty > 0 && total_referral_amount > 0) {
                const deductionFromReferral = Math.min(total_referral_amount, remainingPenalty);
                total_referral_amount -= deductionFromReferral;
                remainingPenalty -= deductionFromReferral;
            }

            // Check if there is still remaining penalty amount that couldn't be deducted
            if (remainingPenalty > 0) {
                return errorResponse(res, 400, false, "Error", "Insufficient funds to apply the full penalty");
            }

            // Update the user document with the new values
            const updatedUser = await ludoUser.findByIdAndUpdate(
                rejectedExist.user_id,
                {
                    $inc: {
                        wallet_balance: wallet_balance - userExist.wallet_balance,
                        win_amount: win_amount - userExist.win_amount,
                        total_deposit_amt: total_deposit_amt - userExist.total_deposit_amt,
                        total_bonus_amount: total_bonus_amount - userExist.total_bonus_amount,
                        total_referral_amount: total_referral_amount - userExist.total_referral_amount,
                    }
                },
                { new: true }
            ).select({ phone_no: 0, password: 0 });
        }
        const rejectedTransaction = await ludoTransaction.findOneAndUpdate({ _id: _id },
            { $set: { status: "rejected", rejected_at: Date.now(), rejected_reason: rejected_reason, reject_by: req.user_id } },
            { new: true })
        if (rejectedTransaction) {
            // successResponse(res, 200, 'Success', 'Operation successful', { /* data */ });
            return successResponse(res, 200, true, "Transaction reject successfully", rejectedTransaction)
        } else {
            return errorResponse(res, 400, false, "Error", "transaction is not rejected")
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message);
        // return errorResponse(req, 500, false, error.message)
    }
}

exports.withdrawalApproved = async (req, res) => {
    try {
        const { _id } = req.body
        const approvedExist = await ludoTransaction.findById(_id)
        if (!approvedExist) {
            return errorResponse(res, 400, false, "Error", "Transaction request not exist")
        }
        if (approvedExist.status == "approved") {
            return errorResponse(res, 400, false, "Error", "Transaction approved already")
        }
        // if (approvedExist.status == "rejected") {
        //     return errorResponse(res, 400, false, "Error", "Transaction rejected already")
        // }
        // console.log(approvedExist)//withdrawal
        if (approvedExist.request_type != "withdrawal") {
            return errorResponse(res, 400, false, "Error", "request type is not matched")
        }
        const userExist = await ludoUser.findById(approvedExist.user_id)
        if (userExist.kyc_status == "pending" || userExist.kyc_status == "rejected") {
            return errorResponse(res, 400, false, "Error", "please verify user kyc or may be your kyc rejected")
        }
        if (userExist.kyc_status == "submited") {
            return errorResponse(res, 400, false, "Error", "you have submitted your kyc admin will verify")
        }
        const approvedWithdrawal = await ludoTransaction.findByIdAndUpdate(
            _id,
            { $set: { status: "approved", approved_at: Date.now(), approved_by: req.user_id } },
            { new: true } // This option returns the updated document
        );
        if (!approvedWithdrawal) {
            return errorResponse(res, 400, false, "Error", "Transaction is not completed")
        }
        const updateUser = await ludoUser.findByIdAndUpdate(
            approvedWithdrawal.user_id,
            { $set: { total_withdrawal_amt: userExist.total_withdrawal_amt + approvedWithdrawal.withdrawal_amount } },
            { new: true }
        );
        if (approvedWithdrawal && updateUser) {
            return successResponse(res, 200, true, "success", approvedWithdrawal)
        }
        else {
            return errorResponse(res, 400, false, "Error", "withdrawal approve is not completed")
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, 'Internal server error', error.message);
    }
}

exports.withdrawalRejected = async (req, res) => {
    try {
        const { _id, rejected_reason } = req.body
        const rejectedExist = await ludoTransaction.findById(_id)
        if (!rejectedExist) {
            return successResponse(res, 400, false, "Error", "Transaction request not exist")
        }
        if (rejectedExist.status == "rejected") {
            return successResponse(res, 400, false, "Error", "Transaction rejected already")
        }
        if (rejectedExist.request_type != "withdrawal") {
            return successResponse(res, 400, false, "Error", "request type is not matched")
        }
        const withdrawalRejected = await ludoTransaction.findByIdAndUpdate(_id, { $set: { rejected_reason: rejected_reason, status: "rejected", rejected_at: Date.now(), reject_by: req.user_id } }, { new: true })
        const userExist = await ludoUser.findById(withdrawalRejected.user_id)
        const updateWalletBalance = await ludoUser.findByIdAndUpdate(withdrawalRejected.user_id, { $set: { wallet_balance: userExist.wallet_balance + withdrawalRejected.withdrawal_amount } })
        return successResponse(res, 200, true, "success", withdrawalRejected)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

exports.transactionHistory = async (req, res) => {
    try {
        const { request_type, status } = req.query;
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        // console.log(request_type, status)
        let query = {};
        if (request_type) query.request_type = request_type;
        if (status) query.status = status;
        const history = await ludoTransaction.find(query).populate({ path: 'user_id', select: 'name phone_no' }).skip((page - 1) * limit).limit(limit);
        const totalDocs = await ludoTransaction.countDocuments(query);
        return successResponse(res, 200, false, "success", { history, totalDocs })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

// this api function can be use by only admin to give bonus amount for the particular user
exports.setBonusAmount = async (req, res) => {
    try {
        const { userId, bonus } = req.query
        const bonusAmount = parseInt(bonus)
        const userExist = await ludoUser.findById(userId);
        if (!userExist) {
            return errorResponse(res, 400, false, "Error", "user not exist")
        }
        if (userExist.delete == true) {
            return errorResponse(res, 400, false, "Error", "user is deleted")
        }
        if (userExist.block == true) {
            return errorResponse(res, 400, false, "Error", "user is blocked")
        }
        const addBonus = await ludoUser.findByIdAndUpdate(userId,
            {
                $inc: {
                    total_bonus_amount: bonusAmount,
                    wallet_balance: bonusAmount
                }
            }, { new: true }).select({ phone_no: 0, password: 0 });
        const isBonusCreated = await ludoTransaction.create({
            user_id: userExist._id, bonus_by: req.user_id, bonus_at: Date.now(), request_type: "bonus",
            status: "bonus", bonus_amount: bonusAmount
        })
        return successResponse(res, 200, true, "success", addBonus)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}


// this api function can be use by only admin to put penalty amount for the particular user
exports.penalty = async (req, res) => {
    try {

        const { userId } = req.query;
        const { penaltyAmount, penaltyReason } = req.body;

        const userExist = await ludoUser.findById(userId);
        if (!userExist) {
            return errorResponse(res, 400, false, "Error", "user not exist");
        }
        console.log(penaltyAmount)
        if (!penaltyAmount) {
            return errorResponse(res, 400, false, "Error", "penalty amount is required");
        }
        let { wallet_balance, win_amount, total_bonus_amount, total_referral_amount } = userExist;

        let remainingPenalty = penaltyAmount;

        // Deduct from wallet_balance if it's available
        if (wallet_balance > 0) {
            const deductionFromWallet = Math.min(wallet_balance, remainingPenalty);
            wallet_balance -= deductionFromWallet;
            remainingPenalty -= deductionFromWallet;
        }

        // Deduct from win_amount if it's available
        if (remainingPenalty > 0 && win_amount > 0) {
            const deductionFromWinAmount = Math.min(win_amount, remainingPenalty);
            win_amount -= deductionFromWinAmount;
            remainingPenalty -= deductionFromWinAmount;
        }

        // Deduct from total_bonus_amount if it's available
        if (remainingPenalty > 0 && total_bonus_amount > 0) {
            const deductionFromBonus = Math.min(total_bonus_amount, remainingPenalty);
            total_bonus_amount -= deductionFromBonus;
            remainingPenalty -= deductionFromBonus;
        }

        // Deduct from total_referral_amount if it's available
        if (remainingPenalty > 0 && total_referral_amount > 0) {
            const deductionFromReferral = Math.min(total_referral_amount, remainingPenalty);
            total_referral_amount -= deductionFromReferral;
            remainingPenalty -= deductionFromReferral;
        }

        // Check if there is still remaining penalty amount that couldn't be deducted
        if (remainingPenalty > 0) {
            return errorResponse(res, 400, false, "Error", "Insufficient funds to apply the full penalty");
        }

        // Update the user document with the new values
        const updatedUser = await ludoUser.findByIdAndUpdate(
            userId,
            {
                $set: { penalty_reason: penaltyReason },
                $inc: {
                    wallet_balance: wallet_balance - userExist.wallet_balance,
                    win_amount: win_amount - userExist.win_amount,
                    total_bonus_amount: total_bonus_amount - userExist.total_bonus_amount,
                    total_referral_amount: total_referral_amount - userExist.total_referral_amount,
                    total_penalty_amount: penaltyAmount
                }
            },
            { new: true }
        ).select({ phone_no: 0, password: 0 });

        if (updatedUser) {
            const isPenaltyCreated = await ludoTransaction.create({
                user_id: userExist._id, penalty_by: req.user_id, penalty_at: Date.now(), request_type: "penalty",
                status: "penalty", penalty_reason: penaltyReason, penalty_amount: penaltyAmount
            })
        }
        return successResponse(res, 200, true, "success", updatedUser);

    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

// this api function can be use by only admin to give refferal amount for the particular user
exports.setRefferalAmount = async (req, res) => {
    try {
        const { userId, refferalAmount } = req.query
        const bonusParse = parseInt(bonus)
        const userExist = await ludoUser.findById(userId);
        const referralAmount = await ludoUser.find()
        // Check if the user is deleted
        if (userExist.delete === true) {
            return errorResponse(res, 400, false, "Error", "User is deleted");
        }
        // Check if the user is blocked
        if (userExist.block === true) {
            return errorResponse(res, 400, false, "Error", "user is blocked")
        }
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}