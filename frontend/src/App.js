// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import { TenderProvider } from './context/TenderContext';

// import LandingPage from './components/LandingPage';
// import RegistrationPage from './components/RegistrationPage';
// import LoginPage from './components/LoginPage';
// import AdminDashboard from './components/Dashboard/AdminDashboard';
// import BidderDashboard from './components/Dashboard/BidderDashboard';
// import UserProfilePage from './components/UserProfilePage';
// import CreateTenderPage from './components/Tender/CreateTenderPage';
// import ModifyTenderPage from './components/Tender/ModifyTenderPage'; 
// import DeleteTenderPage from './components/Tender/DeleteTenderPage'; 
// import ViewTenderPage from './components/Tender/ViewTenderPage';
// import SubmitBidPage from './components/Tender/SubmitBidPage';
// import BidDetailsPage from './components/Tender/BidDetailsPage';
// import TenderListPage from './components/TenderListPage'; 
// import TenderManagementPage from './components/Admin/TenderManagementPage';
// import BidEvaluationPage from './components/Admin/BidEvaluationPage';
// import ReportsAnalyticsPage from './components/Admin/ReportsAnalyticsPage';
// import AuditLogsPage from './components/Admin/AuditLogsPage';
// import BlockchainTransactionsPage from './components/Admin/BlockchainTransactionsPage';
// import NotificationsPage from './components/NotificationsPage';
// import SettingsPage from './components/SettingsPage';
// import HelpSupportPage from './components/HelpSupportPage';
// import TermsOfService from './components/TermsOfService'; 
// import PrivacyPolicy from './components/PrivacyPolicy'; 
// import ContactUs from './components/ContactUs'; 



// // Component to protect routes based on user roles
// const ProtectedRoute = ({ children, roleRequired }) => {
//   const user = JSON.parse(localStorage.getItem('user'));

//   // If there's no user (not logged in), redirect to login
//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   // If the user's role doesn't match the required role, redirect to login
//   if (user.role !== roleRequired) {
//     return <Navigate to="/login" />;
//   }

//   // If both checks pass, render the children
//   return children;
// };

// const App = () => {
//   return (
//     <TenderProvider>
//       <Router>
//         <div className="App">
//           <Navbar />
//           <Routes>
//             <Route path="/" element={<LandingPage />} />
//             <Route path="/register" element={<RegistrationPage />} />
//             <Route path="/login" element={<LoginPage />} />
//             <Route 
//               path="/admin/dashboard" 
//               element={
//                 <ProtectedRoute roleRequired="admin">
//                   <AdminDashboard />
//                 </ProtectedRoute>
//               } 
//             />
//             <Route 
//               path="/bidder/dashboard" 
//               element={
//                 <ProtectedRoute roleRequired="bidder">
//                   <BidderDashboard />
//                 </ProtectedRoute>
//               } 
//             />
//             <Route path="/profile" element={<UserProfilePage />} />
//             <Route path="/tender/create" element={<CreateTenderPage />} />
//             <Route path="/tender/modify" element={<ModifyTenderPage />} />
//             <Route path="/tender/delete" element={<DeleteTenderPage />} />
//             <Route path="/tender/view" element={<ViewTenderPage />} />
//             <Route path="/tender/submit" element={<SubmitBidPage />} />
//             <Route path="/tender/bid-details" element={<BidDetailsPage />} />
//             <Route path="/admin/tender-management" element={<TenderManagementPage />} />
//             <Route path="/admin/bid-evaluation" element={<BidEvaluationPage />} />
//             <Route path="/admin/reports" element={<ReportsAnalyticsPage />} />
//             <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
//             <Route path="/admin/blockchain-transactions" element={<BlockchainTransactionsPage />} />
//             <Route path="/notifications" element={<NotificationsPage />} />
//             <Route path="/settings" element={<SettingsPage />} />
//             <Route path="/help" element={<HelpSupportPage />} />
//             <Route path="/terms-of-service" element={<TermsOfService />} />
//             <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//             <Route path="/contact" element={<ContactUs />} />
//             <Route path="/tenders" element={<TenderListPage />} /> 
            
//           </Routes>
//           <Footer />
//         </div>
//       </Router>
//     </TenderProvider>
//   );
// };

// export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { TenderProvider } from './context/TenderContext';

import LandingPage from './components/LandingPage';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import BidderDashboard from './components/Dashboard/BidderDashboard';
import UserProfilePage from './components/UserProfilePage';
import CreateTenderPage from './components/Tender/CreateTenderPage';
import ModifyTenderPage from './components/Tender/ModifyTenderPage'; 
import DeleteTenderPage from './components/Tender/DeleteTenderPage'; 
import ViewTenderPage from './components/Tender/ViewTenderPage';
import SubmitBidPage from './components/Tender/SubmitBidPage';
import BidDetailsPage from './components/Tender/BidDetailsPage';
import TenderListPage from './components/TenderListPage'; 
import TenderManagementPage from './components/Admin/TenderManagementPage';
import BidEvaluationPage from './components/Admin/BidEvaluationPage';
import ReportsAnalyticsPage from './components/Admin/ReportsAnalyticsPage';
import AuditLogsPage from './components/Admin/AuditLogsPage';
import BlockchainTransactionsPage from './components/Admin/BlockchainTransactionsPage';
import NotificationsPage from './components/NotificationsPage';
import SettingsPage from './components/SettingsPage';
import HelpSupportPage from './components/HelpSupportPage';
import TermsOfService from './components/TermsOfService'; 
import PrivacyPolicy from './components/PrivacyPolicy'; 
import ContactUs from './components/ContactUs'; 
import AdminSendNotification from './components/Admin/AdminSendNotification';
import Notifications from './components/Bidder/NotificationsPage';
// Component to protect routes based on user roles
const ProtectedRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // If there's no user (not logged in), redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the user's role doesn't match the required role, redirect to login
  if (user.role !== roleRequired) {
    return <Navigate to="/login" />;
  }

  // If both checks pass, render the children
  return children;
};

const App = () => {
  return (
    <TenderProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute roleRequired="tender-officer">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bidder/dashboard" 
              element={
                <ProtectedRoute roleRequired="bidder">
                  <BidderDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/tender/create" element={<CreateTenderPage />} />
            <Route path="/tender/modify" element={<ModifyTenderPage />} />
            <Route path="/tender/delete" element={<DeleteTenderPage />} />
            <Route path="/tender/view" element={<ViewTenderPage />} />
            <Route path="/tender/submit" element={<SubmitBidPage />} />
            <Route path="/tender/bid-details" element={<BidDetailsPage />} />
            <Route path="/admin/tender-management" element={<TenderManagementPage />} />
            <Route path="/admin/bid-evaluation" element={<BidEvaluationPage />} />
            <Route path="/admin/reports" element={<ReportsAnalyticsPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/blockchain-transactions" element={<BlockchainTransactionsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpSupportPage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/tenders" element={<TenderListPage />} /> 
            <Route path="/admin/admin-send-notifications" component={<AdminSendNotification/>} />
            <Route path="/Bidder/notifications" component={<NotificationsPage/>} />
            {/* Fallback route for undefined paths */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </TenderProvider>
  );
};

export default App;

