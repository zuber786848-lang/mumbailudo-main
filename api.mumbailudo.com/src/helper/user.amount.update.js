const ludoUser = require("../models/ludo.user")
async function walletBalanceUpdate(user_id, amount) {
    const update = await ludoUser.findByIdAndUpdate(user_id, { $set: { win_amount: amount } })
}
async function winBalanceUpdate(user_id, amount) {

}
async function bonusBalanceUpdate(user_id, amount) {

}
async function referralBalanceUpdate(user_id, amount) {

}