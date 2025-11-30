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
});

function SettingPayment() {
  const breadcrumbItems = [
    { text: 'Dashboard', href: '/' },
    { text: 'Settings', href: '/' },
  ];

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      upi_id1: '',
      upi_id2: '',
      // upi_id3: '',
      // upi_id4: '',
      // upi_id5: '',
      qr_code_image_1: null,
      qr_code_image_2: null,
      bank_name: '',
      IFSC_code: '',
      account_holder_name: '',
      account_number: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        for (const key in values) {
          formData.append(key, values[key]);
        }

        const response = await axios.post(
          baseUrl + "/admin/setting/create",
          formData, // Form data with files
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`
            },
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

  async function fetchData() {
    setLoading(true);
    try {
      const result = await axios.get(`${baseUrl}/admin/setting/get`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      setFormData(result?.data?.data);
      formik.setValues(result?.data?.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitGroup = async (group) => {
    let groupValues = {};
    switch (group) {
      case 'upiIDs':
        groupValues = {
          upi_id1: formik.values.upi_id1,
          upi_id2: formik.values.upi_id2,
          // upi_id3: formik.values.upi_id3,
          // upi_id4: formik.values.upi_id4,
          // upi_id5: formik.values.upi_id5,
        };
        break;
      case 'qrCodeImages':
        groupValues = new FormData();
        groupValues.append('qr_code_image_1', formik.values.qr_code_image_1);
        groupValues.append('qr_code_image_2', formik.values.qr_code_image_2);
        break;
      case 'updateBankDetails':
        groupValues = {
          bank_name: formik.values.bank_name,
          IFSC_code: formik.values.IFSC_code,
          account_holder_name: formik.values.account_holder_name,
          account_number: formik.values.account_number,
        };
        break;
      default:
        return;
    }

    try {
      const response = await axios.post(
        baseUrl + "/admin/setting/create",
        groupValues instanceof FormData ? groupValues : JSON.stringify(groupValues), // Form data or JSON
        {
          headers: {
            'Content-Type': groupValues instanceof FormData ? 'multipart/form-data' : 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          },
        }
      );
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
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
              <h3 className="text-lg font-medium leading-6 text-indigo-700">Payment Setting</h3>

              {/* UPI IDs */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {['upi_id1', 'upi_id2'].map((upi, index) => (
                  <div className="mb-1" key={index}>
                    <label className="block text-sm font-medium text-gray-700">{`UPI ID ${index + 1}`}</label>
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
              </div>

              {/* Update Button for Payment Gateway */}
              <div>
                <button
                  type="button"
                  onClick={() => handleSubmitGroup('upiIDs')}
                  className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={formik.isSubmitting || loading}
                >
                  {formik.isSubmitting || loading ? 'Updating Payment Gateway...' : 'Update Payment Gateway'}
                </button>
              </div>

              <div className='xl:flex justify-around'>
                {/* QR Code Image 1 */}
                <div className="mb-1">
                  <label className="block text-sm font-medium text-gray-700">Qr Code Image 1</label>
                  <input
                    type="file"
                    name="qr_code_image_1"
                    onChange={(event) => formik.setFieldValue('qr_code_image_1', event.currentTarget.files[0])}
                    className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                  />
                  {formik.errors.qr_code_image_1 && formik.touched.qr_code_image_1 && (
                    <p className="text-sm text-red-600">{formik.errors.qr_code_image_1}</p>
                  )}

                  <div className="flex justify-end items-center gap-1 mt-3">
                    <img
                      className="w-[400px] h-[200px] border rounded-xl cursor-pointer"
                      src={`https://api.mumbailudo.com/${formik.values.qr_code_image_1}`}
                      alt="Qr code 1"

                    />
                  </div>
                </div>

                {/* QR Code Image 2 */}
                {/* <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Qr Code Image 2</label>
                <input
                  type="file"
                  name="qr_code_image_2"
                  onChange={(event) => formik.setFieldValue('qr_code_image_2', event.currentTarget.files[0])}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.qr_code_image_2 && formik.touched.qr_code_image_2 && (
                  <p className="text-sm text-red-600">{formik.errors.qr_code_image_2}</p>
                )}

                <div className="flex justify-end items-center gap-1 mt-3">
                        <img
                          className="w-[400px] h-[200px] border rounded-xl cursor-pointer"
                          src={`https://api.mumbailudo.com/${formik.values.qr_code_image_2}`}
                          alt="Qr code 2"

                        />
                      </div>
              </div> */}
              </div>

              {/* Update Button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleSubmitGroup('qrCodeImages')}
                  className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={formik.isSubmitting || loading}
                >
                  {formik.isSubmitting || loading ? 'Updating Payment QrCode...' : 'Update Payment QrCode'}
                </button>
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder_name"
                  value={formik.values.account_holder_name}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.account_holder_name && formik.touched.account_holder_name && (
                  <p className="text-sm text-red-600">{formik.errors.account_holder_name}</p>
                )}
              </div>
              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="number"
                  name="account_number"
                  value={formik.values.account_number}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.account_number && formik.touched.account_number && (
                  <p className="text-sm text-red-600">{formik.errors.account_number}</p>
                )}
              </div>
              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  type="text"
                  name="IFSC_code"
                  value={formik.values.IFSC_code}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.IFSC_code && formik.touched.IFSC_code && (
                  <p className="text-sm text-red-600">{formik.errors.IFSC_code}</p>
                )}
              </div>
              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formik.values.bank_name}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.bank_name && formik.touched.bank_name && (
                  <p className="text-sm text-red-600">{formik.errors.bank_name}</p>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleSubmitGroup('updateBankDetails')}
                  className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={formik.isSubmitting || loading}
                >
                  {formik.isSubmitting || loading ? 'Updating Payment Gateway...' : 'Update Payment Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingPayment;
