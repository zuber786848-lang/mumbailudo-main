import React from 'react'
import '../assets/dashboard.card.css'
function DashboardCard(item) {

  item = item?.data
 
  return (
   <>

<>
 
<div className="max-w-xs flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl">
  <div className="p-4 md:p-5">
    <h3 className="text-lg font-bold text-gray-800">{item?.title}</h3>
    
    <div className='flex justify-between items-center'>

    <p
      className="mt-3 inline-flex items-center gap-x-1 text-xl font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none"
      
    >
     {item.total_no}
      
    </p>

    <span >{item.icon}</span>

    </div>
    
  </div>
</div>

</>

   </>
  )
}

export default DashboardCard