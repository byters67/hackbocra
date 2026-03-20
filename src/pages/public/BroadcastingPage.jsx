/**
 * BroadcastingPage.jsx — BOCRA Broadcasting Mandate
 * 
 * Real content from BOCRA's broadcasting regulation mandate.
 * Route: /mandate/broadcasting
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Radio, Tv, Music, Globe, Users, Shield,
  MapPin, Wifi, Award, FileText, ExternalLink, BarChart3
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';

const BASE = import.meta.env.BASE_URL || '/';

/* ── Licensed Broadcasters ── */
const RADIO_STATIONS = [
  {
    name: 'Yarona FM',
    type: 'Commercial Radio',
    frequency: '106.6 MHz',
    coverage: 'Major towns and villages nationwide',
    online: true,
    color: '#00A6CE',
    desc: 'One of Botswana\'s leading commercial radio stations, available in most major towns and villages. Accessible worldwide via online streaming.',
  },
  {
    name: 'Duma FM',
    type: 'Commercial Radio',
    frequency: '93.0 MHz',
    coverage: 'Major towns and villages nationwide',
    online: true,
    color: '#C8237B',
    desc: 'Popular commercial radio station available across Botswana\'s urban and semi-urban areas. Extended worldwide reach through online transmission.',
  },
  {
    name: 'Gabz FM',
    type: 'Commercial Radio',
    frequency: '96.2 MHz',
    coverage: 'Major towns and villages nationwide',
    online: true,
    color: '#6BBE4E',
    desc: 'Commercial radio station serving communities across Botswana. Accessible globally through online broadcasting platforms.',
  },
];

const TV_STATIONS = [
  {
    name: 'eBotswana',
    type: 'Commercial Television',
    coverage: 'Gaborone and surrounding villages (60km radius)',
    method: 'Terrestrial Broadcasting',
    future: 'Satellite broadcast service planned for national coverage',
    color: '#F7B731',
    desc: 'Botswana\'s commercial television station, currently available through terrestrial broadcasting in the Greater Gaborone area.',
  },
];

export default function BroadcastingPage() {
  const heroRef = useScrollReveal();
  const cardsRef = useStaggerReveal({ stagger: 0.1 });

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate/50">Mandate</span>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">Broadcasting</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero
        category="MANDATE"
        title="Broadcasting"
        description="The CRA Act mandates BOCRA to regulate all broadcasting, subscription management services and re-broadcasting activities save for the state broadcasting."
        color="magenta"
      />

      {/* Overview */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-bocra-slate mb-3">Broadcasting Regulation in Botswana</h2>
                <p className="text-sm text-bocra-slate/70 leading-relaxed">
                  The Communications Regulatory Authority Act mandates BOCRA to regulate all broadcasting, subscription management services and re-broadcasting activities save for state broadcasting. It is in this light that BOCRA regulates Yarona FM, Duma FM, Gabz FM and eBotswana.
                </p>
                <p className="text-sm text-bocra-slate/70 leading-relaxed mt-3">
                  Commercial radio stations namely Yarona, Duma, Gabz FM are all available in most major towns and villages in Botswana. The stations have extended access to their services through online broadcasting transmission which makes them accessible worldwide.
                </p>
                <p className="text-sm text-bocra-slate/70 leading-relaxed mt-3">
                  eBotswana television station is currently available in Gaborone and surrounding villages within a 60km radius of Gaborone through terrestrial broadcasting. eBotswana will in future introduce a satellite broadcast service in order to achieve national coverage.
                </p>
              </div>

              {/* Licensed Radio Stations */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2">
                  <Radio size={18} className="text-[#C8237B]" /> Licensed Commercial Radio Stations
                </h3>
                <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {RADIO_STATIONS.map(station => (
                    <div key={station.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                      <div className="h-2" style={{ background: station.color }} />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${station.color}15` }}>
                            <Radio size={16} style={{ color: station.color }} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-bocra-slate">{station.name}</h4>
                            <p className="text-[10px] text-gray-400">{station.type}</p>
                          </div>
                        </div>
                        <p className="text-xs text-bocra-slate/60 leading-relaxed mb-3">{station.desc}</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={11} className="text-gray-400" />
                            <span>{station.coverage}</span>
                          </div>
                          {station.online && (
                            <div className="flex items-center gap-2 text-xs text-[#6BBE4E]">
                              <Globe size={11} />
                              <span>Online streaming worldwide</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Licensed Television */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2">
                  <Tv size={18} className="text-[#F7B731]" /> Licensed Commercial Television
                </h3>
                {TV_STATIONS.map(station => (
                  <div key={station.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                    <div className="h-2" style={{ background: station.color }} />
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${station.color}15` }}>
                          <Tv size={20} style={{ color: station.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-bocra-slate">{station.name}</h4>
                          <p className="text-[10px] text-gray-400 mb-2">{station.type}</p>
                          <p className="text-xs text-bocra-slate/60 leading-relaxed mb-3">{station.desc}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin size={11} className="text-gray-400" />
                              <span>{station.coverage}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Wifi size={11} className="text-gray-400" />
                              <span>{station.method}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#00A6CE]">
                              <BarChart3 size={11} />
                              <span>{station.future}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Local Content Requirements */}
              <div className="bg-[#C8237B]/5 rounded-xl border border-[#C8237B]/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#C8237B]/10 flex items-center justify-center flex-shrink-0">
                    <Music size={18} className="text-[#C8237B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-bocra-slate mb-1">Local Content Requirements</h3>
                    <p className="text-xs text-bocra-slate/60 leading-relaxed">
                      Broadcasters are required to promote music tracks by local artists. Broadcasters' licences specify a certain percentage of local content to be complied with, promoting Botswana culture, talent, and perspectives in the media landscape.
                    </p>
                  </div>
                </div>
              </div>

              {/* Online Broadcasting */}
              <div className="bg-[#00A6CE]/5 rounded-xl border border-[#00A6CE]/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00A6CE]/10 flex items-center justify-center flex-shrink-0">
                    <Globe size={18} className="text-[#00A6CE]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-bocra-slate mb-1">Online Broadcasting</h3>
                    <p className="text-xs text-bocra-slate/60 leading-relaxed">
                      Commercial radio stations have extended access to their services through online broadcasting transmission, making them accessible worldwide. This extends BOCRA's regulatory mandate into digital broadcasting platforms.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Broadcasting Sector</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Licensed Radio Stations', value: '3', icon: Radio, color: '#C8237B' },
                    { label: 'Licensed TV Stations', value: '1', icon: Tv, color: '#F7B731' },
                    { label: 'Online Streaming', value: 'All Radio', icon: Globe, color: '#6BBE4E' },
                    { label: 'Local Content', value: 'Required', icon: Music, color: '#00A6CE' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}>
                        <s.icon size={15} style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-bocra-slate">{s.value}</p>
                        <p className="text-[10px] text-gray-400">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Pages */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Related Pages</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Telecommunications', path: '/mandate/telecommunications', icon: Wifi, color: '#00A6CE' },
                    { label: 'Postal Services', path: '/mandate/postal', icon: FileText, color: '#F7B731' },
                    { label: 'Internet & ICT', path: '/mandate/internet', icon: Globe, color: '#6BBE4E' },
                    { label: 'Apply for Licence', path: '/licensing', icon: Award, color: '#C8237B' },
                    { label: 'File a Complaint', path: '/services/file-complaint', icon: Shield, color: '#00458B' },
                  ].map(link => (
                    <Link key={link.path} to={link.path}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-all group">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${link.color}12` }}>
                        <link.icon size={13} style={{ color: link.color }} />
                      </div>
                      <span className="text-xs font-medium text-bocra-slate/70 group-hover:text-bocra-slate">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Broadcasting Code */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Broadcasting Code of Conduct</h3>
                <p className="text-xs text-bocra-slate/50 leading-relaxed mb-3">
                  BOCRA has published a Broadcasting Code of Conduct that sets standards for content, advertising, and ethical broadcasting practices.
                </p>
                <Link to="/media/speeches" className="text-xs text-[#C8237B] font-medium hover:underline flex items-center gap-1">
                  View Related Speeches <ChevronRight size={12} />
                </Link>
              </div>

              {/* Contact */}
              <div className="bg-bocra-off-white rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">Broadcasting Enquiries</p>
                <p className="text-xs text-bocra-slate/60 leading-relaxed mb-2">
                  For enquiries about broadcasting licences, content requirements, or regulatory compliance.
                </p>
                <div className="space-y-1.5">
                  <a href="mailto:info@bocra.org.bw" className="flex items-center gap-2 text-xs text-[#00458B] hover:underline">
                    info@bocra.org.bw
                  </a>
                  <a href="tel:+2673957755" className="flex items-center gap-2 text-xs text-[#00458B] hover:underline">
                    +267 395 7755
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colour bar */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" />
        <div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" />
      </div>
    </div>
  );
}
