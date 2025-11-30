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

function SettingCommission() {
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
      case 'commissionSettings':
        groupValues = {
          set_bonus_amount: formik.values.set_bonus_amount,
          referral_commission: formik.values.referral_commission,
          commission_101_200: formik.values.commission_101_200,
          commission_251_500: formik.values.commission_251_500,
          commission_501_10000: formik.values.commission_501_10000,
          commission_50_250: formik.values.commission_50_250,
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
            
            <h3 className="text-lg font-medium leading-6 text-indigo-700">Commission Settings</h3>

          {/* Commission Settings Group */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">SignUp Bonus Amount</label>
              <input
                type="number"
                name="set_bonus_amount"
                value={formik.values.set_bonus_amount}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.set_bonus_amount && formik.touched.set_bonus_amount && (
                <p className="text-sm text-red-600">{formik.errors.set_bonus_amount}</p>
              )}
            </div>
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
              <label className="block text-sm font-medium text-gray-700">Admin Commission</label>
              <input
                type="number"
                name="commission_101_200"
                value={formik.values.commission_101_200}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.commission_101_200 && formik.touched.commission_101_200 && (
                <p className="text-sm text-red-600">{formik.errors.commission_101_200}</p>
              )}
            </div>

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Commission (50-250)</label>
              <input
                type="number"
                name="commission_50_250"
                value={formik.values.commission_50_250}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.commission_50_250 && formik.touched.commission_50_250 && (
                <p className="text-sm text-red-600">{formik.errors.commission_50_250}</p>
              )}
            </div>

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Commission (251-500)</label>
              <input
                type="number"
                name="commission_251_500"
                value={formik.values.commission_251_500}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.commission_251_500 && formik.touched.commission_251_500 && (
                <p className="text-sm text-red-600">{formik.errors.commission_251_500}</p>
              )}
            </div>

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700">Commission (501-10000)</label>
              <input
                type="number"
                name="commission_501_10000"
                value={formik.values.commission_501_10000}
                onChange={formik.handleChange}
                className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
              />
              {formik.errors.commission_501_10000 && formik.touched.commission_501_10000 && (
                <p className="text-sm text-red-600">{formik.errors.commission_501_10000}</p>
              )}
            </div>

            
          </div>
          <button
              type="button"
              onClick={() => handleSubmitGroup('commissionSettings')}
              className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={formik.isSubmitting || loading}
            >
              {formik.isSubmitting || loading ? 'Updating Commission Settings...' : 'Update Commission Settings'}
            </button>

        
          </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingCommission;
