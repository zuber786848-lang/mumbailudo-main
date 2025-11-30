const ludoUser = require("../models/ludo.user");
const { errorResponse } = require("./status.response");
const jwt = require("jsonwebtoken");

// exports.verifyJwtToken = async (res, token) => {
//     try {
//         if (!token) {
//             return errorResponse(res, 401, false, "Access denied. No token provided.")
//         }
//         let { userId } = jwt.verify(token, process.env.TOKEN_SECRET);

//         let isUserExist = await ludoUser.findOne({ _id: userId })

//         if (!isUserExist) {
//             return errorResponse(res, 404, false, "User not exist in out system")
//         } else {
//             return userId
//         }

//     } catch (e) {
//         return errorResponse(res, 500, false, e.message)
//     }

// };

exports.token = async (user) => {
    try {
        const token = jwt.sign({

            _id: user._id,

            iat: new Date().getTime(),

            exp: Math.floor(Date.now() / 1000) + 360 * 60 * 60

        }, process.env.TOKEN_SECRET)

        // console.log(token)

        return token
    } catch (error) {

        console.log(error)

        return errorResponse(500, false, error.message)
    }

}

// for admin to generate the token
exports.admin_token = async (user) => {
    try {
        const token = jwt.sign({

            _id: user._id,

            iat: new Date().getTime(),

            exp: Math.floor(Date.now() / 1000) + 360 * 60 * 60

        }, "KingKGN@BNG%12")

        // console.log(token)

        return token
    } catch (error) {

        console.log(error)

        return errorResponse(500, false, error.message)
    }

}
