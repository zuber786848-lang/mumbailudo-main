// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useFormik } from 'formik';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { baseUrl } from '../../utils/APIRoutes';

// const validate = (values) => {
//   const errors = {};
//   if (!values.phone_no) {
//     errors.phone_no = 'Phone number is required';
//   } else if (!/^\d{10}$/.test(values.phone_no)) {
//     errors.phone_no = 'Phone number must be 10 digits';
//   }
//   if (values.otp && !/^\d{6}$/.test(values.otp)) {
//     errors.otp = 'OTP must be 6 digits';
//   }
//   return errors;
// };

// function Login() {
//   const [otpSent, setOtpSent] = useState(false);
//   const [resendEnabled, setResendEnabled] = useState(false);
//   const [requestId, setRequestId] = useState("");
//   const navigate = useNavigate();

//   const formik = useFormik({
//     initialValues: {
//       phone_no: '',
//       otp: '',
//     },
//     validate,
//     onSubmit: async (values, { setSubmitting }) => {
//       if (otpSent) {
//         try {
//           const response = await axios.post(`${baseUrl}/admin/login`, {
//             phone_no: values.phone_no,
//             otp: values.otp,
//             requestId: requestId
//           });

//           const token = response.data.data;
//           localStorage.setItem('token', token);
//           toast.success(response.data.message);
//           navigate("/");
//         } catch (error) {
//           console.error('Login failed:', error);
//           toast.error(error.response?.data?.message || 'Login failed');
//         } finally {
//           setSubmitting(false);
//         }
//       } else {
//         try {
//           const response = await axios.post(`${baseUrl}/admin/register`, {
//             phone_no: values.phone_no,
//           });

//           setRequestId(response.data.data.requestId);
//           toast.success(response.data.message);
//           setOtpSent(true);
//           // Enable resend after 30 seconds
//           setTimeout(() => setResendEnabled(true), 30000);
//         } catch (error) {
//           console.error('OTP send failed:', error);
//           toast.error(error.response?.data?.message || 'Failed to send OTP');
//         } finally {
//           setSubmitting(false);
//         }
//       }
//     },
//   });

//   const handleResendOTP = async () => {
//     if (!resendEnabled) return;
    
//     try {
//       const response = await axios.post(`${baseUrl}/admin/resend-otp`, {
//         phone_no: formik.values.phone_no,
//         requestId: requestId
//       });

//       setRequestId(response.data.data.requestId);
//       toast.success('OTP resent successfully');
//       setResendEnabled(false);
//       // Enable resend after 30 seconds
//       setTimeout(() => setResendEnabled(true), 30000);
//     } catch (error) {
//       console.error('Resend OTP failed:', error);
//       toast.error(error.response?.data?.message || 'Failed to resend OTP');
//     }
//   };

//   return (
//     <div className="h-screen bg-gray-900 text-white flex justify-center items-center">
//       <div className="m-0 sm:m-10 bg-white bg-opacity-5 shadow sm:rounded-xl">
//         <div className="xl:w-full p-6 sm:p-12">
//           <div className="flex flex-col items-center">
//             <h1 className="text-2xl xl:text-3xl font-extrabold mb-6">Admin Login</h1>
//             <div className="flex justify-center items-center ">
//               <div className="mx-auto">
//                 <form onSubmit={formik.handleSubmit}>
//                   <input
//                     id="phone_no"
//                     name="phone_no"
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     value={formik.values.phone_no}
//                     className={`w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${
//                       formik.touched.phone_no && formik.errors.phone_no ? "border-red-500" : "border-gray-300"
//                     } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`}
//                     type="tel"
//                     placeholder="Enter your phone number"
//                     disabled={otpSent}
//                   />
//                   {formik.touched.phone_no && formik.errors.phone_no && (
//                     <div className="text-red-500 text-sm mt-1">{formik.errors.phone_no}</div>
//                   )}

//                   {otpSent && (
//                     <input
//                       id="otp"
//                       name="otp"
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       value={formik.values.otp}
//                       className={`w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${
//                         formik.touched.otp && formik.errors.otp ? "border-red-500" : "border-gray-300"
//                       } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`}
//                       type="text"
//                       placeholder="Enter OTP"
//                     />
//                   )}
//                   {formik.touched.otp && formik.errors.otp && (
//                     <div className="text-red-500 text-sm mt-1">{formik.errors.otp}</div>
//                   )}

//                   <button
//                     type="submit"
//                     className="mt-5 tracking-wide font-semibold bg-indigo-800 text-gray-100 w-full py-4 rounded-xl hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
//                     disabled={formik.isSubmitting}
//                   >
//                     {formik.isSubmitting ? (
//                       <span>Loading...</span>
//                     ) : (
//                       <span>{otpSent ? 'Verify OTP' : 'Send OTP'}</span>
//                     )}
//                   </button>

//                   {otpSent && (
//                     <button
//                       type="button"
//                       onClick={handleResendOTP}
//                       className={`mt-3 text-sm ${
//                         resendEnabled ? 'text-blue-500 hover:text-blue-400' : 'text-gray-500 cursor-not-allowed'
//                       }`}
//                       disabled={!resendEnabled}
//                     >
//                       Resend OTP
//                     </button>
//                   )}
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;