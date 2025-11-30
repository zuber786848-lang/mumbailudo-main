import React, { useEffect, useState } from 'react'
import Breadcrumb from '../../components/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import axios from 'axios';
import { baseUrl } from '../../utils/APIRoutes';
import toast from 'react-hot-toast';
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone_no: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
  role: Yup.string().required('Role is required'),
  status: Yup.string().required('Status is required'),
});

function AdminCommission() {
  const breadcrumbItems = [
    { text: 'Dashboard', href: '/' },
    { text: 'Admin commission ', href: '/' },
  ];

  const [isModel, setModel] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this as needed
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalCommisson, setTotalCommisson] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await axios.get(`${baseUrl}/admin/game/commission/view?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        setLoading(false);
        setData(result?.data?.data?.commissionView);
        setTotalCommisson(result?.data?.data?.totalCommissionAmount);
        console.log(result?.data)
        setTotalDocs(result?.data?.data?.totalDocs || 0); // Set totalDocs from the response
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  // Calculate total pages
  const totalPages = Math.ceil(totalDocs / itemsPerPage);

  // Function to handle page change
const handlePageChange = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= totalPages) {
    setCurrentPage(pageNumber);
  }
};



  const formik = useFormik({
    initialValues: {
      name: "",
      phone_no: "",
      email: "",
      password: "",
      role: "",
      status: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post(baseUrl + "/admin/create-admin", values);
        toast.success(response.data.message);
      } catch (error) {
        console.error('Employee creation failed:', error);
        toast.error(error.response?.data?.message || "An error occurred");
      } finally {
        setSubmitting(false);
      }
    },
  });


  return (
    <>
    <div className="p-5">
      <Breadcrumb items={breadcrumbItems} />
    </div>
    <div
      className=" w-full lg:flex mt-8 lg:mt-0 item-center justify-between px-5 mb-4 "
      id="navbar-with-form"
    >
     
      <button
      type="button"
      className="py-2.5 pl-3.5 pr-6 text-sm bg-indigo-500 text-white rounded-xl cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 flex items-center hover:bg-indigo-700"
    >
      {"Total commission : "}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="mr-1 size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>

      <span className='font-extrabold text-3xl text-white'>{totalCommisson.toFixed(2)}{" "}</span>
    </button>
    </div> 

    <div className="flex flex-col px-5">
  <div className="overflow-x-auto pb-4">
    <div className="block">
      <div className="overflow-x-auto w-full border rounded-lg border-gray-300">
      <table className="w-full rounded-xl ">
                    <thead className=''>
                      <tr className="bg-gray-50">
                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize"
                        >
                          SNo.
                        </th>

                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize"
                        >
                          Game amount

                        </th>
                      
                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize"
                        >
                          Commission amount
                        </th>                        
                        
                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]"
                        >
                        Date
                        </th>
                        
                        
                        
                      </tr>
                    </thead>
                    {
                      data?.map((item, index) => (
                        <tbody className="divide-y divide-gray-300 text-start border">
                        <tr
                            key={item._id}
                            className="bg-white transition-all duration-500 hover:bg-gray-50"
                        >
                            <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                #{startIndex + index + 1}
                            </td>
                            <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                {item.game_amount
                                }
                            </td>
                            <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                {"₹ "}{item.commission_amount}
                            </td>
                                                    
                            <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                {new Date(item.createdAt).toLocaleString()}
                            </td>
               
                        </tr>
                    </tbody>
                      ))
                    }


                
                  </table>
          </div>

          <div className="pagination flex justify-end mt-4">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-2 border rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;

                  // Show first 3 pages, current page, last page, and ellipses
                  if (
                    pageNumber === 1 || 
                    pageNumber === 2 || 
                    pageNumber === 3 || 
                    pageNumber === totalPages || 
                    pageNumber === currentPage ||
                    pageNumber === currentPage - 1 || 
                    pageNumber === currentPage + 1
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`mx-1 px-3 py-2 border rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 || 
                    pageNumber === currentPage + 2
                  ) {
                    // Add ellipses between non-adjacent pages
                    return (
                      <span key={pageNumber} className="mx-1 px-3 py-2">
                        ...
                      </span>
                    );
                  }

                  return null; // Do not render buttons for hidden pages
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-2 border rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Next
                </button>
              </div>
         
        </div>
      </div>
    </div>

    {isModel ? (
      <div className="w-full fixed top-0 left-0 z-[100] ">
        <div
          id="pd-slide-down-modal"
          className="pd-overlay w-full h-full fixed top-0 left-0 z-[60] bg-black bg-opacity-50 flex justify-center items-start overflow-x-hidden overflow-y-auto"
        >
          <div className="transform -translate-y-3 ease-out sm:max-w-lg sm:w-full m-5 sm:mx-auto transition-all modal-open:translate-y-0 modal-open:opacity-100 modal-open:duration-500">
            <div className="flex flex-col bg-white rounded-2xl py-4 px-5">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h4 className="text-sm text-gray-900 font-medium">Filter</h4>
                <button
                  className="block cursor-pointer close-modal-button"
                  data-pd-overlay="#pd-slide-down-modal"
                  data-modal-target="pd-slide-down-modal"
                  onClick={() => setModel(false)}
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.75732 7.75739L16.2426 16.2427M16.2426 7.75739L7.75732 16.2427"
                      stroke="black"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto py-4 min-h-[100px]">
              
              <form onSubmit={formik.handleSubmit}>
      <div className="relative mb-6">
        <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
          Name
        </label>
        <input 
          id="name" 
          name='name' 
          onChange={formik.handleChange} 
          value={formik.values.name} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.name ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`} 
          type="text" 
          placeholder="Enter admin name" 
        />
      </div>
      
      <div className="relative mb-6">
        <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
          Phone Number
        </label>
        <input 
          id="phone_no" 
          name='phone_no' 
          onChange={formik.handleChange} 
          value={formik.values.phone_no} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.phone_no ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`} 
          type="number" 
          placeholder="Enter phone number" 
        />
      </div>

      <div className="relative mb-6">
        <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
          Email
        </label>
        <input 
          id="email" 
          name='email' 
          onChange={formik.handleChange} 
          value={formik.values.email} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.email ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`} 
          type="email" 
          placeholder="Enter email" 
        />
      </div>

      <div className="relative mb-6">
        <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
          Password
        </label>
        <input 
          id="password" 
          name='password' 
          onChange={formik.handleChange} 
          value={formik.values.password} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.password ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`} 
          type="password" 
          placeholder="Enter password" 
        />
      </div>

      <div className="relative mb-6">
        <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
          Role
        </label>
        <input 
          id="role" 
          name='role' 
          onChange={formik.handleChange} 
          value={formik.values.role} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.role ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`} 
          type="text" 
          placeholder="Enter role" 
        />
      </div>

      <div className="relative mb-6">
        <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
          Status
        </label>
        <input 
          id="status" 
          name='status' 
          onChange={formik.handleChange} 
          value={formik.values.status} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.status ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`} 
          type="text" 
          placeholder="Enter status" 
        />
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-4">
        <button
          type="button"
          className="py-2.5 px-5 text-xs bg-indigo-50 text-indigo-500 rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-indigo-100 close-modal-button"
          onClick={() => setModel(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-2.5 px-5 text-xs bg-indigo-500 text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-indigo-700 close-modal-button"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? (
            <span>Loading...</span>
          ) : (
            <span>Add</span>
          )}
        </button>
      </div>
    </form>
              </div>          
            </div>
          </div>
        </div>
      </div>
    ) : null}



    </>
  )
}

export default AdminCommission