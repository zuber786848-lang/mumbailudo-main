// Sidebar.js
import { Children, useState, } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BellRingIcon, BookOpenCheck, Contact, LayoutDashboard, ListCheck, ListTodo, MonitorCheckIcon, MonitorCog, MoonIcon, NotebookTabs, Presentation, UserPlus } from 'lucide-react';




const Sidebar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState(null); // To track open children
  const location = useLocation(); // Hook to get current location

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const path = [
    {
      name: "Dashboard",
      path: "/",
      svgLogo: <LayoutDashboard />,
    },
    {
      name: "Player List",
      path: "/player/list",
      svgLogo: <ListTodo />,
    },
    {
      name: "KYC",
      // path: "/player/kyc",
      svgLogo: <UserPlus />,
      Children: [
        {
          name: "Pending",
          path: "/kyc/pending",
        },
        {
          name: "Approved",
          path: "/kyc/approved",
        },
        {
          name: "Rejected",
          path: "/kyc/rejected", // Corrected "rejectd" to "rejected"
        },
      ],
    },
    {
      name: "Transaction",
      // path: "/transaction",
      svgLogo: <Contact />,
      Children: [
        {
          name: "Deposit",
          path: "/transaction/deposit",
        },
        {
          name: "Withdrawal",
          path: "/transaction/withdrawal",
        },
        {
          name: "Bonus",
          path: "/transaction/bonus",
        },
        {
          name: "Penalty",
          path: "/transaction/penalty",
        },
        // {
        //   name: "Bonus & Penalty",
        //   path: "/transaction/bonus/penalty",
        // },
      ],
    },
    {
      name: "Games",
      // path: "/games",
      svgLogo: <ListCheck />,
      Children: [
        {
          name: "Conflict Game",
          path: "/games/conflict", // Corrected "coflict" to "conflict"
        },
        {
          name: "New Game",
          path: "/games/new",
        },
        {
          name: "Running Game",
          path: "/games/running",
        },
        {
          name: "Completed Game",
          path: "/games/completed",
        },
      ],
    },
    {
      name: "Commission",
      path: "/admin/commission",
      svgLogo: <NotebookTabs />,
    },
    {
      name: "Admin",
      path: "/admin",
      svgLogo: <Presentation />,
    },
    {
      name: "Settings",
      // path: "/settings",
      svgLogo: <MonitorCog />,
      Children: [
        {
          name: "Site Settting",
          path: "/setting/site", // Corrected "coflict" to "conflict"
        },
        {
          name: "Payment Setting",
          path: "/setting/payment",
        },
        {
          name: "Commission Setting",
          path: "/setting/commission ",
        },
        {
          name: "Amount Setting",
          path: "/setting/amount",
        },
      ],
    },
  ];

  // Determine which tab is active based on the current route
  const activeTab = path.findIndex(link => location.pathname.startsWith(link.path));

  const handleTabClick = (index) => {
    // If the link has children, toggle the children visibility
    if (path[index].Children) {
      setOpenIndex(openIndex === index ? null : index);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/';
  };




  return (
    <>


      <nav className="xl:bg-white border-b-1 bg-white xl:py-3 py-2 px-4 xl:px-6 shadow-md">
        <div className="mx-auto flex justify-between items-center">
          <div className=" font-bold text-2xl ">
            <Link to="/">
              <h2><span className='text-red-500'>RKL</span><span className='text-gray-800'>LUDOClub</span></h2>
            </Link>
          </div>

          {/* Responsive menu button for small screens */}
          <div className="md:hidden">
            <button
              className="text-white focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w8 h-8 text-gray-800"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>

              ) : (
                <svg
                  className="h-8 w-8 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}

            </button>
          </div>

          <div className="md:block hidden">
            <div className=' flex justify-between items-center gap-4'>
              <button
                className="text-white focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <MoonIcon className='text-blue-800' />

                ) : (
                  <MoonIcon className='text-gray-800' />
                )}

              </button>
              <button
                className="text-white focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <BellRingIcon className='text-blue-800' />

                ) : (
                  <BellRingIcon className='text-gray-800' />
                )}

              </button>
              <button
                className="text-white focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <img className='w-10 h-10 rounded-full' src="https://modernize-tailwind-nextjs-main.vercel.app/_next/image?url=%2Fimages%2Fprofile%2Fuser-1.jpg&w=48&q=75" alt="" srcset="" />

                ) : (
                  <img className='w-10 h-10 rounded-full' src="https://modernize-tailwind-nextjs-main.vercel.app/_next/image?url=%2Fimages%2Fprofile%2Fuser-1.jpg&w=48&q=75" alt="" srcset="" />
                )}

              </button>

            </div>
          </div>
        </div>
      </nav>

      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transition-transform transform ${isMenuOpen ? 'translate-x-0 text-center flex justify-center items-center' : '-translate-x-full'}`}>
        <div
          className={`fixed flex flex-col px-3 top-0 left-0 w-64 bg-gray-900 h-screen overflow-y-auto ${isMenuOpen ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          <div className="flex items-center justify-start ml-6 mt-4 h-14">
            <div className="font-bold text-3xl text-white">
              <Link to="/" className="flex items-center gap-2">
                <h2><span className='text-red-500'>RKL</span><span className='text-white'>LUDOClub</span></h2>
                {/* Logo */}
                {/* <img className="w-44" src="/adda124_logo.png" alt="Logo" /> */}
              </Link>
            </div>
          </div>
          <div className="flex flex-col flex-grow mt-4">
            <ul className="flex flex-col space-y-2">
              {path.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    onClick={() => (handleTabClick(index), toggleMenu())}
                    className={`relative flex items-center h-12 px-4 rounded-lg transition-colors duration-300 ease-in-out hover:bg-gray-700 cursor-pointer ${activeTab === index ? 'bg-gray-800 text-white' : 'text-gray-400'
                      }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center">
                      {link.svgLogo}
                    </span>
                    <span className={`ml-4 text-sm font-semibold ${activeTab === index ? 'text-white' : 'text-gray-300'}`}>
                      {link.name}
                    </span>
                    {link.Children && (
                      <span
                        className={`ml-auto transform transition-transform duration-300 ease-in-out ${openIndex === index ? 'rotate-180' : 'rotate-0'
                          }`}
                      >
                        <svg
                          className="w-4 h-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    )}
                  </Link>

                  {/* Show children if available and active */}
                  {link.Children && openIndex === index && (
                    <ul className="ml-4 mt-2 space-y-1">
                      {link.Children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link
                            to={child.path}
                            onClick={(e) => toggleMenu()}
                            className={`relative flex items-center h-10 px-4 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors duration-300 ease-in-out ${location.pathname === child.path ? 'bg-gray-800 text-white' : ''
                              }`}
                          >
                            <span className="text-sm">{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Logout button */}
          <div className="flex justify-center items-center mb-5 mt-auto">
            <button
              onClick={handleLogout}
              className="relative flex items-center h-12 px-4 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-700 transition-colors duration-300 ease-in-out"
            >
              <span className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </span>
              <span className="ml-3 text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>


      {/* Navigation links for larger screens */}

      <div className="lg:block hidden md:flex md:flex-shrink-0 antialiased bg-gray-50 text-gray-800">
        <div
          className={`fixed flex flex-col top-0 px-3 left-0 w-64 bg-gray-900 h-screen overflow-y-auto ${isMenuOpen ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          <div className="flex items-center justify-start ml-6 mt-4 h-14">
            <div className="font-bold text-white">
              <Link to="/" className="flex items-center gap-2">
                {/* Logo */}
                <img className="w-44" src="/logo.png" alt="Logo" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col flex-grow mt-4">
            <ul className="flex flex-col space-y-2">
              {path.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    onClick={() => handleTabClick(index)}
                    className={`relative flex items-center h-12 px-4 rounded-lg transition-colors duration-300 ease-in-out hover:bg-gray-700 cursor-pointer ${activeTab === index ? 'bg-gray-800 text-white' : 'text-gray-400'
                      }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center">
                      {link.svgLogo}
                    </span>
                    <span className={`ml-4 text-sm font-semibold ${activeTab === index ? 'text-white' : 'text-gray-300'}`}>
                      {link.name}
                    </span>
                    {link.Children && (
                      <span
                        className={`ml-auto transform transition-transform duration-300 ease-in-out ${openIndex === index ? 'rotate-180' : 'rotate-0'
                          }`}
                      >
                        <svg
                          className="w-4 h-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    )}
                  </Link>

                  {/* Show children if available and active */}
                  {link.Children && openIndex === index && (
                    <ul className="ml-4 mt-2 space-y-1">
                      {link.Children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link
                            to={child.path}
                            className={`relative flex items-center h-10 px-4 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors duration-300 ease-in-out ${location.pathname === child.path ? 'bg-gray-800 text-white' : ''
                              }`}
                          >
                            <span className="text-sm">{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Logout button */}
          <div className="flex justify-center items-center mb-5 mt-auto">
            <button
              onClick={handleLogout}
              className="relative flex items-center h-12 px-4 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-700 transition-colors duration-300 ease-in-out"
            >
              <span className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </span>
              <span className="ml-3 text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>


    </>



  );
};

export default Sidebar;
