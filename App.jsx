
import { Routes, Route, BrowserRouter, Outlet, Navigate } from 'react-router-dom';
import Home from "./views/home/Home";
import Sidebar from "./components/Sidebar";
import Wallet from './views/home/Wallet';
import ReferEarn from './views/home/ReferEarn';
import Profile from './views/home/Profile';
import Support from './views/home/Support';
import TermLegal from './views/home/TermLegal';
import PrivateRoutes from './utils/PrivateRoutes';
import Signup from './views/auth/OtpLogin';
import BottomNav from './components/BottomNav';
import Classic from './views/game/Classic';
import Game from './views/home/Game';
import View from './views/game/View';
import Transactionhistory from './views/home/Transactionhistory';
import MaintenanceMode from './components/MaintenanceMode';
// import Signin from './views/auth/Signin';
import Redeem from './views/wallet/Redeem';
import PlateformCommission from './views/support/PlateformCommission.jsx';
import ResponsibleGaming from './views/support/ResponsibleGaming';
import ContactUs from './views/support/ContactUs';
import RefundPolicy from './views/support/RefundPolicy';
import PrivacyPolicy from './views/support/PrivacyPolicy';
import TermCondation from './views/support/TermCondation';

const Layout = () => (
  <div className=''>
    <Sidebar />
    <div className=''>
      <Outlet />
      <BottomNav />
    </div>
  </div>
);

export default function App() {
  return (
    <>

      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/support" element={<Support />} />
            <Route path="/term&legal" element={<TermLegal />} />
            <Route path="/maintenance" element={<MaintenanceMode />} />
            <Route path="/term-condition" element={<TermCondation />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
            <Route path="/platform-commission" element={<PlateformCommission />} />


            <Route path="/login" element={
              <div className='xl:w-1/3 xl:border-r-4 border-gray-300 h-screen'>
                <Signup />
              </div>
            } />

            <Route path="/login/:id" element={
              <div className='xl:w-1/3 xl:border-r-4 border-gray-300 h-screen'>
                <Signup />
              </div>
            } />

            {/* <Route path="/login" element={
          <div className='xl:w-1/3 xl:border-r-4 border-gray-300 h-screen'>
            <Signin />
          </div>
        } />

        <Route path="/register" element={
          <div className='xl:w-1/3 xl:border-r-4 border-gray-300 h-screen'>
            <Signup />
          </div>
        } />

        <Route path="/register/:id" element={
          <div className='xl:w-1/3 xl:border-r-4 border-gray-300 h-screen'>
            <Signup />
          </div>
        } /> */}

            {/* Protected routes */}
            <Route element={<PrivateRoutes />}>
              {/* <Route element={
            <div className=''>
              <Sidebar />
              <div className=''>
                <Outlet />
                <BottomNav/>
              </div>
            </div>
          }> */}
              <Route path="/game/classic" element={<Classic />} />
              <Route path="/game/view/:id" element={<View />} />
              <Route path="/transaction-history" element={<Transactionhistory />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/refer&earn" element={<ReferEarn />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/game-history" element={<Game />} />

              <Route path="/redeem" element={<Redeem />} />
            </Route>
            {/* </Route> */}

            {/* Catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
