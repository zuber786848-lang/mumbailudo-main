require('dotenv').config();
const jwt = require('jsonwebtoken')
const moment = require('moment-timezone');
const { successResponse, errorResponse } = require("../../helper/status.response")
const { token } = require("../../helper/token.user")
const adminSetting = require("../../models/ludo.admin.setting")
const ludoTransaction = require('../../models/ludo.transaction');
const ludoUser = require('../../models/ludo.user');
const ludoGame = require("../../models/ludo.game");
const axios = require("axios")

let timeNow = Date.now();


let key = {
    orignal : "c2914105-2cda-4a67-b3d7-a318964f8dc2" , //orignal
    testing : "025b4f11-e433-426f-b4da-644c862f0cc7" , //testing
  }

const PaymentStatusMap = {
  PENDING: 0,
  SUCCESS: 1,
  CANCELLED: 2,
};

const PaymentMethodsMap = {
  UPI_GATEWAY: "upi_gateway",
  UPI_MANUAL: "upi_manual",
  USDT_MANUAL: "usdt_manual",
  WOW_PAY: "wow_pay",
  RS_PAY: "rs_pay",
  USDT: "usdt",
  UPAY: "upay",
};

const getCurrentTimeForTodayField = () => {
    return moment().format("YYYY-DD-MM h:mm:ss A");
  }

const getCurrentTimeForTimeField =  () => {
    return moment().valueOf();
  }
  const getDMYDateOfTodayFiled = (today) => {
    return moment(today, "YYYY-MM-DD h:mm:ss A").format("DD-MM-YYYY");
};


const getRechargeOrderId = () => {
    const date = new Date();
    let id_time =
      date.getUTCFullYear() +
      "" +
      date.getUTCMonth() +
      1 +
      "" +
      date.getUTCDate();
    let id_order =
      Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
      10000000000000;

    return id_time + id_order;
  };

exports.userDeposit = async (req, res) => {
    try {
        const { request_type, deposit_amount, transaction_id } = req.body;

        // Fetch admin settings
        const adminSettingExist = await adminSetting.findOne();
        const minimumDepositAmount = adminSettingExist?.minimum_deposit_amount || 50;
        const maximumDepositAmount = adminSettingExist?.maximum_deposit_amount || 20000;

        // Validate deposit amount
        if (deposit_amount < minimumDepositAmount) {
            return errorResponse(res, 400, false, `Minimum deposit is ${minimumDepositAmount} Rs.`);
        }
        if (deposit_amount > maximumDepositAmount) {
            return errorResponse(res, 400, false, `Maximum deposit is ${maximumDepositAmount} Rs.`);
        }

        // Find the user by ID
        const isUser = await ludoUser.findById(req.user_id);
        if (!isUser) {
            return errorResponse(res, 404, false, "User not found");
        }

        // Check for duplicate transaction ID
        const isTransactionIdMatched = await ludoTransaction.findOne({ transaction_id });
        if (isTransactionIdMatched) {
            return errorResponse(res, 400, false, "Duplicate transaction ID. Please provide a new transaction ID.");
        }

        // Create new deposit transaction
        const isDepositCreated = await ludoTransaction.create({
            user_id: req.user_id,
            request_type,
            transaction_id,
            deposit_amount
        });

        // Check if deposit transaction was successfully created
        if (!isDepositCreated) {
            return errorResponse(res, 400, false, "Deposit not processed. Something went wrong.");
        }

        // Return success response
        return successResponse(res, 201, true, "Deposit submitted successfully. Please wait for admin approval.", isDepositCreated);
    } catch (e) {
        console.error(e);
        return errorResponse(res, 500, false, "Internal server error");
    }
};
exports.userWithdrawal = async (req, res) => {
    try {
        const { withdrawal_amount, withdrawal_request_type, account_holder_name, IFSC_Code, account_number, UPI_ID } = req.body;

        // Fetch admin settings
        const adminSettingExist = await adminSetting.findOne();
        const maximumWithdrawalAmount = adminSettingExist?.maximum_withdrawal_amount || 20000;
        const minimumWithdrawalAmount = adminSettingExist?.minimum_withdrawal_amount || 300;

        // Withdrawal request interval in minutes
        const withdrawalRequestInterval = 60;

        // Validate withdrawal amount
        if (withdrawal_amount < minimumWithdrawalAmount) {
            return errorResponse(res, 400, false, `Minimum withdrawal is ${minimumWithdrawalAmount} Rs.`);
        }
        if (withdrawal_amount > maximumWithdrawalAmount) {
            return errorResponse(res, 400, false, `Maximum withdrawal is ${maximumWithdrawalAmount} Rs.`);
        }

        // Find the user by ID
        const isUser = await ludoUser.findById(req.user_id);
        if (!isUser) {
            return errorResponse(res, 404, false, "User not found");
        }

        // Check KYC status
        if (isUser.kyc_status === "pending") {
            return errorResponse(res, 400, false, "Please verify your KYC details");
        }
        if (isUser.kyc_status === "submitted") {
            return errorResponse(res, 400, false, "Please wait for KYC admin approval");
        }

        // Check wallet balance
        if (isUser.win_amount < withdrawal_amount) {
            return errorResponse(res, 400, false, "Insufficient win balance for withdrawal");
        }

        // Check if user has active games
        const gameExist = await ludoGame.findOne({
            $and: [
                { status: { $in: ["new", "running", "pending", "requested", "conflict"] } },
                { $or: [{ creator_id: req.user_id }, { acceptor_id: req.user_id }] }
            ]
        });
        if (gameExist) {
            return errorResponse(res, 400, false, "You can't withdraw while a game is running or created");
        }

        // Check last transaction time
        if (isUser.last_transaction_at) {
            const intervalAgo = moment().tz('Asia/Kolkata').subtract(withdrawalRequestInterval, 'minutes').valueOf();
            if (isUser.last_transaction_at > intervalAgo) {
                const nextAllowedTime = moment(isUser.last_transaction_at).tz('Asia/Kolkata').add(withdrawalRequestInterval, 'minutes').format('YYYY-MM-DD HH:mm:ss');
                return errorResponse(res, 400, false, `Please try again after ${nextAllowedTime}.`);
            }
        }

        // Update user withdrawal details
        if (withdrawal_request_type === "bank") {
            isUser.account_holder_name = account_holder_name;
            isUser.IFSC_Code = IFSC_Code;
            isUser.account_number = account_number;
        } else if (withdrawal_request_type === "UPI") {
            isUser.UPI_ID = UPI_ID;
        }

        // Deduct withdrawal amount and update last transaction time
        isUser.win_amount -= withdrawal_amount;
        isUser.last_transaction_at = moment().tz('Asia/Kolkata').valueOf();  // Use IST
        await isUser.save();

        // Create a new withdrawal transaction
        const isWithdrawalCreated = await ludoTransaction.create({
            user_id: req.user_id,
            withdrawal_request_type,
            request_type: req.body.request_type,
            withdrawal_amount
        });

        // Check if withdrawal transaction was successfully created
        if (!isWithdrawalCreated) {
            return errorResponse(res, 400, false, "Withdrawal not submitted. Something went wrong");
        }

        // Return success response
        return successResponse(res, 201, true, "Withdrawal request has been successfully submitted. Please wait for admin approval", isWithdrawalCreated);
    } catch (e) {
        console.error(e);
        return errorResponse(res, 500, false, "Internal server error");
    }
};
exports.userTransaction = async (req, res) => {
    try {

        // let isTransaction = await ludoTransaction.find({ user_id: req.user_id }).populate(["user_id"])

        // if (!isTransaction) {
        //     return errorResponse(res, 400, false, "Transaction not fetch Something went wrong!!!")
        // } else {
        //     return successResponse(res, 200, true, "Transaction fetch successfully.", isTransaction)
        // }

        const { request_type, status } = req.query;
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        let query = { user_id: req.user_id };
        if (request_type) query.request_type = request_type;

        // if (status) query.status = status;

        if (request_type == "all") {
            const requestGet = await ludoTransaction.find({ user_id: req.user_id }).populate({ path: "user_id", select: "name phone_no" }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
            const totalDocs = await ludoTransaction.countDocuments(query);

            return successResponse(res, 200, true, "success", { requestGet, totalDocs });
        }

        const requestGet = await ludoTransaction.find(query).populate({ path: "user_id", select: "name phone_no" }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        const totalDocs = await ludoTransaction.countDocuments(query);

        return successResponse(res, 200, true, "success", { requestGet, totalDocs });
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}
exports.redeemReferralCommission = async (req, res) => {
    try {
        const { redeemAmount } = req.body;
        const userExist = await ludoUser.findById(req.user_id);

        // Check if user exists
        if (!userExist) {
            return errorResponse(res, 400, false, "User does not exist.");
        }

        // Fetch admin settings for redeem limits
        const adminSettingExist = await adminSetting.findOne();
        if (!adminSettingExist) {
            return errorResponse(res, 500, false, "Admin settings not found.");
        }

        const minimumRedeemAmount = adminSettingExist.minimum_redeem_amount || 90; // Default to 50 if not set

        // Check if user is deleted
        if (userExist.delete === true) {
            return errorResponse(res, 400, false, "User has been deleted from our system.");
        }

        // Check if user is blocked
        if (userExist.block === true) {
            return errorResponse(res, 400, false, "User is blocked by the admin. Please contact the admin.");
        }

        // Check if referral amount is sufficient
        if (redeemAmount > userExist.referral_amount) {
            return errorResponse(res, 400, false, "Insufficient earning amount.");
        }

        // Ensure minimum redeem amount is met
        if (redeemAmount < minimumRedeemAmount) {
            return errorResponse(res, 400, false, `You can redeem an amount of ${minimumRedeemAmount} Rs or more.`);
        }

        // Update referral amount
        await ludoUser.findByIdAndUpdate(req.user_id, {
            $inc: {
                win_amount: redeemAmount,
                referral_amount: -redeemAmount,
                total_referral_amount: redeemAmount
            }
        });

        return successResponse(res, 200, true, "Amount redeemed successfully.");
    } catch (error) {
        console.log(error);
        return errorResponse(res, 500, false, "Internal server error", error.message);
    }
}

// UPI Gateway Payment Integration ------------
exports.initiateUPIPayment = async (req, res) => {
    const { money } = req.body;
    try {
        const user = await ludoUser.findById(req.user_id);
        // Check if user exists
        if (!user) {
            return errorResponse(res, 400, false, "User does not exist.");
        }

        const adminSettingExist = await adminSetting.findOne();
        const minimumDepositAmount = adminSettingExist?.minimum_deposit_amount || 50;
        const maximumDepositAmount = adminSettingExist?.maximum_deposit_amount || 20000;

        // Validate deposit amount
        if (money < minimumDepositAmount) {
            return errorResponse(res, 400, false, `Minimum deposit is ${minimumDepositAmount} Rs.`);
        }
        if (money > maximumDepositAmount) {
            return errorResponse(res, 400, false, `Maximum deposit is ${maximumDepositAmount} Rs.`);
        }

       await ludoTransaction.deleteMany({user_id: req.user_id, transaction_id: null, status: "pending"})
      const orderId = getRechargeOrderId();



      const ekqrResponse = await axios.post(
        "https://api.ekqr.in/api/create_order",
        {
          key: key.orignal,
          client_txn_id: orderId,
          amount: String(money),
          p_info: "normal payment",
          customer_name: user?.name,
          customer_email: "testing@gamil.com",
          customer_mobile: String(user?.phone_no),
          redirect_url: `https://mumbailudo.com/transaction-history`,
          udf1: "Mumbail ludo",
        },
      );

      const ekqrData = ekqrResponse?.data;

      if (ekqrData === undefined || ekqrData.status === false) {
        console.log(ekqrData)
        return errorResponse(res, 400, false, "Payment Service: Gateway error from ekqr!");
        // throw Error("Payment Service: Gateway error from ekqr!");
      }

       // Create new deposit transaction
       const isDepositCreated = await ludoTransaction.create({
        user_id: req.user_id,
        orderId: orderId,
        request_type : "deposit",
        transaction_id : null,
        deposit_amount: money,
        today: getCurrentTimeForTodayField(),
        url: ekqrData.data.payment_url,
        time: getCurrentTimeForTimeField(),
    });

      return res.status(200).json({
        status: true,
        message: "Payment Initiated successfully",
        data: isDepositCreated,
        urls: {
          web_url: ekqrData.data?.payment_url,
          bhim_link: ekqrData.data?.upi_intent?.bhim_link || "",
          phonepe_link: ekqrData.data?.upi_intent?.phonepe_link || "",
          paytm_link: ekqrData.data?.upi_intent?.paytm_link || "",
          gpay_link: ekqrData.data?.upi_intent?.gpay_link || "",
        },
        timeStamp: timeNow,
      });
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, false, "Internal server error", error.message);
    }
  };



  exports.verifyUPIPaymentWebhookURL = async (req, res) => {
    try {
        let { client_txn_id, status, amount, upi_txn_id, txnAt } = req.body; // Get data from request body

        if (!client_txn_id) {
            return res.status(400).json({
                message: `orderId is Required!`,
                status: false,
                timeStamp: new Date(),
            });
        }

        const recharge = await ludoTransaction.findOne({ orderId: client_txn_id });

        if (!recharge) {
            return res.status(400).json({
                message: `Unable to find recharge with this order id!`,
                status: false,
                timeStamp: new Date(),
            });
        }

        if (status === "success" && recharge.status === "pending") {
            const approvedDeposit = await ludoTransaction.findOneAndUpdate(
                { orderId: recharge.orderId },
                {
                    $set: {
                        status: "approved",
                        approved_at: Date.now(),
                        approved_by: recharge.user_id,
                        upi_txn_id: upi_txn_id, // Store transaction ID
                        txn_date: txnAt, // Store transaction date
                    }
                },
                { new: true }
            );

            if (!approvedDeposit) {
                return res.status(400).json({
                    status: false,
                    message: "Transaction is not completed"
                });
            }

            const userExist = await ludoUser.findById(approvedDeposit.user_id);
            await ludoUser.findOneAndUpdate(
                { _id: approvedDeposit.user_id, is_user_verified: true, delete: false, block: false },
                {
                    $set: {
                        wallet_balance: userExist.wallet_balance + approvedDeposit.deposit_amount,
                        total_deposit_amt: userExist.total_deposit_amt + approvedDeposit.deposit_amount
                    }
                }
            );

            return res.status(200).json({
                status: true,
                message: "Payment verified",
                timestamp: new Date()
            });
        }

        return res.status(200).json({
            status: false,
            message: "Payment not successful",
            timestamp: new Date()
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

exports.verifyUPIPayment = async (req, res) => {
    let orderId = req.query.client_txn_id;

    if (!orderId) {
      return res.status(400).json({
        message: `orderId is Required!`,
        status: false,
        timeStamp: timeNow,
      });
    }
    try {
       const recharge = await ludoTransaction.findOne({ orderId: orderId });

       console.log(recharge)

      if (!recharge) {
        return res.status(400).json({
          message: `Unable to find recharge with this order id!`,
          status: false,
          timeStamp: timeNow,
        });
      }

      console.log((recharge?.today))
      const ekqrResponse = await axios.post(
        "https://api.ekqr.in/api/check_order_status",
        {
          key: key.orignal,
          client_txn_id: orderId,
          txn_date: await getDMYDateOfTodayFiled(recharge?.today),
        },
      );

      const ekqrData = ekqrResponse?.data;

      if (ekqrData === undefined || ekqrData.status === false) {
        console.log(ekqrData)
        return errorResponse(res, 400, false, ekqrData.msg);
      }

      if (ekqrData.data.status === "created") {
        return res.status(200).json({
          message: "Your payment request is just created",
          status: false,
          timeStamp: timeNow,
        });
      }

      if (ekqrData.data.status === "scanning") {
        return res.status(200).json({
          message: "Waiting for confirmation",
          status: false,
          timeStamp: timeNow,
        });
      }

      if (ekqrData.data.status === "success") {
        if (
          recharge.status === "pending"
        ) {
            const approvedDeposit = await ludoTransaction.findOneAndUpdate({orderId: recharge.orderId},
                { $set: { status: "approved", approved_at: Date.now(), approved_by: recharge.user_id } },
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
        }

        // return res.status(200).json({
        //     status: true,
        //     message: "Payment verified",
        //     timestamp: timeNow
        // })
        return res.redirect("https://mumbailudo.com/transaction-history");
      }
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, false, "Internal server error");
    }
  };



