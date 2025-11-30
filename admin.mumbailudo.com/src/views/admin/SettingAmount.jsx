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

function SettingAmount() {
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


  return (
    <>
      <div className="p-5">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col px-5">
        <div className="overflow-x-auto pb-4 bg-white p-10 rounded-2xl mb-10">
          <div className="block">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
            

            <h3 className="text-lg font-medium leading-6 text-indigo-700">Amount Settings</h3>

                {/* Penalties and Withdraw Settings Group */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            

                <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700">Minimum  Game Amount</label>
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
                    <label className="block text-sm font-medium text-gray-700">Maximum Game Amount</label>
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
                    <label className="block text-sm font-medium text-gray-700">Minimum Withdrawal Amount</label>
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
                    <label className="block text-sm font-medium text-gray-700">Maximum Withdrawal Amount</label>
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
                    <label className="block text-sm font-medium text-gray-700">Minimum Deposit Amount</label>
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
                    <label className="block text-sm font-medium text-gray-700">Maximum Deposit Amount</label>
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
            // onClick={() => handleSubmitGroup('penaltiesAndWithdraw')}
            className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={formik.isSubmitting || loading}
            >
            {formik.isSubmitting || loading ? 'Updating  Settings...' : 'Update Amount Settings'}
            </button>
          </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingAmount;
