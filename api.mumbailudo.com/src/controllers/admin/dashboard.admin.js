const mongoose = require("mongoose")
const { errorResponse, successResponse } = require("../../helper/status.response");
const ludoUser = require("../../models/ludo.user");
const adminCommission = require("../../models/commison.admin")
const ludoTransaction = require("../../models/ludo.transaction");
const ludoGame = require("../../models/ludo.game")
const userKycDetail = require("../../models/ludo.kyc")
const { parseDateString } = require("../../helper/dateParsing");
// total active users
// exports.Users = async (req, res) => {
//     try {
//         const { block, deleted, active, name, phoneNo } = req.query;
//         const page = parseInt(req.query.page) || 1
//         const limit = parseInt(req.query.limit) || 5
//         if (active) {
//             const activeUsers = await ludoUser.find({ delete: false, block: false, is_user_verified: true }).skip((page - 1) * limit).limit(limit)
//             const totalDocs = await ludoUser.countDocuments({ delete: false, block: false, is_user_verified: true });

//             return successResponse(res, 200, true, "success", { activeUsers, totalDocs })
//         }
//         if (block) {
//             const blcokUsers = await ludoUser.find({ block: true }).skip((page - 1) * limit).limit(limit)
//             const totalDocs = await ludoUser.countDocuments({ block: true });

//             return successResponse(res, 200, true, "success", { blcokUsers, totalDocs })
//         }
//         if (deleted) {
//             const deleted = await ludoUser.find({ delete: true }).skip((page - 1) * limit).limit(limit)
//             const totalDocs = await ludoUser.countDocuments({ delete: true });

//             return successResponse(res, 200, true, "success", { deleted, totalDocs })
//         }
//         if (name && phoneNo) {
//             const searched = await ludoUser.find({
//                 $or: [
//                     { name: { $regex: name, $options: 'i' } },      // Search by name (case insensitive)
//                     { phone_no: { $regex: phoneNo, $options: 'i' } } // Search by phoneNo (case insensitive)
//                 ]
//             }).skip((page - 1) * limit).limit(limit);
//             const totalDocs = await ludoUser.countDocuments({
//                 $or: [
//                     { name: { $regex: name, $options: 'i' } },      // Search by name (case insensitive)
//                     { phone_no: { $regex: phoneNo, $options: 'i' } } // Search by phoneNo (case insensitive)
//                 ]
//             });

//             return successResponse(res, 200, true, "success", { searched, totalDocs })
//         }
//         if (name) {
//             // Find users matching the search criteria
//             const searched = await ludoUser.find({
//                 $or: [
//                     { name: { $regex: name, $options: 'i' } },      // Search by name (case insensitive)

//                 ]
//             }).skip((page - 1) * limit).limit(limit);


//             const totalDocs = await ludoUser.countDocuments({
//                 $or: [
//                     { name: { $regex: name, $options: 'i' } },      // Search by name (case insensitive)

//                 ]
//             });

//             return successResponse(res, 200, true, "success", { searched, totalDocs })
//         }
//         if (phoneNo) {
//             const searched = await ludoUser.find({
//                 $or: [
//                     { phone_no: { $regex: phoneNo, $options: 'i' } } // Search by phoneNo (case insensitive)    // Search by name (case insensitive)

//                 ]
//             }).skip((page - 1) * limit).limit(limit);
//             const totalDocs = await ludoUser.countDocuments({
//                 $or: [
//                     { phone_no: { $regex: phoneNo, $options: 'i' } } // Search by phoneNo (case insensitive)    // Search by name (case insensitive)

//                 ]
//             });

//             return successResponse(res, 200, true, "success", { searched, totalDocs })
//         }
//         else {
//             const AllUsers = await ludoUser.find().skip((page - 1) * limit).limit(limit)
//             const totalDocs = await ludoUser.countDocuments();

//             return successResponse(res, 200, true, "success", { AllUsers, totalDocs })
//         }
//     } catch (error) {
//         return errorResponse(res, 500, false, "Internal server error", error.message)
//     }
// }

// here all user details will show
exports.Users = async (req, res) => {
    try {
        const { block, deleted, active, name, phoneNo } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (active) {
            const activeUsers = await ludoUser
                .find({ delete: false, block: false, is_user_verified: true })
                .sort({ createdAt: -1 }) // Sort by the last document first
                .skip((page - 1) * limit)
                .limit(limit);
            const totalDocs = await ludoUser.countDocuments({ delete: false, block: false, is_user_verified: true });

            return successResponse(res, 200, true, "success", { activeUsers, totalDocs });
        }

        if (block) {
            const blockUsers = await ludoUser
                .find({ block: true })
                .sort({ createdAt: -1 }) // Sort by the last document first
                .skip((page - 1) * limit)
                .limit(limit);
            const totalDocs = await ludoUser.countDocuments({ block: true });

            return successResponse(res, 200, true, "success", { blockUsers, totalDocs });
        }

        if (deleted) {
            const deletedUsers = await ludoUser
                .find({ delete: true })
                .sort({ createdAt: -1 }) // Sort by the last document first
                .skip((page - 1) * limit)
                .limit(limit);
            const totalDocs = await ludoUser.countDocuments({ delete: true });

            return successResponse(res, 200, true, "success", { deletedUsers, totalDocs });
        }

        if (name && phoneNo) {
            const searchedUsers = await ludoUser
                .find({
                    $or: [
                        { name: { $regex: name, $options: 'i' } },       // Search by name (case insensitive)
                        { phone_no: { $regex: Number(phoneNo), $options: 'i' } } // Search by phone number (case insensitive)
                    ]
                })
                .sort({ createdAt: -1 }) // Sort by the last document first
                .skip((page - 1) * limit)
                .limit(limit);
            const totalDocs = await ludoUser.countDocuments({
                $or: [
                    { name: { $regex: name, $options: 'i' } },
                    { phone_no: { $regex: phoneNo, $options: 'i' } }
                ]
            });

            return successResponse(res, 200, true, "success", { searchedUsers, totalDocs });
        }


        if (name) {
            const searchedUsers = await ludoUser
                .find({ name: { $regex: name, $options: 'i' } })
                .sort({ _id: -1 }) // Sort by the last document first
                .skip((page - 1) * limit)
                .limit(limit);
            const totalDocs = await ludoUser.countDocuments({ name: { $regex: name, $options: 'i' } });

            return successResponse(res, 200, true, "success", { searchedUsers, totalDocs });
        }

        if (phoneNo) {
            try {
                const phoneNoAsNumber = parseInt(phoneNo, 10);
                if (isNaN(phoneNoAsNumber)) {
                    return successResponse(res, 400, false, "Invalid phone number format");
                }

                const searchedUsers = await ludoUser
                    .find({ phone_no: phoneNoAsNumber })
                    .sort({ _id: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit);

                const totalDocs = await ludoUser.countDocuments({ phone_no: phoneNoAsNumber });

                return successResponse(res, 200, true, "success", { searchedUsers, totalDocs });
            } catch (error) {
                console.error("Error fetching users:", error);
                return successResponse(res, 500, false, "Internal Server Error");
            }
        }



        // Default case: return all users, sorted by the last document first
        const allUsers = await ludoUser
            .find()
            .sort({ _id: -1 }) // Sort by the last document first
            .skip((page - 1) * limit)
            .limit(limit);
        const totalDocs = await ludoUser.countDocuments();

        return successResponse(res, 200, true, "success", { allUsers, totalDocs });

    } catch (error) {
        console.log(error.message)
        return errorResponse(res, 500, false, "Internal server error", error.message);

    }
};


// view particular user details by the admin
exports.viewUserDetail = async (req, res) => {
    try {
        const { userId } = req.query
        const userExist = await ludoUser.findById(userId)
        return successResponse(res, 200, true, "success", userExist)
    } catch (error) {
        return errorResponse(res, 500, false, "Error", error.message)
    }
}

// view particular user game history by the admin
exports.viewUserTransactionHistory = async (req, res) => {
    try {
        const { request_type, userId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Create a query object to conditionally filter by userId and status
        let query = { user_id: userId };
        if (request_type) {
            query.request_type = request_type;  // Add status to query if provided
        }
        // Find ludoTransaction with filters and apply pagination
        const transactions = await ludoTransaction.find(query).populate({ path: 'user_id', select: 'name phone_no' })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });  // Optional: Sort by creation date descending

        // Count total documents that match the query for pagination info
        const totalDocs = await ludoTransaction.countDocuments(query);

        return successResponse(res, 200, true, "success", { transactions, totalDocs });
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Error", error.message)
    }
}

// view  particular user full game history
exports.viewUserGameHistory = async (req, res) => {
    try {
        const { status, userId } = req.query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Create a query object to conditionally filter by userId, status, and request_type
        // Convert userId to ObjectId if provided
        let objectId = mongoose.Types.ObjectId(userId);

        // Create a query object to conditionally filter by userId and status
        let query = {
            $or: [
                { creator_id: objectId },
                { acceptor_id: objectId }
            ]
        };

        if (status) {
            query.status = status;  // Add status to query if provided
        }
        // console.log(query)
        // Query the game history with pagination, sorting, and filtering
        const userGameHistory = await ludoGame.find(query)
            .populate({ path: 'winner_id', select: 'name phone_no' })
            .populate({ path: 'luser_id', select: 'name phone_no' })
            .populate({ path: 'creator_id', select: 'name phone_no' })
            .populate({ path: 'acceptor_id', select: 'name phone_no' })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
        // Count total documents that match the query for pagination info
        const totalDocs = await ludoGame.countDocuments(query);

        return successResponse(res, 200, true, "success", { userGameHistory, totalDocs })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Error", error.message)
    }
}

// view particular user kyc detail
exports.viewUserKycDetail = async (req, res) => {
    try {
        const { userId } = req.query
        const kycDetails = await userKycDetail.find({ user_id: userId }).populate({ path: 'user_id', select: 'name phone_no' })
        return successResponse(res, 200, true, "success", kycDetails)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Error", error.message)
    }
}


// view total win amount, wallet amount, bonus amount, penalty amount Withdrawal amount deposit amount and also rejected approved pending amount
exports.totalUsers = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let matchStage = null;

        // Check if startDate and endDate are provided
        if (startDate && endDate) {
            const startDateS = parseDateString(startDate);
            const endDateS = parseDateString(endDate);
            // Set start of day for startDate (midnight UTC)
            startDateS.setUTCHours(0, 0, 0, 0);

            // Set end of day for endDate (last millisecond of the day UTC)
            endDateS.setUTCHours(23, 59, 59, 999);
            // console.log(startDateS)
            // console.log(endDateS)
            // Build the $match stage for date range
            matchStage = {
                $match: {
                    createdAt: {
                        $gte: startDateS,
                        $lte: endDateS
                    }
                }
            };
        }

        // MongoDB aggregation pipeline for ludoUser
        const userPipeline = [
            ...(matchStage ? [matchStage] : []),
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    totalActiveUser: { $sum: { $cond: [{ $eq: ["$is_user_verified", true] }, 1, 0] } },
                    totalBlockUser: { $sum: { $cond: [{ $eq: ["$block", true] }, 1, 0] } },
                    totalDeletedUser: { $sum: { $cond: [{ $eq: ["$delete", true] }, 1, 0] } },
                    winAmount: { $sum: "$win_amount" },
                    totalWinAmount: { $sum: "$total_win_amount" },
                    walletBalance: { $sum: "$wallet_balance" },
                    totalWithdrawalAmt: { $sum: "$total_withdrawal_amt" },
                    totalDepositAmt: { $sum: "$total_deposit_amt" },
                    bonusAmount: { $sum: "$bonus_amount" },
                    totalBonusAmt: { $sum: "$total_bonus_amount" },
                    totalPenalty: { $sum: "$total_penalty_amount" }
                }
            }
        ];

        const userAggregateResult = await ludoUser.aggregate(userPipeline);

        // MongoDB aggregation pipeline for ludo.transactions
        const transactionPipeline = [
            ...(matchStage ? [matchStage] : []),
            {
                $group: {
                    _id: null,
                    totalPendingDeposit: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$deposit_amount", 0] }
                    },
                    totalApprovedDeposit: {
                        $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$deposit_amount", 0] }
                    },
                    totalRejectedDeposit: {
                        $sum: { $cond: [{ $eq: ["$status", "rejected"] }, "$deposit_amount", 0] }
                    },
                    totalPendingWithdrawal: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$withdrawal_amount", 0] }
                    },
                    totalApprovedWithdrawal: {
                        $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$withdrawal_amount", 0] }
                    },
                    totalRejectedWithdrawal: {
                        $sum: { $cond: [{ $eq: ["$status", "rejected"] }, "$withdrawal_amount", 0] }
                    },
                }
            }
        ];
        const adminCommissionPipeline = [
            ...(matchStage ? [matchStage] : []),
            {
                $group: {
                    _id: null,
                    totalAdminCommissionAmt: { $sum: "$commission_amount" }
                }
            }
        ]
        const transactionAggregateResult = await ludoTransaction.aggregate(transactionPipeline);
        const adminCommissionResult = await adminCommission.aggregate(adminCommissionPipeline)

        const result = {
            ...userAggregateResult[0],
            ...transactionAggregateResult[0],
            ...adminCommissionResult[0]
        };

        return successResponse(res, 200, true, "success", result);

    } catch (error) {
        console.log(error);
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }

}