/**
 * App.jsx - Main Application Router
 * All routes defined here. SplashScreen plays once on first visit.
 */
import { useState, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './lib/auth';
import { LanguageProvider } from './lib/language';
import { NotificationProvider } from './lib/notifications';
import Layout from './components/layout/Layout';
import SplashScreen from './components/animations/SplashScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';

// KEEP STATIC — auth page (needed immediately)
import LoginPage from './pages/auth/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';

// LAZY — all public page components
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutProfilePage = lazy(() => import('./pages/public/AboutProfilePage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const FileComplaintPage = lazy(() => import('./pages/public/FileComplaintPage'));
const NewsPage = lazy(() => import('./pages/public/NewsPage'));
const NewsEventsPage = lazy(() => import('./pages/public/NewsEventsPage'));
const FAQsPage = lazy(() => import('./pages/public/FAQsPage'));
const DocumentsPage = lazy(() => import('./pages/public/DocumentsPage'));
const ContentPage = lazy(() => import('./pages/public/ContentPage'));
const TelecomStatisticsPage = lazy(() => import('./pages/public/TelecomStatisticsPage'));
const LicenceVerificationPage = lazy(() => import('./pages/public/LicenceVerificationPage'));
const TypeApprovalPage = lazy(() => import('./pages/public/TypeApprovalPage'));
const SearchPage = lazy(() => import('./pages/public/SearchPage'));
const HistoryPage = lazy(() => import('./pages/public/HistoryPage'));
const BoardOfDirectorsPage = lazy(() => import('./pages/public/BoardOfDirectorsPage'));
const ExecutiveManagementPage = lazy(() => import('./pages/public/ExecutiveManagementPage'));
const LicensingHubPage = lazy(() => import('./pages/public/LicensingHubPage'));
const CybersecurityHubPage = lazy(() => import('./pages/public/CybersecurityHubPage'));
const RegisterBWPage = lazy(() => import('./pages/public/RegisterBWPage'));
const IctLicensingPage = lazy(() => import('./pages/public/IctLicensingPage'));
const OperatorPortalPage = lazy(() => import('./pages/public/OperatorPortalPage'));
const QoSMonitoringPage = lazy(() => import('./pages/public/QoSMonitoringPage'));
const SpectrumManagementPage = lazy(() => import('./pages/public/SpectrumManagementPage'));
const EmailVerifiedPage = lazy(() => import('./pages/auth/EmailVerifiedPage'));
const ConsultationsPage = lazy(() => import('./pages/public/ConsultationsPage'));
const SpeechesPage = lazy(() => import('./pages/public/SpeechesPage'));
const BroadcastingPage = lazy(() => import('./pages/public/BroadcastingPage'));
const InternetPage = lazy(() => import('./pages/public/InternetPage'));
const DataProtectionPage = lazy(() => import('./pages/public/DataProtectionPage'));
const LegislationPage = lazy(() => import('./pages/public/LegislationPage'));
const TelecommunicationsPage = lazy(() => import('./pages/public/TelecommunicationsPage'));
const PostalPage = lazy(() => import('./pages/public/PostalPage'));
const LicensingFrameworkPage = lazy(() => import('./pages/public/LicensingFrameworkPage'));
const InfrastructureSharingPage = lazy(() => import('./pages/public/InfrastructureSharingPage'));
const ConsumerEducationPage = lazy(() => import('./pages/public/ConsumerEducationPage'));
const TendersPage = lazy(() => import('./pages/public/TendersPage'));
const ChiefExecutivePage = lazy(() => import('./pages/public/ChiefExecutivePage'));
const OrganogramPage = lazy(() => import('./pages/public/OrganogramPage'));
const DataRequestPage = lazy(() => import('./pages/public/DataRequestPage'));
const CareersPage = lazy(() => import('./pages/public/CareersPage'));

// LAZY — admin pages (never fetched by public visitors)
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'));
const AdminComplaints = lazy(() => import('./pages/admin/ComplaintsPage'));
const AdminApplications = lazy(() => import('./pages/admin/ApplicationsPage'));
const AdminIncidents = lazy(() => import('./pages/admin/IncidentsPage'));
const AdminQoSReports = lazy(() => import('./pages/admin/QoSReportsPage'));
const AdminContact = lazy(() => import('./pages/admin/ContactPage'));
const AdminDataRequests = lazy(() => import('./pages/admin/DataRequestsPage'));
const AdminTypeApproval = lazy(() => import('./pages/admin/AdminTypeApprovalPage'));
const AdminConsultations = lazy(() => import('./pages/admin/AdminConsultationsPage'));
const AdminNews = lazy(() => import('./pages/admin/NewsManagerPage'));
const AdminDocuments = lazy(() => import('./pages/admin/DocumentsManagerPage'));
const AdminJobs = lazy(() => import('./pages/admin/JobsManagerPage'));
const AdminTenders = lazy(() => import('./pages/admin/TendersManagerPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [ready, setReady] = useState(!!sessionStorage.getItem('bocra-splash'));

  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          {!ready && <SplashScreen onComplete={() => setReady(true)} />}

          {ready && (
            <ErrorBoundary>
            <BrowserRouter basename="/hackbocra" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                  <Route path="news" element={<AdminNews />} />
                  <Route path="documents-manage" element={<AdminDocuments />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="tenders-manage" element={<AdminTenders />} />
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
                  <Route path="/privacy-notice" element={<ContentPage />} />
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
            </ErrorBoundary>
          )}
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
}
