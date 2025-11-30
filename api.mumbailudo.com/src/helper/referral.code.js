const ludoUser = require('../models/ludo.user');

// Generate unique referral code
async function generateUniqueReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referral_code;
    let codeExists = true;

    while (codeExists) {
        referral_code = '';
        for (let i = 0; i < 8; i++) {
            referral_code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if referral code already exists in the database
        try {
            codeExists = await ludoUser.findOne({ referral_code }).exec();
        } catch (err) {
            console.error('Error checking referral code:', err);
            throw new Error('Database error occurred while checking referral code.');
        }

        // If code does not exist, exit loop
        codeExists = codeExists !== null;
    }

    return referral_code;
}

module.exports = { generateUniqueReferralCode };
