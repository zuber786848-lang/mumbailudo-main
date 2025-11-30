require('dotenv').config();

const sendOTPLessSMS = async (phone_no) => {
    try {
        const options = {
            method: 'POST',
            headers: {
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: "+91" + phone_no,  // no need to use ${ } inside JSON.stringify
                expiry: 600,
                otpLength: 6,
                channels: ["SMS"],
                metaData: { key1: "Data1", key2: "Data2" }
            })
        };

        const response = await fetch('https://auth.otpless.app/auth/v1/initiate/otp', options);
        const data = await response.json();

        // console.log(data);
        return data  // Return data in response to client

    } catch (error) {
        console.error('Error sending OTP:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error if needed // Send error response to client
    }
}

const verifyOTPLess = async (requestId, otp) => {
    try {
        console.log("requestId ", requestId, "otp ", otp)
        const options = {
            method: 'POST',
            headers: {
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requestId: requestId,
                otp: otp,
            })
        };

        const response = await fetch('https://auth.otpless.app/auth/v1/verify/otp', options);
        const data = await response.json();

        // console.log(data);
        return data;
    } catch (error) {
        console.error('Error sending OTP:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error if needed // Send error response to client
    }
}

module.exports = { sendOTPLessSMS, verifyOTPLess }