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
  password: Yup.string().required('Password is required'),
});

function Admin() {
  const breadcrumbItems = [
    { text: 'Dashboard', href: '/' },
    { text: 'Admin ', href: '/' },
  ];

  const [isModel, setModel] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this as needed
  const [totalDocs, setTotalDocs] = useState(0);

  async function fetchData() {
    setLoading(true);
    try {
      const result = await axios.get(`${baseUrl}/admin/all/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      setLoading(false);
      setData(result?.data?.data?.allAdmin);
      console.log(result?.data)
      setTotalDocs(result?.data?.data?.totalDocs || 0); // Set totalDocs from the response
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }


  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const formik = useFormik({
    initialValues: {
      name: "",
      phone_no: "",
      email: "admin@gmail.com+",
      password: "",
      role: "admin",
      status: "active",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post(baseUrl + "/admin/create/new/admin", values,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`
            }
          }
        );
       
        toast.success(response.data.message)
        fetchData();
        setModel(false)
       
      } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred");
      } finally {
        setSubmitting(false);
      }
    },
  });


  async function deleteAdmin(id) {
    setLoading(true);
    try {
      const result = await axios.delete(`${baseUrl}/admin/delete/admin/account/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      setLoading(false);
      toast.success(result.data.message)
      fetchData();
    } catch (e) {
      console.log(e);
      toast.error(e.message)
      setLoading(false);
    }
  }


    useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;


  // Calculate total pages
  const totalPages = Math.ceil(totalDocs / itemsPerPage);


  return (
    <>
    <div className="p-5">
      <Breadcrumb items={breadcrumbItems} />
    </div>
    <div
      className="w-full lg:flex mt-8 lg:mt-0 item-center justify-between px-5 mb-4 "
      id="navbar-with-form"
    >
      
      <button
      onClick={(e) => setModel(true)}
      type="button"
      className="py-2.5 pl-3.5 pr-6 text-sm bg-indigo-500 text-white rounded-xl cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 flex items-center hover:bg-indigo-700"
    >
      <svg
       className="mr-1"
       width={20}
       height={10}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.22229 5.00019H8.77785M5.00007 8.77797V1.22241"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      </svg>{" "}
      Add Admin{" "}
    </button>
    </div> 

    <div className="flex flex-col px-5">
  <div className="overflow-x-auto pb-4">
    <div className="block">
      <div className="overflow-x-auto w-full border rounded-lg border-gray-300">
      <table className="w-full rounded-xl">
                    <thead>
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
                          Name
                        </th>
                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize"
                        >
                          Phone no
                        </th>
                      
                        
                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]">
                            Password
                        </th>
                        
                        
                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]"
                        >
                        Date
                        </th>
                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]"
                        >
                        Type
                        </th>
                                               
                        <th
                          scope="col"
                          className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]"
                        >
                        Action
                        </th>
                        
                        
                      </tr>
                    </thead>
                    {
                      data?.map((item, index) => (
                        <tbody className="text-center divide-gray-300 border">
                        <tr
                            key={index+1}
                            className="bg-white transition-all duration-500 hover:bg-gray-50"
                        >
                            <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                {startIndex + index + 1}
                            </td>
                            <td className="p-2  whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                {item.name}
                            </td>
                            <td className="p-2  whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                {item.phone_no}
                            </td>
                            <td className="p-2  capitalize whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                {item.password}
                            </td>
                            
                            <td className="p-2  whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                {new Date(item.createdAt).toLocaleString()}
                            </td>

                            <td className="p-2  whitespace-nowrap text-sm leading-6 font-medium text-gray-900 capitalize">
                                {item.role}
                            </td>
                            
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                 
                    <div className="flex items-center gap-2">
                    <button 
                        onClick={() => deleteAdmin(item._id)} 
                        className="text-white bg-rose-500 py-2 px-3 rounded-xl"
                    >
                        Delete
                    </button>
                   
                </div>
                  

                </td>
                        </tr>
                    </tbody>
                      ))
                    }


                
                  </table>
          </div>

          <div className="pagination flex justify-end mt-4">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={startIndex + index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`mx-1 px-3 py-2 border rounded-md ${
                        currentPage === index + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {startIndex + index + 1}
                    </button>
                  ))}
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
                <h4 className="text-sm text-gray-900 font-medium">Add New Admin</h4>
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
              
              <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="relative mb-2">
        
        <input 
          id="name" 
          name='name' 
          onChange={formik.handleChange} 
          value={formik.values.name} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.name ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 `} 
          type="text" 
          placeholder="Enter admin name" 
        />
      </div>
      
      <div className="relative mb-2">
        <input 
          id="phone_no" 
          name='phone_no' 
          onChange={formik.handleChange} 
          value={formik.values.phone_no} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.phone_no ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 `} 
          type="number" 
          placeholder="Enter phone number" 
        />
      </div>


      <div className="relative mb-2">
       
        <input 
          id="password" 
          name='password' 
          onChange={formik.handleChange} 
          value={formik.values.password} 
          className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.password ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 `} 
          type="password" 
          placeholder="Enter password" 
        />
      </div>


      

      <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-4">
        <button
          type="button"
          className="py-2.5 px-5 text-xs bg-indigo-50 text-indigo-500 rounded-xl cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-indigo-100 close-modal-button"
          onClick={() => setModel(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-3 px-5 text-xs bg-indigo-500 text-white rounded-xl  cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-indigo-700 close-modal-button"
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

export default Admin