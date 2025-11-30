import React, { useEffect, useState } from 'react'
import Breadcrumb from '../../components/Breadcrumb';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import axios from 'axios';
import { baseUrl } from '../../utils/APIRoutes';
import toast from 'react-hot-toast';
import UserGameHistory from '../../components/UserGameHistory';
import UserBonus from '../../components/UserBonus';
import UserPenalty from '../../components/UserPenalty';
import UserDeposit from '../../components/UserDeposit';
import UserWithdrawal from '../../components/UserWithdrawal';
import UserKycDetails from '../../components/UserKyc';

const validate = values => {
  const errors = {};

 
  if (!values.department_name) {
    errors.department_name = 'Required';
  }

  return errors;
};

function PlayerDetails() {
  const breadcrumbItems = [
    { text: 'Dashboard', href: '/' },
    { text: 'Player', href: '/' },
    { text: 'Player Details', href: '/' },
  ];

  const [isModel, setModel] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("bonus");
  const [amount, setAmount] = useState("");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false); // Close dropdown after selecting
    // Add your filter logic here
  };

  let params = useParams();

  async function fetchData() {
    setLoading(true);
    try {
      const result = await axios.get(`${baseUrl}/admin/dashboard/view/user/details?userId=${params.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      setLoading(false);
      setData(result?.data?.data);
     
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  async function updatePenaltyOrBonus(selectedFilter, params, amount, baseUrl, fetchData) {
    setLoading(true);
  
    try {
      if (selectedFilter === "penalty") {
        let values = {
          "penaltyAmount": amount
        };
  
       let response = await axios.post(
          `${baseUrl}/admin/transaction/penalty?userId=${params.id}`,
          values, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
          }
        );
        toast.success(response.data.message);
  
      
      } else {
       let response = await axios.patch(
          `${baseUrl}/admin/transaction/add/bonus?userId=${params.id}&bonus=${amount}`,
          null,  // no request body needed for this API call
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
          }
        );
        toast.success(response.data.message);
  
      
      }      

      setLoading(false);
      fetchData();
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  const updateBonusAndPenlaty = (value) => {
    setAmount(value);
    updatePenaltyOrBonus(selectedFilter, params, value, baseUrl, fetchData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const blockOrActiveAccount = async (status) => {
    setLoading(true);
    try {
      const endpoint = status === "block" 
        ? `${baseUrl}/user/manage/user/block?userId=${params.id}&blockReseason=Admin block`
        : `${baseUrl}/user/manage/user/unblock?userId=${params.id}`;

        console.log(endpoint)

      const result = await axios.post(`${endpoint}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      toast.success(result.data.message);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  const UserProfileButtons = ({ onButtonClick, activeButton }) => {
    const buttons = [
      { name: 'gameHistory', label: 'Game History' },
      { name: 'kyc', label: 'Kyc Details' },
      { name: 'bonus', label: 'Bonus' },
      { name: 'penalty', label: 'Penalty' },
      { name: 'deposit', label: 'Deposit' },
      { name: 'withdrawal', label: 'Withdrawal' }
    ];
  
    return (
      <div className="flex flex-wrap justify-start items-center gap-2 mt-5">
        {buttons.map((button) => (
          <button
            key={button.name}
            onClick={() => onButtonClick(button.name)}
            variant={activeButton === button.name ? "default" : "bg-gray-700"}
             className={`py-2.5 px-4 text-sm ${activeButton === button.name ? "bg-gray-900" : "bg-gray-400"} text-white rounded-xl font-semibold text-center shadow-xs transition-all duration-500 flex items-center hover:bg-gray-700 disabled:opacity-50`}
          >
            {button.label}
          </button>
        ))}
      </div>
    );
  };


  const [activeSection, setActiveSection] = useState('gameHistory');

  const handleButtonClick = (buttonName) => {
    setActiveSection(buttonName);
  };
 

  return (
    <>
    <div className="p-5">
      <Breadcrumb items={breadcrumbItems} />
    </div>
    <div
      className="w-full lg:flex lg:mt-0 item-center justify-between px-5 mb-4 "
      id="navbar-with-form"
    >
      <div className='xl:flex justify-between items-center gap-2'>

      <div className="relative inline-block text-left">
       
       
      <button
        onClick={toggleDropdown}
        type="button"
        className="py-2.5 pl-3.5 pr-6  mb-4 xl:mb-0 text-sm border text-gray-800 rounded-xl cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 flex items-center hover:bg-gray-300 capitalize"
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
            stroke="black"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {selectedFilter}
      </button>

      {isDropdownOpen && (
        <div className="absolute z-40 left-10 mt-2 w-40 bg-white shadow-lg rounded-lg">
          <ul className="py-1">
            <li
              onClick={() => handleFilterChange("penalty")}
              className="px-4 py-2 hover:bg-indigo-100 cursor-pointer capitalize"
            >
              Penalty
            </li>
            <li
              onClick={() => handleFilterChange("bonus")}
              className="px-4 py-2 hover:bg-indigo-100 cursor-pointer capitalize"
            >
              Bonus
            </li>
          </ul>
        </div>
      )}
        </div>

      <form className="flex justify-between items-center w-full space-x-2">
        <div className="relative w-full">
          <input
            type="text"
            id="default-search"
            className="block w-full px-4 py-2.5 text-sm font-normal shadow-xs text-gray-900 bg-white border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none leading-relaxed"
            placeholder="Enter amount bonus/penlalty"
            required=""
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button
          className="py-2 px-4 bg-indigo-500 hover:bg-blue-600 text-white rounded-xl"
          type="button"
          onClick={() => updateBonusAndPenlaty(amount)}
          disabled={loading}
        >
          
        {loading ? 'Processing...' : 'Add'}
        </button>
      </form>

      </div>
      <div className='flex mt-4 xl:mt-0 justify-between items-center gap-2'>
      <button 
        onClick={() => blockOrActiveAccount("block")} 
        type="button" 
        className="py-2.5 px-4 text-sm bg-rose-500 text-white rounded-xl font-semibold text-center shadow-xs transition-all duration-500 flex items-center hover:bg-rose-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Block User'}
      </button>
      <button 
       onClick={() => blockOrActiveAccount("ublock")}
        type="button" 
        className="py-2.5 px-4 text-sm bg-green-500 text-white rounded-xl font-semibold text-center shadow-xs transition-all duration-500 flex items-center hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Unblock User'}
      </button>
    </div>
    </div> 

      <div className="flex flex-col px-5">
      <div className="overflow-x-auto pb-4">
    <div className="block">
    
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {/* User Details */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-4">User Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Name:</p>
              <p className="text-gray-700">{data?.name}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Phone:</p>
              <p className="text-gray-700">{data?.phone_no}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">KYC Status:</p>
              <p className={`capitalize ${data?.kyc_status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}>
                {data.kyc_status}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Referral Code:</p>
              <p className="text-gray-700">{data?.referral_code}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Account Status:</p>
              <p
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                          data?.block
                                ? 'bg-red-600 text-red-600'
                                : 'bg-green-600 text-green-600'
                        }`}
                    >
                        {data?.block ? "Block" : "Active"}
                    </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">UPI Number:</p>
              <p className="text-gray-700">{data?.UPI_ID ?? "N/A"}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Account Holder Name:</p>
              <p className="text-gray-700">{data?.account_holder_name ?? "N/A"}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Account Number:</p>
              <p className="text-gray-700">{data?.account_number ?? "N/A"}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">IFSC Code:</p>
              <p className="text-gray-700">{data?.IFSC_Code ?? "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-4">Financial Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total Wallet Balance:</p>
              <p className="text-gray-700">₹{(data?.wallet_balance + data?.win_amount + data?.bonus_amount).toFixed(2)}</p> 
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Win Amount:</p>
              <p className="text-green-500">₹{data?.win_amount?.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total Win Amount:</p>
              <p className="text-green-500">₹{data?.total_win_amount?.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total Deposit:</p>
              <p className="text-gray-700">₹{data?.total_deposit_amt?.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total Withdrawal:</p>
              <p className="text-gray-700">₹{data?.total_withdrawal_amt?.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Bonus Amount:</p>
              <p className="text-blue-500">₹{data?.bonus_amount?.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total Bonus Amount:</p>
              <p className="text-blue-500">₹{data?.total_bonus_amount?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      </div>

      <UserProfileButtons 
        onButtonClick={handleButtonClick} 
        activeButton={activeSection} 
      />

        </div>
      </div>

      <div>
     
      {activeSection === 'gameHistory' && <UserGameHistory userid={params.id} />}
      {activeSection === 'kyc' && <UserKycDetails userid={params.id} />}
      {activeSection === 'bonus' && <UserBonus userid={params.id} />}
      {activeSection === 'penalty' && <UserPenalty userid={params.id} />}
      {activeSection === 'deposit' && <UserDeposit userid={params.id} />}
      {activeSection === 'withdrawal' && <UserWithdrawal userid={params.id} />}
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

export default PlayerDetails