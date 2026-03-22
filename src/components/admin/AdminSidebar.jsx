/**
 * AdminSidebar — Dark navigation sidebar for the admin portal.
 *
 * Features:
 * - Dark background (#001A3A) with white text
 * - Active item highlighted with cyan (#00A6CE)
 * - Badge counts for new complaints, pending applications, open incidents
 * - BOCRA logo at top, admin name + logout at bottom
 * - Collapses to hamburger on mobile
 */

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertCircle,
  FileCheck,
  Shield,
  Mail,
  UserCheck,
  LogOut,
  Menu,
  X,
  Zap,
  Smartphone,
  MessageSquare,
  Newspaper,
  FolderOpen,
  Briefcase,
  ScrollText,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import BocraLogo from '../ui/BocraLogo';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/complaints', label: 'Complaints', icon: AlertCircle, countKey: 'complaints' },
  { to: '/admin/applications', label: 'Licence Applications', icon: FileCheck, countKey: 'applications' },
  { to: '/admin/incidents', label: 'Cyber Incidents', icon: Shield, countKey: 'incidents' },
  { to: '/admin/contact', label: 'Contact Submissions', icon: Mail },
  { to: '/admin/consultations', label: 'Consultations', icon: MessageSquare },
  { to: '/admin/type-approval', label: 'Type Approval Devices', icon: Smartphone },
  { to: '/admin/data-requests', label: 'Data Requests', icon: UserCheck, countKey: 'dataRequests' },
  { to: '/admin/automation', label: 'Automation', icon: Zap },
  { section: 'Content Management' },
  { to: '/admin/news', label: 'News & Articles', icon: Newspaper },
  { to: '/admin/documents-manage', label: 'Documents', icon: FolderOpen },
  { to: '/admin/jobs', label: 'Jobs / Careers', icon: Briefcase },
  { to: '/admin/tenders-manage', label: 'Tenders', icon: ScrollText },
];

export default function AdminSidebar({ profile }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState({ complaints: null, applications: null, incidents: null, dataRequests: null });

  useEffect(() => {
    fetchCounts();
  }, []);

  async function fetchCounts() {
    try {
      const [complaintsRes, applicationsRes, incidentsRes, dataRequestsRes] = await Promise.allSettled([
        supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('licence_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('cyber_incidents').select('id', { count: 'exact', head: true }).in('status', ['received', 'investigating']),
        supabase.from('data_requests').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'verified', 'in_progress']),
      ]);
      // Extract count only when the query truly succeeded (no Supabase-level error).
      // Return null for failures so the UI hides the badge rather than showing a false 0.
      const safeCount = (res) => {
        if (res.status !== 'fulfilled') return null;
        if (res.value.error) return null;
        return res.value.count ?? null;
      };
      setCounts({
        complaints: safeCount(complaintsRes),
        applications: safeCount(applicationsRes),
        incidents: safeCount(incidentsRes),
        dataRequests: safeCount(dataRequestsRes),
      });
    } catch {
      // Counts are non-critical — fail silently
    }
  }

  async function handleLogout() {
    sessionStorage.removeItem('bocra-admin-session');
    await signOut();
    navigate('/auth/login');
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo — entire block links to public homepage */}
      <Link
        to="/"
        onClick={() => setMobileOpen(false)}
        className="block px-5 py-6 border-b border-white/10 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00A6CE]/40 cursor-pointer no-underline text-inherit"
        aria-label="Go to BOCRA homepage"
      >
        <BocraLogo white height={36} className="pointer-events-none" />
        <p className="text-[10px] text-cyan-300 mt-1 tracking-widest uppercase pointer-events-none">Admin Portal</p>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) =>
          item.section ? (
            <p key={item.section} className="text-[10px] text-gray-500 uppercase tracking-widest px-3 pt-4 pb-1 font-medium">
              {item.section}
            </p>
          ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#00A6CE]/15 text-[#00A6CE]'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {item.countKey && counts[item.countKey] > 0 && (
              <span className="bg-[#C8237B] text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {counts[item.countKey]}
              </span>
            )}
          </NavLink>
          )
        )}
      </nav>

      {/* Admin info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#00A6CE]/20 flex items-center justify-center text-[#00A6CE] text-xs font-bold">
            {(profile?.full_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-[10px] text-gray-400 capitalize">{profile?.role || 'admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm w-full px-1 py-1.5 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-[#001A3A] text-white rounded-lg shadow-lg"
        aria-label="Open admin menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#001A3A] transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close admin menu"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-[#001A3A] flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
