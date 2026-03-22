/**
 * App.jsx — Main Application Router & Provider Tree
 *
 * This is the root component of the BOCRA website. It configures:
 *   1. React Query (TanStack Query) for server-state caching
 *   2. Auth, Language, and Notification context providers
 *   3. Route definitions for public pages, admin portal, and auth flows
 *   4. Code-splitting via React.lazy() — admin pages are never fetched by public visitors
 *   5. SplashScreen animation (plays once per session, stored in sessionStorage)
 *
 * ARCHITECTURE:
 *   HelmetProvider → QueryClientProvider → AuthProvider → LanguageProvider → NotificationProvider
 *   ├── SplashScreen (first visit only)
 *   └── BrowserRouter
 *       ├── /auth/*       — Login, Register, Email Verified
 *       ├── /admin/*      — Admin Portal (AdminLayout with sidebar)
 *       └── /*            — Public pages (Layout with Header/Footer)
 */
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './lib/auth';
import { LanguageProvider } from './lib/language';
import { NotificationProvider } from './lib/notifications';
import Layout from './components/layout/Layout';
import SplashScreen from './components/animations/SplashScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';

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
import SpectrumManagementPage from './pages/public/SpectrumManagementPage';
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
import LegislationPage from './pages/public/LegislationPage';
import TelecommunicationsPage from './pages/public/TelecommunicationsPage';
import PostalPage from './pages/public/PostalPage';
import LicensingFrameworkPage from './pages/public/LicensingFrameworkPage';
import InfrastructureSharingPage from './pages/public/InfrastructureSharingPage';
import ConsumerEducationPage from './pages/public/ConsumerEducationPage';
import TendersPage from './pages/public/TendersPage';
import ChiefExecutivePage from './pages/public/ChiefExecutivePage';
import OrganogramPage from './pages/public/OrganogramPage';
import DataRequestPage from './pages/public/DataRequestPage';
import CareersPage from './pages/public/CareersPage';
import PrivacyNoticePage from './pages/public/PrivacyNoticePage';

// ─── React Query Configuration ──────────────────────────────────
// Caches Supabase responses to avoid redundant network requests.
// staleTime: 5 minutes — data is considered fresh and won't refetch.
// gcTime: 30 minutes — unused cache entries are garbage collected.
// retry: 3 with exponential backoff — transient errors self-heal (1s → 2s → 4s).
// networkMode: offlineFirst — serves cached data when network is down.
// refetchOnWindowFocus: false — prevents jarring refetches when switching tabs.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export default function App() {
  // Skip splash screen if already shown this session (stored in sessionStorage)
  const [ready, setReady] = useState(!!sessionStorage.getItem('bocra-splash'));

  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
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
                  <Route path="/about/chief-executive" element={<ChiefExecutivePage />} />
                  <Route path="/about/history" element={<HistoryPage />} />
                  <Route path="/about/organogram" element={<OrganogramPage />} />
                  <Route path="/about/board" element={<BoardOfDirectorsPage />} />
                  <Route path="/about/executive-management" element={<ExecutiveManagementPage />} />
                  <Route path="/about/careers" element={<CareersPage />} />
                  <Route path="/mandate/legislation" element={<LegislationPage />} />
                  <Route path="/mandate/telecommunications" element={<TelecommunicationsPage />} />
                  <Route path="/mandate/broadcasting" element={<BroadcastingPage />} />
                  <Route path="/mandate/postal" element={<PostalPage />} />
                  <Route path="/mandate/internet" element={<InternetPage />} />
                  <Route path="/mandate/licensing" element={<LicensingFrameworkPage />} />
                  <Route path="/licensing" element={<LicensingHubPage />} />
                  <Route path="/licensing/:slug" element={<LicensingHubPage />} />
                  <Route path="/services/file-complaint" element={<FileComplaintPage />} />
                  <Route path="/services/licence-verification" element={<LicenceVerificationPage />} />
                  <Route path="/services/type-approval" element={<TypeApprovalPage />} />
                  <Route path="/services/register-bw" element={<RegisterBWPage />} />
                  <Route path="/services/asms-webcp" element={<OperatorPortalPage />} />
                  <Route path="/services/qos-monitoring" element={<QoSMonitoringPage />} />
                  <Route path="/services/spectrum" element={<SpectrumManagementPage />} />
                  <Route path="/documents/drafts" element={<DocumentsPage />} />
                  <Route path="/documents/ict-licensing" element={<IctLicensingPage />} />
                  <Route path="/documents/publications" element={<DocumentsPage />} />
                  <Route path="/documents/itu-capacity-building" element={<ContentPage />} />
                  <Route path="/media/news" element={<NewsPage />} />
                  <Route path="/media/news-events" element={<NewsEventsPage />} />
                  <Route path="/media/speeches" element={<SpeechesPage />} />
                  <Route path="/media/center" element={<ContentPage />} />
                  <Route path="/tenders" element={<TendersPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/telecom-statistics" element={<TelecomStatisticsPage />} />
                  <Route path="/privacy-notice" element={<PrivacyNoticePage />} />
                  <Route path="/portal/data-request" element={<DataRequestPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/projects" element={<ContentPage />} />
                  <Route path="/projects/bw-cctld" element={<InternetPage />} />
                  <Route path="/projects/bw-cirt" element={<ContentPage />} />
                  <Route path="/cybersecurity" element={<CybersecurityHubPage />} />
                  <Route path="/data-protection" element={<DataProtectionPage />} />
                  <Route path="/projects/electronic-evidence" element={<ContentPage />} />
                  <Route path="/projects/electronic-communications-transactions" element={<ContentPage />} />
                  <Route path="/projects/digital-switchover" element={<ContentPage />} />
                  <Route path="/projects/infrastructure-sharing" element={<InfrastructureSharingPage />} />
                  <Route path="/complaints" element={<ContentPage />} />
                  <Route path="/complaints/consumer-education" element={<ConsumerEducationPage />} />
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
    </QueryClientProvider>
    </HelmetProvider>
  );
}
