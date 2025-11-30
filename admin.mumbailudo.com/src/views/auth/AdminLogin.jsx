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
function AdminLogin() {
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
  

  return (
    <>
    <div className="h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="m-0 sm:m-10 bg-white bg-opacity-5 shadow sm:rounded-xl">
            <div className="xl:w-full p-6 sm:p-12">
            <div className="flex flex-col items-center">
                <h1 className="text-2xl xl:text-3xl font-extrabold mb-6">Admin Login</h1>
                <div className="flex justify-center items-center ">
                <div className="mx-auto">
                <form onSubmit={formik.handleSubmit}>
                      {/*  */}

                        <input id="phone_no" name='phone_no' onChange={formik.handleChange}
                        className={`w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.phone_no ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`}
                        type="text"
                        placeholder="Enter your phone no"
                        />
                        {formik.errors.phone_no && <div className="text-red-500 ">{formik.errors.phone_no}</div>}


                        <input id="password" name='password' onChange={formik.handleChange}
                        className={`mb-4 w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.password ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`}
                        type="password"
                        placeholder="Enter password"
                        />

                        {formik.errors.password && <div className="text-red-500 ">{formik.errors.password}</div>}

                        
 
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember_me"
                            name="remember_me"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-200">
                            Remember me
                          </label>
                        </div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                            Forgot your password?
                          </a>
                        </div>
                      </div>

                     
                      {/* Submit button */}
                    <button
                        type='submit'
                        className="mt-5 tracking-wide font-semibold bg-indigo-800 text-gray-100 w-full py-4 rounded-xl hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                        disabled={formik.isSubmitting} // Disable the button while submitting
                    >
                        {formik.isSubmitting ? (
                            // Show loading spinner if submitting
                            <span>Loading...</span>
                        ) : (
                            // Show "Login" text if not submitting
                            <span>Login</span>
                        )}
                  </button>
                </form>
                
                </div>
                </div>
            </div>
            
            </div>
        </div>
    </div>
    </>
  )
}

export default AdminLogin