import React, { useState, useEffect } from 'react';
import { baseUrl, openGameRoute } from '../../utils/APIRoutes';
import useFetch from '../../hooks/useFetch';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'animate.css';
import ReactApexChart from 'react-apexcharts';
import Breadcrumb from '../../components/Breadcrumb';
import DashboardCard from '../../components/DashboardCard';
import { BookOpenCheck, Contact, LayoutDashboard, ListCheck, ListTodo, MonitorCheckIcon, MonitorCog, NotebookTabs, Presentation, UserCheck2Icon, UserCircle2, UserMinus2Icon, UserPlus } from 'lucide-react';
import Clock from '../../components/Clock';
import Attendance from '../../components/Player';
import DateRangePicker from '../../components/DateRangePicker';



function Home() {

    const breadcrumbItems = [
      { text: 'Dashboard', href: 'javascript:;' }
    ];


    const [dashboard, setDashboard] = useState([])


    const fetchData = async (startDate, endDate) => {
      try {
        const response = await axios.get(
          `${baseUrl}/admin/dashboard/total/user?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`
            }
          }
        );
        setDashboard(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
      }
    };
  
    const handleDateRangeChange = (newDateRange) => {
      if (newDateRange.from && newDateRange.to) {
        const startDate = formatDate(newDateRange.from);
        const endDate = formatDate(newDateRange.to);
        fetchData(startDate, endDate);
      }
    };
  
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
  
    useEffect(() => {
      // Fetch initial data with current date
      const today = new Date();
      const formattedToday = formatDate(today);
      fetchData(formattedToday, formattedToday);
    }, []);
  

  return (
    <>
    <div className="p-5 xl:flex justify-between">
      <Breadcrumb items={breadcrumbItems} />
      <DateRangePicker onDateRangeChange={handleDateRangeChange} />
    </div>


        <div className='grid xl:grid-cols-4 grid-cols-1 gap-3 px-5 mb-4'>
       
         
          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Total Commission"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalAdminCommissionAmt}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>
          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Total User"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalUsers}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Active User"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalActiveUser}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          
          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Block User"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalBlockUser}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Deleted User"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalDeletedUser}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Wallet Balance"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.walletBalance}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Total Deposit"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalDepositAmt}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Total Withdrawal"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalWithdrawalAmt}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Total Pending Withdrawal"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalPendingWithdrawal}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Bonus Amount"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.bonusAmount}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>
          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Total Bonus"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalBonusAmt}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Total Penalty"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalPenalty}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Pending Deposit"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalPendingDeposit}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Approved Deposit"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalApprovedDeposit}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>

          <div className=" flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800">{"Rejected Deposit"}</h3>
              
              <div className='flex justify-between items-center'>

              <p
                className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                
              >
              {dashboard?.totalRejectedDeposit}
                
              </p>

              <UserCheck2Icon/>

              </div>
              
            </div>
          </div>


             
            

     
        </div>
        

    </>
  )
}

export default Home