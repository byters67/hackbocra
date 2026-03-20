/**
 * App.jsx - Main Application Router
 * All routes defined here. SplashScreen plays once on first visit.
 */
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { LanguageProvider } from './lib/language';
import { NotificationProvider } from './lib/notifications';
import Layout from './components/layout/Layout';
import SplashScreen from './components/animations/SplashScreen';

import HomePage from './pages/public/HomePage';
import AboutProfilePage from './pages/public/AboutProfilePage';
import ContactPage from './pages/public/ContactPage';
import FileComplaintPage from './pages/public/FileComplaintPage';
import NewsPage from './pages/public/NewsPage';
import NewsEventsPage from './pages/public/NewsEventsPage';
import FAQsPage from './pages/public/FAQsPage';
import DocumentsPage from './pages/public/DocumentsPage';
import ContentPage from './pages/public/ContentPage';
import TelecomStatisticsPage from './pages/public/TelecomStatisticsPage';
import LicenceVerificationPage from './pages/public/LicenceVerificationPage';
import TypeApprovalPage from './pages/public/TypeApprovalPage';
import SearchPage from './pages/public/SearchPage';
import HistoryPage from './pages/public/HistoryPage';
import BoardOfDirectorsPage from './pages/public/BoardOfDirectorsPage';
import ExecutiveManagementPage from './pages/public/ExecutiveManagementPage';
import LicensingHubPage from './pages/public/LicensingHubPage';
import CybersecurityHubPage from './pages/public/CybersecurityHubPage';
import RegisterBWPage from './pages/public/RegisterBWPage';
import IctLicensingPage from './pages/public/IctLicensingPage';
import OperatorPortalPage from './pages/public/OperatorPortalPage';
import QoSMonitoringPage from './pages/public/QoSMonitoringPage';
import LoginPage from './pages/auth/LoginPage';
import EmailVerifiedPage from './pages/auth/EmailVerifiedPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminComplaints from './pages/admin/ComplaintsPage';
import AdminApplications from './pages/admin/ApplicationsPage';
import AdminIncidents from './pages/admin/IncidentsPage';
import AdminQoSReports from './pages/admin/QoSReportsPage';
import AdminContact from './pages/admin/ContactPage';
import AdminDataRequests from './pages/admin/DataRequestsPage';
import AdminTypeApproval from './pages/admin/AdminTypeApprovalPage';
import AdminConsultations from './pages/admin/AdminConsultationsPage';
import ConsultationsPage from './pages/public/ConsultationsPage';
import SpeechesPage from './pages/public/SpeechesPage';
import BroadcastingPage from './pages/public/BroadcastingPage';
import InternetPage from './pages/public/InternetPage';
import DataProtectionPage from './pages/public/DataProtectionPage';
import DataRequestPage from './pages/public/DataRequestPage';

export default function App() {
  const [ready, setReady] = useState(!!sessionStorage.getItem('bocra-splash'));

  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          {!ready && <SplashScreen onComplete={() => setReady(true)} />}

          {ready && (
            <BrowserRouter basename="/hackbocra">
              <Routes>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<LoginPage />} />
                <Route path="/auth/verified" element={<EmailVerifiedPage />} />

                {/* Admin Portal — separate layout with sidebar */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="complaints/:id" element={<AdminComplaints />} />
                  <Route path="applications" element={<AdminApplications />} />
                  <Route path="applications/:id" element={<AdminApplications />} />
                  <Route path="incidents" element={<AdminIncidents />} />
                  <Route path="incidents/:id" element={<AdminIncidents />} />
                  <Route path="qos-reports" element={<AdminQoSReports />} />
                  <Route path="contact" element={<AdminContact />} />
                  <Route path="consultations" element={<AdminConsultations />} />
                  <Route path="type-approval" element={<AdminTypeApproval />} />
                  <Route path="data-requests" element={<AdminDataRequests />} />
                </Route>

                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about/profile" element={<AboutProfilePage />} />
                  <Route path="/about/chief-executive" element={<ContentPage />} />
                  <Route path="/about/history" element={<HistoryPage />} />
                  <Route path="/about/organogram" element={<ContentPage />} />
                  <Route path="/about/board" element={<BoardOfDirectorsPage />} />
                  <Route path="/about/executive-management" element={<ExecutiveManagementPage />} />
                  <Route path="/about/careers" element={<ContentPage />} />
                  <Route path="/mandate/legislation" element={<ContentPage />} />
                  <Route path="/mandate/telecommunications" element={<ContentPage />} />
                  <Route path="/mandate/broadcasting" element={<BroadcastingPage />} />
                  <Route path="/mandate/postal" element={<ContentPage />} />
                  <Route path="/mandate/internet" element={<InternetPage />} />
                  <Route path="/mandate/licensing" element={<ContentPage />} />
                  <Route path="/licensing" element={<LicensingHubPage />} />
                  <Route path="/licensing/:slug" element={<LicensingHubPage />} />
                  <Route path="/services/file-complaint" element={<FileComplaintPage />} />
                  <Route path="/services/licence-verification" element={<LicenceVerificationPage />} />
                  <Route path="/services/type-approval" element={<TypeApprovalPage />} />
                  <Route path="/services/register-bw" element={<RegisterBWPage />} />
                  <Route path="/services/asms-webcp" element={<OperatorPortalPage />} />
                  <Route path="/services/qos-monitoring" element={<QoSMonitoringPage />} />
                  <Route path="/services/spectrum" element={<ContentPage />} />
                  <Route path="/documents/drafts" element={<DocumentsPage />} />
                  <Route path="/documents/ict-licensing" element={<IctLicensingPage />} />
                  <Route path="/documents/publications" element={<DocumentsPage />} />
                  <Route path="/documents/itu-capacity-building" element={<ContentPage />} />
                  <Route path="/media/news" element={<NewsPage />} />
                  <Route path="/media/news-events" element={<NewsEventsPage />} />
                  <Route path="/media/speeches" element={<SpeechesPage />} />
                  <Route path="/media/center" element={<ContentPage />} />
                  <Route path="/tenders" element={<ContentPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/telecom-statistics" element={<TelecomStatisticsPage />} />
                  <Route path="/privacy-notice" element={<ContentPage />} />
                  <Route path="/portal/data-request" element={<DataRequestPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/projects" element={<ContentPage />} />
                  <Route path="/projects/bw-cctld" element={<ContentPage />} />
                  <Route path="/projects/bw-cirt" element={<ContentPage />} />
                  <Route path="/cybersecurity" element={<CybersecurityHubPage />} />
                  <Route path="/data-protection" element={<DataProtectionPage />} />
                  <Route path="/projects/electronic-evidence" element={<ContentPage />} />
                  <Route path="/projects/electronic-communications-transactions" element={<ContentPage />} />
                  <Route path="/projects/digital-switchover" element={<ContentPage />} />
                  <Route path="/projects/infrastructure-sharing" element={<ContentPage />} />
                  <Route path="/complaints" element={<ContentPage />} />
                  <Route path="/complaints/consumer-education" element={<ContentPage />} />
                  <Route path="/complaints/registering-complaints" element={<ContentPage />} />
                  <Route path="/technical/radio-frequency-plan" element={<ContentPage />} />
                  <Route path="/technical/radio-spectrum-planning" element={<ContentPage />} />
                  <Route path="/technical/numbering-plan" element={<ContentPage />} />
                  <Route path="/tariffs" element={<ContentPage />} />
                  <Route path="/faqs" element={<FAQsPage />} />
                  <Route path="/consultations" element={<ConsultationsPage />} />
                  <Route path="/api-docs" element={<ContentPage />} />
                  <Route path="*" element={<ContentPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          )}
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
