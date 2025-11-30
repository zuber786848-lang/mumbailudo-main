import React, { useEffect, useState } from 'react'
import Breadcrumb from '../../components/Breadcrumb';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import axios from 'axios';
import { baseUrl } from '../../utils/APIRoutes';
import toast from 'react-hot-toast';
import moment from 'moment-timezone';


const validate = values => {
  const errors = {};


  if (!values.department_name) {
    errors.department_name = 'Required';
  }

  return errors;
};

function GameDetails() {
  const breadcrumbItems = [
    { text: 'Dashboard', href: '/' },
    { text: 'Game', href: '/' },
  ];

  const [isModel, setModel] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  let params = useParams();
  const navigate = useNavigate();

  async function fetchData() {
    setLoading(true);
    try {
      const result = await axios.get(`${baseUrl}/admin/game/view/detail?gameId=${params.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      setLoading(false);
      setData(result?.data?.data?.games);
      console.log(result?.data?.data?.games)

    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }


  async function handelResult(status, winnerId) {
    setLoading(true);
    try {
      let url = `${baseUrl}/admin/game/conflict/game/resolve?gameId=${params.id}&status=${status}`;
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      };

      // Add winnerId to the URL if status is "win"
      if (status === "win") {
        url += `&winnerId=${winnerId}`;
      }

      const result = await axios.post(url, {}, { headers });

      if (result.data.status) {
        fetchData(); // Call the fetch function on success
        toast.success(result.data.message);
      } else {
        toast.error(result.data.message);
      }

    } catch (e) {
      console.log(e);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false); // Always stop the loading spinner
    }
  }


  useEffect(() => {
    fetchData();
  }, []);

  const [isModalOpenCreator, setIsModalOpenCreator] = useState(false);
  const [isModalOpenAcceptor, setIsModalOpenAcceptor] = useState(false);

  const handleImageClickCreator = () => {
    setIsModalOpenCreator(true);
  };

  const closeModalCreator = () => {
    setIsModalOpenCreator(false);
  };
  const handleImageClickAcceptor = () => {
    setIsModalOpenAcceptor(true);
  };

  const closeModalAcceptor = () => {
    setIsModalOpenAcceptor(false);
  };



  return (
    <>
      <div className="p-5">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div
        className="w-full lg:flex mt-8 lg:mt-0 item-center justify-between px-5  "
        id="navbar-with-form"
      >

        {
          data?.status === "completed" ? null : <button
            onClick={(e) => handelResult("canceled")}
            type="button"
            className="py-2.5 pl-3.5 pr-6 text-sm bg-rose-500 text-white rounded-xl cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 flex items-center hover:bg-rose-700"
          >

            Cancel Match{" "}
          </button>
        }

      </div>

      <div className="flex flex-col px-5">
        <div className="overflow-x-auto pb-4">
          <div className="block">


            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
              <h2 className="text-2xl font-bold text-center">Game Summary</h2>
              <div className="flex justify-between items-center mt-4">
                <p className="text-lg font-semibold">Game Status:</p>
                <p
                  className={` capitalize inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${data.status === "completed"
                    ? 'bg-green-500 text-green-500'
                    : data.status === "conflict"
                      ? 'bg-red-500 text-red-500'
                      : 'bg-yellow-500 text-yellow-500'
                    }`}
                >
                  {data?.status}
                </p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-lg font-semibold">Game Amount:</p>
                <p className="text-gray-700">{data?.game_amount ?? "N/A"}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-lg font-semibold">Room Code:</p>
                <p className="text-gray-700">{data?.room_code ?? "N/A"}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-lg font-semibold">Date time:</p>
                <p className="text-gray-700">{new Date(data?.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-lg font-semibold">Winner:</p>
                <p className="text-green-500">{data?.winner_id?.name ?? "N/A"}</p>
              </div>
              {/* Add more game summary details here */}
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 mt-4">
              {/* creator */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Creator</h2>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-lg font-semibold">Name:</p>
                  <p onClick={(e) => navigate(`/player/details/${data?.creator_id?._id}`)} className="text-indigo-500 font-extrabold cursor-pointer">{data?.creator_id?.name ?? "N/A"}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-lg font-semibold">Game Status:</p>
                  <p className="text-red-500">{data?.creator_game_status ?? "N/A"}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-lg font-semibold">Result update time:</p>
                  <p className="text-gray-500">{data?.creator_game_status_time
                    ? moment(data.creator_game_status_time).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A')
                    : "N/A"}</p>
                </div>
                {
                  data?.creator_game_status != "win" ? null : <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-semibold">Screenshort update time:</p>
                    <p className="text-gray-500">{data?.creator_game_screenshort_time
                      ? moment(data.creator_game_screenshort_time).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A')
                      : "N/A"}</p>
                  </div>
                }

                {
                  data?.status === "completed" ? null : data?.status === "conflict" || data?.status === "completed" || data?.status === "running" ? (<>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-lg font-semibold">Take Action:</p>
                      <div className='flex justify-around items-center gap-1'>
                        <button onClick={(e) => handelResult("win", data?.creator_id?._id)} className="text-white bg-green-500 hover:bg-green-600 py-1 px-4 rounded-xl">Win</button>
                      </div>
                    </div></>) : null
                }
                {data?.status === "conflict" || data?.status === "completed" || data?.status === "running" ? (
                  <>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-lg font-semibold">Screen short:</p>
                      <div className="flex justify-end items-center gap-1">
                        <img
                          className="w-[140px] h-[100px] border rounded-xl cursor-pointer"
                          src={`https://api.mumbailudo.com/public/game/${data?.creator_game_screenshort}`}
                          alt="game screen short"
                          onClick={handleImageClickCreator}
                        />
                      </div>
                    </div>

                    {/* Full Screen Image Modal */}
                    {isModalOpenCreator && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                        <div className="relative">
                          <img
                            className="w-auto h-auto max-w-full max-h-screen border rounded-lg"
                            src={`https://api.mumbailudo.com/public/game/${data?.creator_game_screenshort}`}
                            alt="full screen game screen short"
                          />
                          <button
                            className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-2"
                            onClick={closeModalCreator}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                {/* Add more creator details here */}
              </div>

              {/* acceptor */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Acceptor</h2>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-lg font-semibold">Name:</p>
                  <p onClick={(e) => navigate(`/player/details/${data?.acceptor_id?._id}`)} className="text-indigo-500 font-extrabold cursor-pointer">{data?.acceptor_id?.name ?? "N/A"}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-lg font-semibold">Game Status:</p>
                  <p className="text-green-500">{data?.acceptor_game_status ?? "N/A"}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-lg font-semibold">Result update time:</p>
                  <p className="text-gray-500">{data?.acceptor_game_status_time
                    ? moment(data.acceptor_game_status_time).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A')
                    : "N/A"}</p>
                </div>

                {
                  data?.acceptor_game_status != "win" ? null : <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-semibold">Screenshort update time:</p>
                    <p className="text-gray-500">{data?.acceptor_game_screenshort_time
                      ? moment(data.acceptor_game_screenshort_time).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A')
                      : "N/A"}</p>
                  </div>
                }

                {
                  data?.status === "completed" ? null : data?.status === "conflict" || data?.status === "completed" || data?.status === "running" ? (<>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-lg font-semibold">Take Action:</p>
                      <div className='flex justify-around items-center gap-1'>
                        <button onClick={(e) => handelResult("win", data?.acceptor_id?._id)} className="text-white bg-green-500 hover:bg-green-600 py-1 px-4 rounded-xl">Win</button>
                      </div>
                    </div></>) : null
                }
                {data?.status === "conflict" || data?.status === "completed" || data?.status === "running" ? (
                  <>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-lg font-semibold">Screen short:</p>
                      <div className="flex justify-end items-center gap-1">
                        <img
                          className="w-[140px] h-[100px] border rounded-xl cursor-pointer"
                          src={`https://api.mumbailudo.com/public/game/${data?.acceptor_game_screenshort}`}
                          alt="game screen short"
                          onClick={handleImageClickAcceptor}
                        />
                      </div>
                    </div>

                    {/* Full Screen Image Modal */}
                    {isModalOpenAcceptor && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                        <div className="relative">
                          <img
                            className="w-auto h-auto max-w-full max-h-screen border rounded-lg"
                            src={`https://api.mumbailudo.com/public/game/${data?.acceptor_game_screenshort}`}
                            alt="full screen game screen short"
                          />
                          <button
                            className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-2"
                            onClick={closeModalAcceptor}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                {/* Add more acceptor details here */}
              </div>
            </div>



            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
              <h2 className="text-2xl font-bold text-center">Financial Summary</h2>
              <div className="flex justify-between items-center mt-4">
                <p className="text-lg font-semibold">Creator Closing Balance:</p>
                <p className="text-gray-700">{data?.creator_closing_balance ?? "N/A"}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-lg font-semibold">Acceptor Closing Balance:</p>
                <p className="text-gray-700">{data?.acceptor_closing_balance ?? "N/A"}</p>
              </div>
              {/* Add more financial summary details here */}
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
                      <label className="flex  items-center mb-2 text-gray-600 text-sm font-medium">
                        Department Name{" "}
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
                      <input id="department_name" name='department_name' onChange={formik.handleChange}
                        className={`block w-full px-8 py-4 rounded-xl font-medium bg-white bg-opacity-5 border ${formik.errors.department_name ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 mt-5`}
                        type="text"
                        placeholder="Enter department name"
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
                        disabled={formik.isSubmitting} // Disable the button while submitting
                      >
                        {formik.isSubmitting ? (
                          // Show loading spinner if submitting
                          <span>Loading...</span>
                        ) : (
                          // Show "Login" text if not submitting
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

export default GameDetails
