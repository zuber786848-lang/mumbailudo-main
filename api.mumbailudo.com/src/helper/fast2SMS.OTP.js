const axios = require('axios');
const jwt = require('jsonwebtoken'); // Ensure you have this installed

require('dotenv').config();

const sendOTPFast2SMS = async (mobileNumber, OTP) => {
    const options = {
        method: 'POST',
        url: 'https://www.fast2sms.com/dev/bulkV2',
        headers: {
            'authorization': process.env.SMS_KEY,
            'Content-Type': 'application/json'
        },
        data: {
            sender_id: 'FSTSMS',
            message: `Your OTP is ${OTP}`,
            language: 'english',
            route: 'p',
            numbers: mobileNumber
        }
    };

    try {
        let response = await axios(options);
        return response.data;
    } catch (error) {
        console.error('Error sending OTP:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error if needed
    }
};

module.exports = { sendOTPFast2SMS };
