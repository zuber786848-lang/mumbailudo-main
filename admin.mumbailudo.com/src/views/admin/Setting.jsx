import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from 'axios';
import { baseUrl } from '../../utils/APIRoutes';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  website_title: Yup.string().required('Website title is required'),
  support_number: Yup.string().required('Support number is required'),
  support_email: Yup.string().email('Invalid email address').required('Support email is required'),
  mantainence_mode: Yup.boolean(),
  admin_commission_one: Yup.number().required('Commission is required'),
  referral_commission: Yup.number().required('Referral commission is required'),
  // Add validation rules for other fields here
});

function Setting() {
  const breadcrumbItems = [
    { text: 'Dashboard', href: '/' },
    { text: 'Settings', href: '/' },
  ];

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
     
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post(
          baseUrl + "/admin/setting/create",
          values,  // Form data
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
          }
        );
        toast.success(response.data.message);
      } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred");
      } finally {
        setSubmitting(false);
      }
    },
  });
  


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await axios.get(`${baseUrl}/admin/setting/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
        setFormData(result?.data?.data); // Store data in state if needed
        console.log(result)
        formik.setValues(result?.data?.data); // Populate the form with fetched data
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, []);
  
  // Handler to update settings by group (e.g., Payment Gateway, Commission, etc.)
  const handleSubmitGroup = async (group) => {
    let groupValues = {};
  
    // Extract values for the respective group
    switch (group) {
      case 'paymentGateway':
        groupValues = {
          upi_payment_gateway_key: formik.values.upi_payment_gateway_key,
        };
        break;
      case 'commissionSettings':
        groupValues = {
          referral_commission: formik.values.referral_commission,
          commission_0_100: formik.values.commission_0_100,
          commission_101_200: formik.values.commission_101_200,
          commission_201_500: formik.values.commission_201_500,
          commission_500_10000: formik.values.commission_500_10000,
        };
        break;
      case 'penaltiesAndWithdraw':
        groupValues = {
          wrong_update_penalty: formik.values.wrong_update_penalty,
          no_update_penalty: formik.values.no_update_penalty,
          withdraw_time: formik.values.withdraw_time,
          minimum_withdrawal: formik.values.minimum_withdrawal,
          maximum_withdrawal: formik.values.maximum_withdrawal,
        };
        break;
      case 'upiIDs':
        groupValues = {
          upi_id_1: formik.values.upi_id_1,
          upi_id_2: formik.values.upi_id_2,
          upi_id_3: formik.values.upi_id_3,
          upi_id_4: formik.values.upi_id_4,
          upi_id_5: formik.values.upi_id_5,
        };
        break;
      case 'qrCodeImages':
        groupValues = {
          qr_code_image_1: formik.values.qr_code_image_1,
          qr_code_image_2: formik.values.qr_code_image_2,
        };
        break;
      default:
        return;
    }
  
    try {
      console.log(groupValues)
      const response = await axios.post(
        baseUrl + "/admin/setting/create", 
        groupValues, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.data || "An error occurred");
    }
  };

  return (
    <>
      <div className="p-5">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col px-5">
        <div className="overflow-x-auto pb-4 bg-white p-10 rounded-2xl mb-10">
          <div className="block">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-indigo-600">Website Information</h3>
            {/* Website Information Group */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
             
              
              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Website Title</label>
                <input
                  type="text"
                  name="website_title"
                  value={formik.values.website_title}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.website_title && formik.touched.website_title && (
                  <p className="text-sm text-red-600">{formik.errors.website_title}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formik.values.company_name}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.company_name && formik.touched.company_name && (
                  <p className="text-sm text-red-600">{formik.errors.company_name}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Company Address</label>
                <input
                  type="text"
                  name="commpany_address"
                  value={formik.values.commpany_address}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.commpany_address && formik.touched.commpany_address && (
                  <p className="text-sm text-red-600">{formik.errors.commpany_address}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Company Mobile</label>
                <input
                  type="text"
                  name="commpany_mobile"
                  value={formik.values.commpany_mobile}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.commpany_mobile && formik.touched.commpany_mobile && (
                  <p className="text-sm text-red-600">{formik.errors.commpany_mobile}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Company Email</label>
                <input
                  type="email"
                  name="commpany_email"
                  value={formik.values.commpany_email}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.commpany_email && formik.touched.commpany_email && (
                  <p className="text-sm text-red-600">{formik.errors.commpany_email}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Company Website</label>
                <input
                  type="text"
                  name="commpany_website"
                  value={formik.values.commpany_website}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.commpany_website && formik.touched.commpany_website && (
                  <p className="text-sm text-red-600">{formik.errors.commpany_website}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Version</label>
                <input
                  type="text"
                  name="version"
                  value={formik.values.version}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.version && formik.touched.version && (
                  <p className="text-sm text-red-600">{formik.errors.version}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  name="message"
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.message && formik.touched.message && (
                  <p className="text-sm text-red-600">{formik.errors.message}</p>
                )}
              </div>
            </div>

            {/* Update Button for Website Information */}
            <div>
              <button
                type="submit"
                onClick={() => handleSubmitGroup('websiteInfo')}
                className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={formik.isSubmitting || loading}
              >
                {formik.isSubmitting || loading ? 'Updating Website Info...' : 'Update Website Info'}
              </button>
            </div>


            <h3 className="text-lg font-medium leading-6 text-indigo-700">Payment Gateway</h3>
            {/* Payment Gateway Group */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">UPI Payment Gateway Key</label>
                <input
                  type="text"
                  name="upi_payment_gateway_key"
                  value={formik.values.upi_payment_gateway_key}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.upi_payment_gateway_key && formik.touched.upi_payment_gateway_key && (
                  <p className="text-sm text-red-600">{formik.errors.upi_payment_gateway_key}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">UPI ID 1</label>
                <input
                  type="text"
                  name="upi_id1"
                  value={formik.values.upi_id1}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.upi_id1 && formik.touched.upi_id1 && (
                  <p className="text-sm text-red-600">{formik.errors.upi_id1}</p>
                )}
              </div>

              {/* UPI ID 2-5 and QR Code Images */}
              {['upi_id2', 'upi_id3', 'upi_id4', 'upi_id5'].map((upi, index) => (
                <div className="mb-1" key={index}>
                  <label className="block text-sm font-medium text-gray-700">{`UPI ID ${index + 2}`}</label>
                  <input
                    type="text"
                    name={upi}
                    value={formik.values[upi]}
                    onChange={formik.handleChange}
                    className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                  />
                  {formik.errors[upi] && formik.touched[upi] && (
                    <p className="text-sm text-red-600">{formik.errors[upi]}</p>
                  )}
                </div>
              ))}

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Qr Code Image 1</label>
                <input
                  type="file"
                  name="qr_code_image_1"
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.qr_code_image_1 && formik.touched.qr_code_image_1 && (
                  <p className="text-sm text-red-600">{formik.errors.qr_code_image_1}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Qr Code Image 2</label>
                <input
                  type="file"
                  name="qr_code_image_2"
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.qr_code_image_2 && formik.touched.qr_code_image_2 && (
                  <p className="text-sm text-red-600">{formik.errors.qr_code_image_2}</p>
                )}
              </div>

             
            </div>

            {/* Update Button for Payment Gateway */}
            <div>
              <button
                type="button"
                onClick={() => handleSubmitGroup('paymentGateway')}
                className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={formik.isSubmitting || loading}
              >
                {formik.isSubmitting || loading ? 'Updating Payment Gateway...' : 'Update Payment Gateway'}
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
 

            <h3 className="text-lg font-medium leading-6 text-indigo-700">Commission Settings</h3>

          {/* Commission Settings Group */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Referral Commission</label>
              <input
                type="number"
                name="referral_commission"
                value={formik.values.referral_commission}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.referral_commission && formik.touched.referral_commission && (
                <p className="text-sm text-red-600">{formik.errors.referral_commission}</p>
              )}
            </div>

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Commission (0-100)</label>
              <input
                type="number"
                name="commission1"
                value={formik.values.commission1}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.commission1 && formik.touched.commission1 && (
                <p className="text-sm text-red-600">{formik.errors.commission1}</p>
              )}
            </div>

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Commission (101-200)</label>
              <input
                type="number"
                name="commission2"
                value={formik.values.commission2}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.commission2 && formik.touched.commission2 && (
                <p className="text-sm text-red-600">{formik.errors.commission2}</p>
              )}
            </div>

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Commission (201-500)</label>
              <input
                type="number"
                name="commission3"
                value={formik.values.commission3}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.commission3 && formik.touched.commission3 && (
                <p className="text-sm text-red-600">{formik.errors.commission3}</p>
              )}
            </div>

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Commission (500-10000)</label>
              <input
                type="number"
                name="commission4"
                value={formik.values.commission4}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.commission4 && formik.touched.commission4 && (
                <p className="text-sm text-red-600">{formik.errors.commission4}</p>
              )}
            </div>
          </div>
          <button
              type="submit"
              onClick={() => handleSubmitGroup('commissionSettings')}
              className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={formik.isSubmitting || loading}
            >
              {formik.isSubmitting || loading ? 'Updating Commission Settings...' : 'Update Commission Settings'}
            </button>

            <h3 className="text-lg font-medium leading-6 text-indigo-700">Penalties and Withdraw Settings</h3>

        {/* Penalties and Withdraw Settings Group */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
         

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">Wrong Update Penalty</label>
            <input
              type="number"
              name="wrong_update_penalty"
              value={formik.values.wrong_update_penalty}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.wrong_update_penalty && formik.touched.wrong_update_penalty && (
              <p className="text-sm text-red-600">{formik.errors.wrong_update_penalty}</p>
            )}
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">No Update Penalty</label>
            <input
              type="number"
              name="no_update_penalty"
              value={formik.values.no_update_penalty}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.no_update_penalty && formik.touched.no_update_penalty && (
              <p className="text-sm text-red-600">{formik.errors.no_update_penalty}</p>
            )}
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">Withdraw Time (In hours)</label>
            <input
              type="number"
              name="withdraw_time"
              value={formik.values.withdraw_time}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.withdraw_time && formik.touched.withdraw_time && (
              <p className="text-sm text-red-600">{formik.errors.withdraw_time}</p>
            )}
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">Minimum Game</label>
            <input
              type="number"
              name="minimum_game_amount"
              value={formik.values.minimum_game_amount}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.minimum_game_amount && formik.touched.minimum_game_amount && (
              <p className="text-sm text-red-600">{formik.errors.minimum_game_amount}</p>
            )}
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">Maximum Game</label>
            <input
              type="number"
              name="maximum_game_amount"
              value={formik.values.maximum_game_amount}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.maximum_game_amount && formik.touched.maximum_game_amount && (
              <p className="text-sm text-red-600">{formik.errors.maximum_game_amount}</p>
            )}
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">Minimum Withdrawal</label>
            <input
              type="number"
              name="minimum_withdrawal_amount"
              value={formik.values.minimum_withdrawal_amount}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.minimum_withdrawal_amount && formik.touched.minimum_withdrawal_amount && (
              <p className="text-sm text-red-600">{formik.errors.minimum_withdrawal_amount}</p>
            )}
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">Maximum Withdrawal</label>
            <input
              type="number"
              name="maximum_withdrawal_amount"
              value={formik.values.maximum_withdrawal_amount}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.maximum_withdrawal_amount && formik.touched.maximum_withdrawal_amount && (
              <p className="text-sm text-red-600">{formik.errors.maximum_withdrawal_amount}</p>
            )}
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">Minimum Deposit</label>
            <input
              type="number"
              name="minimum_deposit_amount"
              value={formik.values.minimum_deposit_amount}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.minimum_deposit_amount && formik.touched.minimum_deposit_amount && (
              <p className="text-sm text-red-600">{formik.errors.minimum_deposit_amount}</p>
            )}
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">Maximum Deposit</label>
            <input
              type="number"
              name="maximum_deposit_amount"
              value={formik.values.maximum_deposit_amount}
              onChange={formik.handleChange}
              className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
            />
            {formik.errors.maximum_deposit_amount && formik.touched.maximum_deposit_amount && (
              <p className="text-sm text-red-600">{formik.errors.maximum_deposit_amount}</p>
            )}
          </div>
        </div>
        <button
      type="submit"
      onClick={() => handleSubmitGroup('penaltiesAndWithdraw')}
      className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      disabled={formik.isSubmitting || loading}
    >
      {formik.isSubmitting || loading ? 'Updating Penalties and Withdraw Settings...' : 'Update Penalties and Withdraw Settings'}
    </button>
</form>

          </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Setting;
