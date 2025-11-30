import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from 'axios';
import { baseUrl } from '../../utils/APIRoutes';
import toast from 'react-hot-toast';
import socket from "../../utils/Socket";

const validationSchema = Yup.object({
  website_title: Yup.string().required('Website title is required'),
  support_number: Yup.string().required('Support number is required'),
  support_email: Yup.string().email('Invalid email address').required('Support email is required'),
  mantainence_mode: Yup.boolean(),
  admin_commission_one: Yup.number().required('Commission is required'),
  referral_commission: Yup.number().required('Referral commission is required'),
  // Add validation rules for other fields here
});

function SettingSite() {
  const breadcrumbItems = [
    { text: 'Dashboard', href: '/' },
    { text: 'Settings', href: '/' },
  ];

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
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred");
      } finally {
        setSubmitting(false);
      }
    },
  });


  // Handler to update settings by group (e.g., Payment Gateway, Commission, etc.)
  const handleSubmitGroup = async (group) => {
    let groupValues = {};

    // Extract values for the respective group
    switch (group) {
      case 'websiteInfo':
        groupValues = {
          // website_title: formik.values.website_title,
          // company_name: formik.values.company_name,
          // company_email: formik.values.company_email,
          // company_mobile: formik.values.company_mobile,
          // company_address: formik.values.company_address,
          // company_website: formik.values.company_website,
          // support_email: formik.values.support_email,
          whatsApp_number: formik.values.whatsApp_number,
          support_number: formik.values.support_number,
          // version: formik.values.version,
          message: formik.values.message,
        };
        break;
      case 'mantainece_mode':
        groupValues = {
          mantainece_mode: formik.values.mantainece_mode === true ? false : true,
        };
        break;
      default:
        return;
    }

    try {

      const response = await axios.post(
        baseUrl + "/admin/setting/create",
        groupValues,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        }
      );
      if (groupValues.mantainece_mode === true || groupValues.mantainece_mode === false) {
        // toast.success(response.data.message);
        socket.emit('socket-set-refresh');
      }
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.data || "An error occurred");
    }
  };


  useEffect(() => {
    fetchData();

    socket.connect();

    const handleGameCreation = (res) => {
      console.log(res)
    };

    socket.on('is-maintenance-mode', handleGameCreation);

    // Cleanup on component unmount
    return () => {
      socket.off('is-maintenance-mode', handleGameCreation); // Cleanup
      socket.disconnect(); // Optional: Disconnect if not needed further
    };
  }, []);

  return (
    <>
      <div className="p-5">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col px-5">
        <div className="overflow-x-auto pb-4 bg-white p-10 rounded-2xl mb-10">
          <div className="block">
            <form className="space-y-6">

              <div className='flex justify-between'>
                <h3 className="text-lg font-medium leading-6 text-indigo-600">Website Information</h3>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-indigo-600 mb-2">
                    {formik.values.mantainece_mode ? 'Maintenance Mode On' : 'Maintenance Mode Off'}
                  </h3>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleSubmitGroup("mantainece_mode")}
                    className={`w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white  focus:outline-none focus:ring-2 focus:ring-offset-2  ${formik.values.mantainece_mode ? 'bg-green-500' : 'bg-red-500'}`}
                    disabled={formik.isSubmitting || loading}
                  >
                    {loading ? 'Loading...' : formik.values.mantainece_mode ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>

              </div>
              {/* Website Information Group */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">


                {/* <div className="mb-1">
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
                  name="company_address"
                  value={formik.values.company_address}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.company_address && formik.touched.company_address && (
                  <p className="text-sm text-red-600">{formik.errors.company_address}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Company Mobile</label>
                <input
                  type="text"
                  name="company_mobile"
                  value={formik.values.company_mobile}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.company_mobile && formik.touched.company_mobile && (
                  <p className="text-sm text-red-600">{formik.errors.company_mobile}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Company Email</label>
                <input
                  type="email"
                  name="company_email"
                  value={formik.values.company_email}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.company_email && formik.touched.company_email && (
                  <p className="text-sm text-red-600">{formik.errors.company_email}</p>
                )}
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700">Company Website</label>
                <input
                  type="text"
                  name="company_website"
                  value={formik.values.company_website}
                  onChange={formik.handleChange}
                  className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                />
                {formik.errors.company_website && formik.touched.company_website && (
                  <p className="text-sm text-red-600">{formik.errors.company_website}</p>
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
              </div> */}

                <div className="mb-1">
                  <label className="block text-sm font-medium text-gray-700">Support 1</label>
                  <input
                    type="text"
                    name="support_number"
                    value={formik.values.support_number}
                    onChange={formik.handleChange}
                    className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                  />
                  {formik.errors.support_number && formik.touched.support_number && (
                    <p className="text-sm text-red-600">{formik.errors.support_number}</p>
                  )}
                </div>

                <div className="mb-1">
                  <label className="block text-sm font-medium text-gray-700">Support 2</label>
                  <input
                    type="text"
                    name="whatsApp_number"
                    value={formik.values.whatsApp_number}
                    onChange={formik.handleChange}
                    className="block w-full px-4 py-3 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                  />
                  {formik.errors.whatsApp_number && formik.touched.support_number && (
                    <p className="text-sm text-red-600">{formik.errors.whatsApp_number}</p>
                  )}
                </div>

                <div className="mb-1">
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    name="message"
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    rows={8}
                    className="block w-full px-4 py-4 rounded-xl font-medium bg-white bg-opacity-5 border placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-2"
                  />
                  {formik.errors.message && formik.touched.message && (
                    <p className="text-sm text-red-600">{formik.errors.message}</p>
                  )}
                </div>
              </div>

              {/* Update Button for Website Information */}
              <div>
                <button
                  type="button"
                  onClick={() => handleSubmitGroup('websiteInfo')}
                  className="w-full rounded-xl inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={formik.isSubmitting || loading}
                >
                  {formik.isSubmitting || loading ? 'Updating Website Info...' : 'Update Website Info'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingSite;
