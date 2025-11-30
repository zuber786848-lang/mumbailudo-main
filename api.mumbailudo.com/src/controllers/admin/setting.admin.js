const ludoSetting = require("../../models/ludo.admin.setting")
const { successResponse, errorResponse } = require("../../helper/status.response");
exports.ludoSetting = async (req, res) => {
    try {

        // Find the existing settings document
        const existingSetting = await ludoSetting.findOne();

        // Access the uploaded files via req.files
        const QRCode1 = req.files['qr_code_image_1'] ? req.files['qr_code_image_1'][0] : null;
        const QRCode2 = req.files['qr_code_image_2'] ? req.files['qr_code_image_2'][0] : null;
        // Prepare the update object
        let updateData = { ...req.body };

        // Add the file paths to the update data if the files are present
        if (QRCode1) {
            updateData.qr_code_image_1 = QRCode1.path; // Assuming 'path' contains the file location
        }
        if (QRCode2) {
            updateData.qr_code_image_2 = QRCode2.path;
        }
        let result;

        if (existingSetting) {
            // Update the existing document with the new fields
            result = await ludoSetting.updateOne(
                {},
                { $set: updateData },
                { new: true } // this option is specific to some ODMs like Mongoose; you may not need it
            );
        } else {
            // Create a new document if none exists
            result = await ludoSetting.create(updateData);
        }
        return successResponse(res, 201, true, "setting Update successfully", result)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}

exports.ludoSettingGet = async (req, res) => {
    try {
        const getSideSetting = await ludoSetting.findOne()
        return successResponse(res, 200, true, "side setting", getSideSetting)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 500, false, "Internal server error", error.message)
    }
}