import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import axios from 'axios';
import toast from 'react-hot-toast';
import { baseUrl, loginRoute } from '../../utils/APIRoutes';
import { useEffect } from 'react';

const validate = values => {
  const errors = {};

 
  if (!values.phone_no) {
    errors.phone_no = 'Required';
  } 
  if (!values.password) {
    errors.password = 'Required';
  }

  return errors;
};
function LoginWithOtpLess() {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: '',
      password:'',
    },
    validate,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Send a request to the server to authenticate the user
        const response = await axios.post(`${baseUrl}/admin/login`, {
          phone_no: values.phone_no,
          password: values.password,
        });

        console.log(response.data)
        const token = response.data.data

        // Store the token in localStorage
        localStorage.setItem('token', token);

      
        // Display success message
        toast.success(response.data.message);

        navigate("/")

      } catch (error) {
        // Handle any errors
        console.error('Login failed:', error);
        toast.error(error.response.data.message);
      } finally {
        // Reset the form's submitting state
        setSubmitting(false);
      }
    },
  });

  // useEffect(() => {
  //   window.otpless = (otplessUser) => {
  //     alert(JSON.stringify(otplessUser));
  //   };
  // }, []);

  // OTP-less callback function
  function handleOtpless(otplessUser) {
    const token = otplessUser.token;
    console.log('Token:', token);
    console.log('User Details:', JSON.stringify(otplessUser));

    // You can store the token or user details in your state or perform other actions
  }

  useEffect(() => {
    // Assign the callback function to the window object
    window.otpless = handleOtpless;
  }, []);
  

  return (
    <>
    
    <div className="h-screen bg-gray-900 text-white flex justify-center items-center">
        {/* OTP-less Login UI */}
      <div id="otpless-login-page"></div>
    </div>
    </>
  )
}

export default LoginWithOtpLess