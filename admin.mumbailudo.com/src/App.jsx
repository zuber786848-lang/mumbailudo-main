
import { Routes, Route, BrowserRouter, Outlet } from 'react-router-dom';
// import Login from "./views/auth/Login";
import Home from "./views/home/Home";
import Sidebar from "./components/Sidebar";
import ReferEarn from './views/admin/Setting';
import Games from './views/home/Games';
import PrivateRoutes from './utils/PrivateRoutes';
import EmployeeList from './views/home/EmployeeList';
import PlayerList from './views/home/PlayerList';
import Transaction from './views/home/Transaction';
import Setting from './views/admin/Setting';
import PlayerKyc from './views/home/PlayerKyc';
import LoginWithOtpLess from './views/auth/LoginWithOtpLess';
import Admin from './views/home/Admin';
import GameDetails from './views/home/GameDetails';
import PlayerDetails from './views/home/PlayerDetails';
import AdminCommission from './views/admin/AdminCommission';
import TransactionWithdrawal from './views/transactions/withdrawal';
import TransactionDeposit from './views/transactions/deposit';
import GamesCompleted from './views/game/completed';
import GamesRunning from './views/game/running';
import ApprovedKyc from './views/kyc/ApprovedKyc';
import PendingKyc from './views/kyc/PendingKyc';
import RejectedKyc from './views/kyc/RejectedKyc';
import SettingSite from './views/admin/SettingSite';
import SettingAmount from './views/admin/SettingAmount';
import SettingPayment from './views/admin/SettingPayment';
import SettingCommission from './views/admin/SettingCommission';
import NewGame from './views/game/NewGame';
import ConflictGame from './views/game/ConflictGame';
import BonusPenalty from './views/transactions/BonusPenalty';
import TransactionBonus from './views/transactions/Bonus';
import TransactionPenalty from './views/transactions/Penalty';
import UserKycDetails from './components/UserKyc';
import AdminLogin from './views/auth/AdminLogin';

export default function App() {
  return (
    <>
    
    <BrowserRouter>
        <Routes>
          
          <Route path='/login' element={<AdminLogin />} />
          {/* <Route path='/signup' element={<Signup />} /> */}

          <Route element={<PrivateRoutes/>}>
          <Route
            path="/"
            element={
              <div>
                <Sidebar />
                <div className='xl:ml-[260px]'>
                  <Outlet /> 
                </div>
                {/* <Footer/> */}
              </div>
            }
          >
            <Route path="/" element={<Home />} />            
            <Route path="/games" element={<Games />} />
            <Route path="/games/conflict" element={<ConflictGame />} />
            <Route path="/games/new" element={<NewGame />} />
            <Route path="/games/running" element={<GamesRunning />} />
            <Route path="/games/completed" element={<GamesCompleted />} />
            <Route path="/games/details/:id" element={<GameDetails />} />


            <Route path="/player/kyc" element={<PlayerKyc />} />

            <Route path="/kyc/approved" element={<ApprovedKyc />} />
            <Route path="/kyc/pending" element={<PendingKyc />} />
            <Route path="/kyc/rejected" element={<RejectedKyc />} />
            <Route path="/transaction" element={<Transaction />} />

            <Route path="/transaction/deposit" element={<TransactionDeposit />} />
            <Route path="/transaction/withdrawal" element={<TransactionWithdrawal />} />
            <Route path="/transaction/bonus/penalty" element={<BonusPenalty />} />

            <Route path="/transaction/bonus" element={<TransactionBonus />} />
            <Route path="/user/kyc" element={<UserKycDetails />} />
            <Route path="/transaction/penalty" element={<TransactionPenalty />} />

            <Route path="/admins" element={<Admin />} />
            <Route path="/employee/list" element={<EmployeeList />} />
            <Route path="/player/list" element={<PlayerList />} />
            <Route path="/player/details/:id" element={<PlayerDetails />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/commission" element={<AdminCommission />} />

            {/* setting */}
            {/* <Route path="/settings" element={<Setting />} /> */}
            <Route path="/setting/site" element={<SettingSite />} />
            <Route path="/setting/amount" element={<SettingAmount />} />
            <Route path="/setting/payment" element={<SettingPayment />} />
            <Route path="/setting/commission" element={<SettingCommission />} />
            
          </Route>
        </Route>

        </Routes>
        
      </BrowserRouter>
    </>
  )
}