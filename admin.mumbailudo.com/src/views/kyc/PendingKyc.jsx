import React, { useEffect, useState } from 'react'
import Breadcrumb from '../../components/Breadcrumb';
import { baseUrl } from '../../utils/APIRoutes';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Player from '../../components/Player';
import { Eye } from 'lucide-react';

function PendingKyc() {
  const breadcrumbItems = [
    { text: 'Dashboard', href: '/' },
    { text: 'Kyc', href: '/' },
    { text: 'Pending', href: '/' },
  ];

  const navigate = useNavigate();

  const [isModel, setModel] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this as needed
  const [totalDocs, setTotalDocs] = useState(0);

  async function fetchData() {
    setLoading(true);
    try {
      const result = await axios.get(`${baseUrl}/admin/kyc/view/details?status=pending&page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      setLoading(false);
      setData(result?.data?.data?.userKyc);
      console.log(result?.data?.data?.userKyc)
      setTotalDocs(result?.data?.data?.totalDocs || 0); // Set totalDocs from the response
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  useEffect(() => {
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


  async function approveRejectKyc(id, status) {
    setLoading(true);
    try {
      let url = `${baseUrl}/admin/kyc/update?kycId=${id}&status=${status}`;

      if (status === "rejected") {
        url = `${baseUrl}/admin/kyc/update?kycId=${id}&status=${status}`;
      }

      const result = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      fetchData(); s
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <div className="p-5">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div
        className="w-full lg:flex items-center justify-between px-5 mb-4"
        id="navbar-with-form"
      >
        <form className="flex justify-between items-center w-full space-x-2">
          <div className="relative w-full">
            <input
              type="search"
              id="default-search"
              className="block w-full px-4 py-2.5 text-sm font-normal shadow-xs text-gray-900 bg-white border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none leading-relaxed"
              placeholder="Search by phone number"
              required=""
            />
          </div>
          <button
            className="py-2 px-4 bg-indigo-500 hover:bg-blue-600 text-white rounded-xl"
            type="button"
            onClick={() =>
              searchPlayer(document.getElementById("default-search").value)
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21L18.5 18.5M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C13.2006 19 15.1937 18.1115 16.6401 16.6736C18.0976 15.2246 19 13.2177 19 11Z"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>
      </div>

      <div className="flex flex-col px-5">
        <div className=" overflow-x-auto pb-4">
          <div className="block">
            <div className="overflow-x-auto w-full  border rounded-xl border-gray-300">
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
                      className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]"
                    >
                      Addhar name
                    </th>
                    <th
                      scope="col"
                      className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]"
                    >
                      Addhar number
                    </th>
                    <th
                      scope="col"
                      className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]"
                    >
                      Addhar front
                    </th>
                    <th
                      scope="col"
                      className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]"
                    >
                      Addhar back
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
                      Status
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
                        key={item._id}
                        className="bg-white transition-all duration-500 hover:bg-gray-50"
                      >
                        <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td onClick={() => navigate(`/player/details/${item.user_id._id}`)} className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 hover:text-indigo-500 cursor-pointer">
                          {item.user_id.name}
                        </td>
                        <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          {item.user_id.phone_no}
                        </td>
                        <td className="p-2 capitalize whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          {item.aadhar_name}
                        </td>
                        <td className="p-2 capitalize whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          {item.aadhar_number}
                        </td>
                        <td className="p-2 capitalize whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          <img src={`https://api.mumbailudo.com/public/kyc/${item.aadhar_front}`} alt="Aadhaar Front" />
                        </td>
                        <td className="p-2 capitalize whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          <img src={`https://api.mumbailudo.com/public/kyc/${item.aadhar_back}`} alt="Aadhaar Back" />
                        </td>


                        <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p
                            className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${item.status === "approved"
                                ? 'bg-green-500 text-green-500'
                                : item.status === "rejected"
                                  ? 'bg-red-500 text-red-500'
                                  : 'bg-yellow-500 text-yellow-500'
                              }`}
                          >
                            {item.status}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          {
                            item.status === "approved"
                              ? null
                              : item.status === "rejected"
                                ? (<>
                                  <div className="flex items-center gap-2">
                                    {/* <button
                        onClick={() => approveRejectDeposit(item._id, "rejected")}
                        className="text-white bg-red-500 py-2 px-3 rounded-xl"
                    >
                        Reject
                    </button> */}

                                  </div>
                                </>)
                                : (<>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => approveRejectKyc(item._id, "rejected")}
                                      className="text-white bg-red-500 py-2 px-3 rounded-xl"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => approveRejectKyc(item._id, "approved")}
                                      className="text-white bg-green-500 py-2 px-3 rounded-xl"
                                    >
                                      Approve
                                    </button>
                                  </div>
                                </>)
                          }


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
                className={`mx-1 px-3 py-2 border rounded-md ${currentPage === 1
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
                      className={`mx-1 px-3 py-2 border rounded-md ${currentPage === pageNumber
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
                className={`mx-1 px-3 py-2 border rounded-md ${currentPage === totalPages
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
                  <h4 className="text-sm text-gray-900 font-medium">Add Add Employee</h4>
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
                  <form action="">
                    <div className="relative mb-6">
                      <label className="flex  items-center mb-2 text-gray-600 text-sm font-medium">
                        Add Employee Name{" "}
                        <svg
                          width={7}
                          height={7}
                          className="ml-1"
                          viewBox="0 0 7 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.11222 6.04545L3.20668 3.94744L1.43679 5.08594L0.894886 4.14134L2.77415 3.18182L0.894886 2.2223L1.43679 1.2777L3.20668 2.41619L3.11222 0.318182H4.19105L4.09659 2.41619L5.86648 1.2777L6.40838 2.2223L4.52912 3.18182L6.40838 4.14134L5.86648 5.08594L4.09659 3.94744L4.19105 6.04545H3.11222Z"
                            fill="#EF4444"
                          />
                        </svg>
                      </label>
                      <input
                        type="text"
                        id="default-search"
                        className="block w-full h-11 px-5 py-2.5 bg-white leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none "
                        placeholder=""
                        required=""
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
                        type="button"
                        className="py-2.5 px-5 text-xs bg-indigo-500 text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-indigo-700 close-modal-button"
                        onClick={() => setModel(false)}
                      >
                        Add
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

export default PendingKyc
