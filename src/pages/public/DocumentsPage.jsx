/**
 * Documents & Legislation Page — Redesigned
 * Category cards → click to see documents. Search across all. Fully bilingual.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Search, Download, FileText, Scale, BookOpen, BarChart3,
  Shield, Radio, Wifi, Signal, FileCheck, Settings, Users, MapPin, Cpu,
  AlertCircle, Globe, X, ArrowLeft, FolderOpen
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const BASE = import.meta.env.BASE_URL;

const getCATEGORY_CONFIG = (lang) => {
  const tn = lang === 'tn';
  return {
  'Legislation': { name: tn ? 'Melao' : 'Legislation', color: '#C8237B', icon: Scale, desc: tn ? 'Melao, dikaelo, le didirisiwa tsa molao' : 'Acts, bills, regulations and legal instruments' },
  'Annual Reports': { name: tn ? 'Dipego tsa Ngwaga' : 'Annual Reports', color: '#00A6CE', icon: BookOpen, desc: tn ? 'Dipego tsa ngwaga le ngwaga tsa BOCRA le BTA' : 'BOCRA and BTA annual reports' },
  'Guidelines & Standards': { name: tn ? 'Ditaelo le Maemo' : 'Guidelines & Standards', color: '#6BBE4E', icon: Shield, desc: tn ? 'Ditaelo tsa taolo, melao ya maitsholo le maemo' : 'Regulatory guidelines, codes of conduct and standards' },
  'Licensing': { name: tn ? 'Dilaesense' : 'Licensing', color: '#F7B731', icon: FileCheck, desc: tn ? 'Dithulaganyo tsa dilaesense, dikopo le ditlhokego' : 'Licensing frameworks, applications and requirements' },
  'Technical Specifications': { name: tn ? 'Maemo a Setegeniki' : 'Technical Specifications', color: '#7C3AED', icon: Cpu, desc: tn ? 'Maemo a didirisiwa le dintlha tsa tumelelo ya mofuta' : 'Equipment standards and type approval specifications' },
  'Consultation Papers': { name: tn ? 'Dipampiri tsa Ditherisano' : 'Consultation Papers', color: '#0891B2', icon: Users, desc: tn ? 'Dikwalo tsa ditherisano tsa setshaba le dipampiri tsa dipuisano' : 'Public consultation documents and discussion papers' },
  'Measurement Reports': { name: tn ? 'Dipego tsa Ditekanyo' : 'Measurement Reports', color: '#DC2626', icon: Signal, desc: tn ? 'Dipego tsa ditekanyo tsa EMF le lefelo' : 'EMF and site measurement reports' },
  'Broadband & Internet': { name: tn ? 'Inthanete ya Lobelo' : 'Broadband & Internet', color: '#2563EB', icon: Wifi, desc: tn ? 'Leano la inthanete ya lobelo, ditlhwatlhwa le kgolagano' : 'Broadband strategy, internet pricing and connectivity' },
  'Spectrum & Frequency': { name: tn ? 'Sepeketeramo le Frikwensi' : 'Spectrum & Frequency', color: '#059669', icon: Signal, desc: tn ? 'Mananeo a frikwensi ya radio le tsamaiso ya sepeketeramo' : 'Radio frequency plans and spectrum management' },
  'Consumer Protection': { name: tn ? 'Tshireletso ya Badirisi' : 'Consumer Protection', color: '#E11D48', icon: AlertCircle, desc: tn ? 'Go tsamaisa dingongorego, dipholisi tsa badirisi le KYC' : 'Complaints handling, consumer policies and KYC' },
  'Rulings & Disputes': { name: tn ? 'Ditshwetso le Dikganetsano' : 'Rulings & Disputes', color: '#9333EA', icon: Scale, desc: tn ? 'Ditharabololo tsa dikganetsano, dikatlholo le ditshwetso' : 'Dispute resolutions, judgments and rulings' },
  'Forms & Applications': { name: tn ? 'Diforomo le Dikopo' : 'Forms & Applications', color: '#0284C7', icon: FileText, desc: tn ? 'Diforomo tsa dikopo le dipotsolotso' : 'Application forms and questionnaires' },
  'Numbering Plan': { name: tn ? 'Leano la Dinomoro' : 'Numbering Plan', color: '#4F46E5', icon: Settings, desc: tn ? 'Mananeo a bosetshaba a dinomoro le dikabelo' : 'National numbering plans and allocations' },
  'Research & Publications': { name: tn ? 'Dipatlisiso le Dikgatiso' : 'Research & Publications', color: '#B45309', icon: BarChart3, desc: tn ? 'Dithuto tsa mmaraka, dipatlisiso le ditlhagiso' : 'Market studies, surveys, presentations and research' },
  'Policy': { name: tn ? 'Dipholisi' : 'Policy', color: '#0D9488', icon: Globe, desc: tn ? 'Dipholisi, maano, ditaelo le dikitsiso tsa setshaba' : 'Policies, strategies, directives and public notices' },
  'EMF & Health': { name: tn ? 'EMF le Boitekanelo' : 'EMF & Health', color: '#BE185D', icon: MapPin, desc: tn ? 'Go amiwa ke mafelo a electromagnetic le dipatlisiso tsa boitekanelo' : 'Electromagnetic field exposure and health research' },
  'Broadcasting': { name: tn ? 'Phasalatso' : 'Broadcasting', color: '#EA580C', icon: Radio, desc: tn ? 'Melao ya phasalatso, ditaelo tsa ditlhopho le dikitsiso' : 'Broadcasting codes, election guidelines and notices' },
};};

const DOCUMENTS = [
  // LEGISLATION
  { title: 'Communications Regulatory Authority Act, 2012', file: 'COMMUNICATIONS REGULATORY ACT, 2012.pdf', category: 'Legislation', year: '2012' },
  { title: 'Competition Act, 2018', file: '04 Act 20-04-2018 COMPETITION.pdf', category: 'Legislation', year: '2018' },
  { title: 'Consumer Protection Act, 2018', file: '05 Act 20_04_2018 CONSUMER PROTECTION.pdf', category: 'Legislation', year: '2018' },
  { title: 'Cybercrime and Computer Related Crimes Act, 2018', file: '18 Act 29-06-2018 Cybercrime and Computer Related Crimes.pdf', category: 'Legislation', year: '2018' },
  { title: 'Cybersecurity Act, 2025', file: 'Cybersecurity_ACT_-_5 Nov_2025.pdf', category: 'Legislation', year: '2025' },
  { title: 'Digital Services Act, 2025', file: 'digital_services_ACT.pdf', category: 'Legislation', year: '2025' },
  { title: 'Digital Services Bill (Revised Draft), 2025', file: 'Digital_Services_Bill_(revised_draft)June2025_0.pdf', category: 'Legislation', year: '2025' },
  { title: 'Draft Cybersecurity Bill 2025', file: 'Draft_Cybersecurity_Bill_2025_AG_Comments.pdf', category: 'Legislation', year: '2025' },
  { title: 'Preamble - Digital Services Bill', file: 'Preamble_for_the_Digital_Services_Bill_Revised.pdf', category: 'Legislation', year: '2025' },
  { title: 'Preamble - Cybersecurity Bill', file: 'Preamble_to_the_Cybersecurity_Bill_Revised.pdf', category: 'Legislation', year: '2025' },
  { title: 'Electronic Communications and Transactions Act, 2014', file: 'Electronic-Communications-and-Transactions-Act-2014.pdf', category: 'Legislation', year: '2014' },
  { title: 'Electronic Communications and Transactions Regulations, 2016', file: 'Electronic Communications and Transactions Act Regulations 2016.pdf', category: 'Legislation', year: '2016' },
  { title: 'Electronic Records (Evidence) Act, 2014', file: 'Electronic Records and Evidence Act 2014.pdf', category: 'Legislation', year: '2014' },
  { title: 'Electronic Records Act', file: 'Electronic Records Act.pdf', category: 'Legislation', year: '2014' },
  { title: 'Electronic Records (Evidence) Regulations, 2015', file: 'Electronic-Records_(Evidence)_Regulations-Dec _2015fr.pdf', category: 'Legislation', year: '2015' },
  { title: 'Data Protection Act, 2018', file: '32 Act 10-08-2018-Data Protection.pdf', category: 'Legislation', year: '2018' },
  { title: 'Data Protection Act', file: 'DataProtectionAct.pdf', category: 'Legislation', year: '2018' },
  { title: 'Broadcasting Act', file: 'BROADCASTING ACT.pdf', category: 'Legislation', year: '2012' },
  { title: 'Broadcasting Regulations', file: 'BROADCASTING REGULATIONS.pdf', category: 'Legislation', year: '2012' },
  { title: 'Broadcasting (Fees) Regulations', file: 'Broadcasting (Fees) Regulations.pdf', category: 'Legislation', year: '2012' },
  { title: 'Telecommunications Regulations', file: 'TELECOMMUNICATIONS REGULATIONS.pdf', category: 'Legislation', year: '2012' },
  { title: 'CRA Regulations 2022', file: 'Communications_Regulatory_Authority_Regulations_2022_0.pdf', category: 'Legislation', year: '2022' },
  { title: 'Draft BOCRA Regulations', file: 'DRAFT BOCRA REGULATIONS - Final.pdf', category: 'Legislation', year: '2017' },
  { title: 'Draft CRA Regulations, Dec 2017', file: 'Draft CRA Regulations-Dec 2017.pdf', category: 'Legislation', year: '2017' },
  { title: 'SADC Home and Away Roaming Regulations, 2015', file: '2015_SADC  HOME AND AWAY  ROAMING REGULATIONS.pdf', category: 'Legislation', year: '2015' },
  { title: 'Financial Intelligence Act, 2009', file: 'Financial_Intelligence_Act_2009.pdf', category: 'Legislation', year: '2009' },
  { title: 'Financial Intelligence (Amendment) Act, 2018', file: 'Financial_Intelligence_(Amendment)_Act_2018.pdf', category: 'Legislation', year: '2018' },
  { title: 'Financial Intelligence (Amendment) Regulations, 2018', file: 'Financial_Intelligence_(Amendment)_Regulations_2018.pdf', category: 'Legislation', year: '2018' },
  { title: 'FIA Regulations', file: 'FIA_Regulations.pdf', category: 'Legislation', year: '2018' },
  { title: 'Electronic Communications Act, 2017', file: '31 Act 10-08-2017-electro comm and trans .pdf', category: 'Legislation', year: '2017' },

  // ANNUAL REPORTS
  { title: 'BOCRA Annual Report 2025', file: 'BOCRA2025_ANNUAL_REPORT_(WEB)_compressed.pdf', category: 'Annual Reports', year: '2025' },
  { title: 'BOCRA Annual Report 2024', file: 'BOCRA 2024 ANNUAL REPORT WEB VERSION.pdf', category: 'Annual Reports', year: '2024' },
  { title: 'BOCRA Annual Report 2023', file: '2023 Bocra Annual Report 08012024.pdf', category: 'Annual Reports', year: '2023' },
  { title: 'BOCRA Annual Report 2022', file: 'BOCRA_Annual_Report-2022.pdf', category: 'Annual Reports', year: '2022' },
  { title: 'BOCRA Annual Report 2020', file: '3717H_BOCRA_Annual_Report_V20.pdf', category: 'Annual Reports', year: '2020' },
  { title: 'BOCRA Annual Report 2019', file: 'Bocra-AR19-web.pdf', category: 'Annual Reports', year: '2019' },
  { title: 'BOCRA Annual Report 2018', file: 'BOCRA_Annual_Report_2018.pdf', category: 'Annual Reports', year: '2018' },
  { title: 'BOCRA Annual Report 2017', file: 'BOCRA AR 2017 DIGITAL FINAL.pdf', category: 'Annual Reports', year: '2017' },
  { title: 'BOCRA Annual Report 2016', file: 'BOCRA Annual Report 2016 (web)_0.pdf', category: 'Annual Reports', year: '2016' },
  { title: 'BOCRA Annual Report 2015', file: 'BOCRA Annual Report 2015 Web.pdf', category: 'Annual Reports', year: '2015' },
  { title: 'BOCRA Annual Report 2014', file: 'BOCRA Annual Report 2014_0.pdf', category: 'Annual Reports', year: '2014' },
  { title: 'BTA Annual Report 2013', file: 'BTA AR 2013 web.pdf', category: 'Annual Reports', year: '2013' },
  { title: 'BTA Annual Report 2012', file: 'BTA 2012 AR web.pdf', category: 'Annual Reports', year: '2012' },
  { title: 'BTA Annual Report 2011', file: 'BTA_2011_Annual_Report.pdf', category: 'Annual Reports', year: '2011' },
  { title: 'BTA Annual Report 2010', file: 'BTA Annual Report 2010.pdf', category: 'Annual Reports', year: '2010' },
  { title: 'BTA Annual Report 2009 (English)', file: 'BTA Annual Report 2009 English.pdf', category: 'Annual Reports', year: '2009' },
  { title: 'BTA Annual Report 2009 (Setswana)', file: 'BTA Annual Report 2009 Setswana.pdf', category: 'Annual Reports', year: '2009' },
  { title: 'BTA Annual Report 2008 (English)', file: 'BTA Annual Report 2008 English.pdf', category: 'Annual Reports', year: '2008' },
  { title: 'BTA Annual Report 2008 (Setswana)', file: 'BTA Annual Report 2008 Setswana.pdf', category: 'Annual Reports', year: '2008' },
  { title: 'BTA Annual Report 2005-2006', file: 'BTA Annual Report 2005 - 2006.pdf', category: 'Annual Reports', year: '2006' },
  { title: 'UASF Annual Report', file: 'UASF_ANNUAL_REPORT_-_FINAL_(edited)_(2).pdf', category: 'Annual Reports', year: '2023' },
  { title: 'Broadband Facts and Figures 2021', file: 'Broadband-Facts-and-Figures-2021-FINAL-DRAFT-21-Dec-21.pdf', category: 'Annual Reports', year: '2021' },
  { title: 'Broadband Facts and Figures 2020', file: 'Broadband Facts and Figures DECEMBER 2020.pdf', category: 'Annual Reports', year: '2020' },
  { title: 'Telecoms Statistics March 2021', file: 'MARCH_2021_BOCRA_TELECOMS_STATISTICS.pdf', category: 'Annual Reports', year: '2021' },

  // GUIDELINES & STANDARDS
  { title: 'QoS/QoE Guidelines 2025 (Revised)', file: '2025_Revised_QoS_QoE_Guidelines.pdf', category: 'Guidelines & Standards', year: '2025' },
  { title: 'QoS/QoE Guidelines 2023', file: 'QoS_QoE_Guidelines_2023.pdf', category: 'Guidelines & Standards', year: '2023' },
  { title: 'QoS/QoE Guidelines (Final)', file: 'QoS_QoE  Guidelines  Final.pdf', category: 'Guidelines & Standards', year: '2020' },
  { title: 'Quality of Service Guidelines 2013', file: 'QUALITY OF SERVICE GUIDELINES 2013.pdf', category: 'Guidelines & Standards', year: '2013' },
  { title: 'Business Continuity and Disaster Recovery Guidelines', file: 'APPROVED SECTOR GUIDELINES ON BUSINESS CONTINUITY AND DISASTER RECOVERY.pdf', category: 'Guidelines & Standards', year: '2022' },
  { title: 'Advertising Code for Broadcasters, 2019', file: 'Advertising Code for Broadcasters December 2019.pdf', category: 'Guidelines & Standards', year: '2019' },
  { title: 'Code of Conduct for Broadcasters', file: 'Code of Conduct for Broadcasters.pdf', category: 'Guidelines & Standards', year: '2015' },
  { title: 'Broadcasting Election Code of Conduct, 2019', file: 'FINAL-Broadcasting-Election-Code-of-Conduct-JULY-2019.pdf', category: 'Guidelines & Standards', year: '2019' },
  { title: 'Website Application Security Guidelines', file: 'Website_Application_Security_Guidelines.pdf', category: 'Guidelines & Standards', year: '2018' },
  { title: 'Email Security Guidelines', file: 'Email Security Guidelines - BOCRA.pdf', category: 'Guidelines & Standards', year: '2018' },
  { title: 'Baseline Security Requirements', file: 'Baseline_Security_Requirements.pdf', category: 'Guidelines & Standards', year: '2024' },
  { title: 'EMF Exposure Guidelines 2024', file: 'BOCRA_Electromagnetic_Guidelines_2024_V5_Online.pdf', category: 'Guidelines & Standards', year: '2024' },
  { title: 'ICNIRP EMF Exposure Guidelines', file: 'ICNIRP-Guidelines_of_exposure_to_EMF.pdf', category: 'Guidelines & Standards', year: '2009' },
  { title: 'Enforcement Guidelines (Final)', file: 'FINAL BOCRA Enforcement Guidelines.pdf', category: 'Guidelines & Standards', year: '2020' },
  { title: 'Local Content Guidelines (Draft)', file: 'DRAFT_DISCUSSION_PAPER_-_LOCAL_CONTENT_GUIDELINES.pdf', category: 'Guidelines & Standards', year: '2024' },
  { title: 'Infrastructure Sharing Guidelines', file: 'Development_of_Guidelines_on_Infrastructure_Sharing_in_Botswana.pdf', category: 'Guidelines & Standards', year: '2011' },
  { title: 'Guidelines for Application of Licences', file: 'Guidelines For Application Of Licences.pdf', category: 'Guidelines & Standards', year: '2015' },
  { title: 'Internet Connectivity in Hospitality Guidelines', file: 'Guidelines on Internet Connectivity in Hospitality Facilities_0.pdf', category: 'Guidelines & Standards', year: '2019' },
  { title: 'Interconnection Guidelines', file: 'INTERCONNECTION_GUIDELINES.pdf', category: 'Guidelines & Standards', year: '2013' },
  { title: 'IPv6 Migration Guidelines 2024', file: 'INTERNET_PROTOCOL_VERSION_6_(IPv6)_MIGRATION_GUIDELINES_2024_0.pdf', category: 'Guidelines & Standards', year: '2024' },
  { title: 'SRDs Guidelines, 2022', file: 'Annexure_3.3.2A_SRDs_Guidelines_Feb_2022.pdf', category: 'Guidelines & Standards', year: '2022' },
  { title: 'Tariff Guidelines 2011', file: 'Tariff_Guidelines_2011.pdf', category: 'Guidelines & Standards', year: '2011' },

  // LICENSING (abbreviated - key docs)
  { title: 'ICT Licensing Framework', file: 'ICT Licensing Framework_0.pdf', category: 'Licensing', year: '2015' },
  { title: 'BOCRA Licensing Framework (2015)', file: 'September 2015 BOCRA Licensing Framework.pdf', category: 'Licensing', year: '2015' },
  { title: 'Licensing Framework Consolidated', file: 'Licensing Framework Consolidated - document.pdf', category: 'Licensing', year: '2015' },
  { title: 'Unified Licensing Framework Consultation', file: 'CONSULTATION PAPER ON THE UNIFIED LICENSING FRAMEWORK (ULF) FOR BOTSWANA.pdf', category: 'Licensing', year: '2015' },
  { title: 'ICT Licence Application Requirements & Fees', file: 'ICT_LICENCE_APPLICATION_REQUIREMENTS_AND_FEES.pdf', category: 'Licensing', year: '2015' },
  { title: 'Campus Radio Licensing Framework', file: 'Campus Radio Licensing Framework.pdf', category: 'Licensing', year: '2024' },
  { title: 'Broadcasting Provisional Licence Application', file: 'BROADCASTING_PROVISIONAL_LICENCE_APPLICATION_REQUIREMENTS.pdf', category: 'Licensing', year: '2024' },
  { title: 'Commercial Broadcasting Licences Invitation', file: 'BOCRA INVITATION TO APPLY FOR COMMERCIAL BROADCASTING LICENCES.pdf', category: 'Licensing', year: '2024' },
  { title: 'CPO Provisional Licence Application', file: 'CPO_PROVISIONAL_LICENCE_APPLICATION_REQUIREMENTS.pdf', category: 'Licensing', year: '2024' },
  { title: 'NFP Provisional Licence Application', file: 'NFP_PROVISIONAL_LICENCE_APPLICATION_REQUIREMENTS.pdf', category: 'Licensing', year: '2024' },
  { title: 'SAP Provisional Licence Application', file: 'SAP_PROVISIONAL_LICENCE_APPLICATION_REQUIREMENTS.pdf', category: 'Licensing', year: '2024' },
  { title: 'FBO Licence', file: 'FBO Licence.pdf', category: 'Licensing', year: '2015' },
  { title: 'FBO Licence Schedule', file: 'FBO Licence Schedule.pdf', category: 'Licensing', year: '2015' },
  { title: 'Network Facilities Licence', file: 'Network Facilities License_0.pdf', category: 'Licensing', year: '2015' },
  { title: 'Service and Application Licence', file: 'Service and Application License_0.pdf', category: 'Licensing', year: '2015' },
  { title: 'Generic VANS Licence', file: 'Copy of Generic VANS Licence_0.pdf', category: 'Licensing', year: '2015' },
  { title: 'IP Television Service Licence', file: 'CSP - IP Television service license.pdf', category: 'Licensing', year: '2016' },
  { title: 'Licensing Fee Structure', file: 'Licensing Fee Structure.pdf', category: 'Licensing', year: '2015' },
  { title: 'Radio Licence Fees', file: 'RADIO LICENSE FEES.pdf', category: 'Licensing', year: '2015' },
  { title: 'Licensed Operators Register', file: 'LICENSED_OPERATORS.pdf', category: 'Licensing', year: '2024' },
  { title: 'Updated Licensed VANS', file: 'Updated BOCRA Licensed VANS.pdf', category: 'Licensing', year: '2023' },
  { title: 'Licence Revocation Procedures', file: 'Telecommunication_Licence_Revocation_Procedures.pdf', category: 'Licensing', year: '2013' },
  { title: 'Spectrum Licensing and Pricing Policy', file: 'A new policy for spectrum licensing and spectrum pricing in Botswana.pdf', category: 'Licensing', year: '2015' },
  { title: 'Aircraft Radio Licence Application', file: 'Aircraft Radio Licence Application.pdf', category: 'Licensing', year: '2015' },
  { title: 'Cellular Licence Application', file: 'Cellular Licence Application.pdf', category: 'Licensing', year: '2015' },
  { title: 'Citizen Band Radio Licence Application', file: 'Citizen Band Radio Licence Application.pdf', category: 'Licensing', year: '2015' },
  { title: 'Private Radio Licence Application', file: 'APPLICATION FOR PRIVATE RADIO COMMUNICATION LICENCE_0.pdf', category: 'Licensing', year: '2015' },
  { title: 'Point-to-Point Application', file: 'Point-To-Point Application.pdf', category: 'Licensing', year: '2015' },
  { title: 'Point-to-Multipoint Application', file: 'Point-to-Multipoint Licence Application.pdf', category: 'Licensing', year: '2015' },
  { title: 'Satellite Service Application', file: 'Satelllite Service Application Form.pdf', category: 'Licensing', year: '2015' },
  { title: 'TV Broadcasting Licence Application', file: 'Television and Sound Broadcasting Licence Application Form_0.pdf', category: 'Licensing', year: '2015' },
  { title: 'Products and Services (Sept 2016)', file: 'Products and Services-September 2016.pdf', category: 'Licensing', year: '2016' },

  // TECHNICAL SPECIFICATIONS (top entries - the file has 83 total)
  { title: 'GSM Base Station Equipment', file: 'GSM Base Station and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'GSM Handsets and Terminals', file: 'GSM Handsets Terminals and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'LTE Base Stations Equipment', file: 'LTE Base Stations And Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'LTE Handsets and Terminals', file: 'LTE Handsets, Terminals And Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'UMTS Base Stations Equipment', file: 'UMTS Base Stations and Related Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'UMTS Handsets Equipment', file: 'UMTS Handsets And Related Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'DECT Base Stations Equipment', file: 'DECT Base Stations and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'DECT Cordless Telephone Handsets', file: 'DECT Cordless Telephone handsets and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'TETRA Base Stations Equipment', file: 'Tetra Base Stations and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'TETRA Handsets Equipment', file: 'Tetra Handsets and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'WiFi/RLAN/Bluetooth 2.4 GHz', file: 'WiFi_RLAN_BLUETOOTH 2.4 GHZ And Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'HIPERLAN 5.2-5.8 GHz Equipment', file: 'HIPERLAN 5.2 - 5.8 GHZ And Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'V-SAT Equipment', file: 'V-SAT And Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'DVB-T2 Television System', file: 'BOCRA DVB T2 Television System.pdf', category: 'Technical Specifications', year: '2016' },
  { title: 'Digital Radio Mondiale', file: 'BOCRA Digital Radio Mondiale.pdf', category: 'Technical Specifications', year: '2016' },
  { title: 'DTT Set Top Box Specification', file: 'Final Technical Specification for Digital Terrestrial Set Top Box.pdf', category: 'Technical Specifications', year: '2016' },
  { title: 'Final IDTV Specification', file: 'Final IDTV  Specification.pdf', category: 'Technical Specifications', year: '2016' },
  { title: 'ISDB-T Standard (ISDB-Tbw)', file: 'ISDB-T Standard for Botswana - ISDB-Tbw.pdf', category: 'Technical Specifications', year: '2016' },
  { title: 'Type Approval Application', file: 'Type Approval Application.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Type Approval Fees', file: 'Type Approval Application Fees.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Type Approval FAQs', file: 'Type Approval FAQs.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Type Approval Database 2017', file: 'type approval database 2017031231.pdf', category: 'Technical Specifications', year: '2017' },
  { title: 'Safety and EMC Requirements', file: 'Safety and EMC Requirements of Radio and Telecommunications Terminal Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Equipment Connecting to Analogue PSTN', file: 'Equipment Connecting To The Analogue PSTN.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Equipment Connecting to ADSL', file: 'Equipment Connecting to ADSL Services.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Equipment Connecting to HDSL', file: 'Equipment Connecting to HDSL Services.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Equipment Connecting to ISDN (U)', file: 'Equipment Connecting To Basic Rate ISDN Services At The U Interface.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Equipment Connecting to ISDN (ST)', file: 'Equipment Connecting to Basic Rate ISDN Services at ST Interfaces.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Equipment Connecting to X.25', file: 'Equipment Connecting to X.25 Packet Switched Networks.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Equipment Connecting to SDH', file: 'Equipment Directly Connecting To SDH.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Short Range Devices', file: 'Short Range Devices.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Amateur Radio Equipment', file: 'Amateur Radio and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Radio Fixed Links', file: 'Radio Fixed Links.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Radio MF (AM) Broadcast Equipment', file: 'Radio MF (AM) Broadcast and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Radio VHF (FM) Broadcast Equipment', file: 'Radio VHF (FM) Broadcast and Ancillary Equipment.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Mobile WiMAX Base Stations', file: 'Mobile Wimax Base Stations.pdf', category: 'Technical Specifications', year: '2015' },
  { title: 'Ultra Wide Band Services', file: 'Ultra Wide Band Services.pdf', category: 'Technical Specifications', year: '2015' },

  // CONSULTATION PAPERS
  { title: 'ccTLD Policy Discussion Paper', file: 'ccTLD.Policy_Development_Discussion_Paper.pdf', category: 'Consultation Papers', year: '2015' },
  { title: 'ccTLD Consultation Paper', file: 'CONSULTATION PAPER.ccTLD_.pdf', category: 'Consultation Papers', year: '2015' },
  { title: 'Campus Radio Discussion Paper', file: 'Campus_Radio_Discussion_Paper_Draft1.pdf', category: 'Consultation Papers', year: '2024' },
  { title: 'ECTR Consultation Document', file: 'ECTR Consultation Document.pdf', category: 'Consultation Papers', year: '2014' },
  { title: 'National IGF Discussion Paper', file: 'National_IGF_Discussion_Paper.pdf', category: 'Consultation Papers', year: '2015' },
  { title: 'Spectrum Allocation Strategy Consultation', file: 'Consultation Document Spectrum Allocation Strategy for other Radio Services.pdf', category: 'Consultation Papers', year: '2015' },
  { title: 'Draft UASF Strategy 2019-2024', file: 'Final-Draft-UASF-Strategy-2019-2024-for-consultation.pdf', category: 'Consultation Papers', year: '2019' },

  // MEASUREMENT REPORTS
  { title: 'EMF - BBS', file: 'BBS_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Broadhurst Methodist Church', file: 'Broadhurst_Methodist_Church_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Cinderella Pre-School', file: 'Cinderella_Pre-School_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Gabane', file: 'Gabane_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Gaborone Block 8', file: 'Gaborone_Block_8_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Gaborone North', file: 'Gaborone_North_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Grand Palm', file: 'Grand_Palm_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Kgale Mews', file: 'Kgale_Mews_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Mascom HQ', file: 'Mascom_HQ_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Mochudi', file: 'Mochudi_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Mochudi Police', file: 'Mochudi_Police_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Mogoditshane', file: 'Mogoditshane_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Morwa', file: 'Morwa_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Nkoyaphiri', file: 'Nkoyaphiri Measurement Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Phakalane', file: 'Phakalane_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Phase 2', file: 'Phase_2_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Phase 4', file: 'Phase_4_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Poso House', file: 'Poso_House_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Showground', file: 'Showground_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Tirelo House', file: 'Tirelo_House_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Tlokweng Border', file: 'Tlokweng_Boarder_Orange_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Tlokweng', file: 'Tlokweng_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Tsholofelo', file: 'Tsholofelo_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },
  { title: 'EMF - Village', file: 'Village_Measurement_Report.pdf', category: 'Measurement Reports', year: '2021' },

  // BROADBAND & INTERNET
  { title: 'National Broadband Strategy (June 2018)', file: 'National-Broadband-Strategy-FINAL(June2018).pdf', category: 'Broadband & Internet', year: '2018' },
  { title: 'BOCRA Internet Pricing Report', file: '19883_BOCRA_Internet_Pricing.pdf', category: 'Broadband & Internet', year: '2015' },
  { title: 'ADSL Pricelist', file: 'ADSL pricelist.pdf', category: 'Broadband & Internet', year: '2014' },
  { title: 'Internet Prices (June 2014)', file: 'Internet Prices as at June 2014.pdf', category: 'Broadband & Internet', year: '2014' },
  { title: 'Broadband Strategy Phase 2 Report', file: 'Broadband Strategy Phase 2 Report.pdf', category: 'Broadband & Internet', year: '2017' },
  { title: 'Understanding Broadband Connectivity', file: 'Understand Broadband Connectivity.pdf', category: 'Broadband & Internet', year: '2013' },
  { title: 'Internet in Botswana - Problems and Constraints', file: 'Internet in Botswana - Problems and Constraints.pdf', category: 'Broadband & Internet', year: '2010' },
  { title: 'ISP and VoIP Overview', file: 'ISP and VoIP.pdf', category: 'Broadband & Internet', year: '2010' },

  // SPECTRUM & FREQUENCY
  { title: 'National Radio Frequency Plan', file: 'National_Frequency_plan.pdf', category: 'Spectrum & Frequency', year: '2015' },
  { title: 'Draft National Radio Frequency Plan', file: 'Draft BotswanaNAtional Radio frequency Plan.pdf', category: 'Spectrum & Frequency', year: '2015' },
  { title: 'Spectrum Management in Liberalised Environment', file: 'Spectrum Management in a Liberalised Telecommunications Environment.pdf', category: 'Spectrum & Frequency', year: '2010' },
  { title: 'Frequency Application Form', file: 'Frequency Application Form.pdf', category: 'Spectrum & Frequency', year: '2015' },

  // CONSUMER PROTECTION
  { title: 'Consumer Protection Policy', file: 'Consumer_Protection_Policy_-_Communications_Sector.pdf', category: 'Consumer Protection', year: '2024' },
  { title: 'Complaints Handling Procedures', file: 'Complaints Handling Procedures.pdf', category: 'Consumer Protection', year: '2013' },
  { title: 'KYC Form FY 25/26', file: 'KYC_FORM_FY_25_26.pdf', category: 'Consumer Protection', year: '2025' },
  { title: 'Q1 & Q2 Complaints Report 2017', file: 'Q1 & Q2 Complaints report 2017.pdf', category: 'Consumer Protection', year: '2017' },

  // RULINGS & DISPUTES
  { title: 'VBN v BTC (VDSL Offering) Ruling', file: 'BOCRA_Ruling_on_VBN_v_BTC-VDSL_Offering_SIGNED.pdf', category: 'Rulings & Disputes', year: '2022' },
  { title: 'Easimail vs BotswanaPost Ruling', file: 'Easimail vs BotswanaPost Ruling - 17 November 2017 Final.pdf', category: 'Rulings & Disputes', year: '2017' },
  { title: 'Mascom Wireless v BOCRA Judgment', file: 'MASCOM_WIRELESS_V_BOCRA-JUDGMENT_22-05-18.pdf', category: 'Rulings & Disputes', year: '2018' },
  { title: 'Multichoice v BOCRA Judgment', file: 'Multichoice_Botswana_(Pty)_Ltd_v_BOCRA-Judgment-Page_61-90.pdf', category: 'Rulings & Disputes', year: '2020' },
  { title: 'Mascom vs Orange Interconnection Ruling', file: 'RULING_ON_INTERCONNECTION_CHARGES_DISPUTE_BETWEEN_MASCOM_WIRELESS_AND_ORANGE_BOTSWANA.pdf', category: 'Rulings & Disputes', year: '2015' },
  { title: 'BTC vs Mascom/Vista Interconnection Ruling', file: 'RULING_ON_INTERCONNECTION_DISPUTE_BTC_VS_MASCOM_WIRELESS_AND_VISTA_CELLULAR.pdf', category: 'Rulings & Disputes', year: '2015' },
  { title: 'Dispute Resolution Procedure', file: 'Dispute Resolution Service Procedure.pdf', category: 'Rulings & Disputes', year: '2013' },
  { title: 'Dispute Resolution Policy', file: 'Dispute Resolution Service Policy.pdf', category: 'Rulings & Disputes', year: '2013' },

  // NUMBERING PLAN
  { title: 'National Numbering Plan', file: 'National_Numbering_Plan.pdf', category: 'Numbering Plan', year: '2015' },
  { title: 'Numbering Allocations Feb 2024', file: 'Numbering_Plan_Allocations_and_Assignments_February_2024.pdf', category: 'Numbering Plan', year: '2024' },
  { title: 'Numbering Allocations 2022', file: 'Final_National__Numbering_Plan_Allocations_and_Assignments_2022.pdf', category: 'Numbering Plan', year: '2022' },
  { title: 'Numbering Allocations Apr 2021', file: 'National_Numbering_Plan_Allocations_and_Assignments_April_2021.pdf', category: 'Numbering Plan', year: '2021' },
  { title: 'Numbering Allocations Jan 2020', file: 'Botswana Numbering Plan Allocations January 2020.pdf', category: 'Numbering Plan', year: '2020' },
  { title: 'Numbering Allocations Dec 2015', file: 'Botswana Numbering Plan Allocations December 2015.pdf', category: 'Numbering Plan', year: '2015' },
  { title: 'Draft Numbering Policy', file: 'DRAFT-NUMBERING-POLICY.final_.pdf', category: 'Numbering Plan', year: '2015' },

  // RESEARCH & PUBLICATIONS
  { title: 'BOCRA Pricing Report', file: '19883_BOCRA_Pricing.pdf', category: 'Research & Publications', year: '2015' },
  { title: 'Regulatory Framework Review', file: 'A Review of the Regulatory Framework in Botswana.pdf', category: 'Research & Publications', year: '2015' },
  { title: 'Consumer/Operator Perception Survey', file: 'BOCRA_COPS_FINAL_REPORT_19JUL22.pdf', category: 'Research & Publications', year: '2022' },
  { title: 'Customer Satisfaction Report', file: 'Final_Report_BOCRA_Cust_Satisfaction.pdf', category: 'Research & Publications', year: '2020' },
  { title: 'Postal Sector Market Study', file: 'POSTAL SECTOR MARKET STUDY.pdf', category: 'Research & Publications', year: '2015' },
  { title: 'Mobile Market in Botswana', file: 'Mobile Market in Botswana and its Prospects.pdf', category: 'Research & Publications', year: '2010' },
  { title: 'Vision 2036', file: 'Vision 2036_0.pdf', category: 'Research & Publications', year: '2016' },
  { title: 'National Cybersecurity Strategy', file: 'approved botswana-national-cybersecurity-strategy.pdf', category: 'Research & Publications', year: '2020' },
  { title: 'E-Waste Management Workshop Report', file: 'workshop report e-waste management final.pdf', category: 'Research & Publications', year: '2018' },
  { title: 'BOCRA Booklet', file: 'BOCRA BOOKLET_compressed.pdf', category: 'Research & Publications', year: '2020' },
  { title: 'BOCRA E-Communicator', file: 'BOCRA_E-COMMUNICATOR_FILE_v2_compressed.pdf', category: 'Research & Publications', year: '2020' },
  { title: 'NBB Audience Survey Report Vol. I', file: 'NBB Audience Survey Report Volume I.pdf', category: 'Research & Publications', year: '2015' },

  // POLICY
  { title: 'Botswana Telecommunications Policy', file: 'Botswana_Telecommunications_Policy.pdf', category: 'Policy', year: '2006' },
  { title: 'State of ICTs in Botswana', file: 'BOCRA for State of ICTs in Botswana.pdf', category: 'Policy', year: '2020' },
  { title: 'SADC Roaming Implementation', file: 'BOCRA Implementation Of SADC Home & Away Roaming.pdf', category: 'Policy', year: '2015' },
  { title: 'Directive No. 1, 2017', file: 'Directive No. 1 2017.pdf', category: 'Policy', year: '2017' },
  { title: 'Regulatory Directive No. 1 (2011)', file: 'Regulatory_Directive_No_1_FINAL_2011.pdf', category: 'Policy', year: '2011' },
  { title: 'Migration Conversion Plan', file: 'Migration Conversion Plan_0.pdf', category: 'Policy', year: '2015' },
  { title: 'Infrastructure Sharing Report (Draft)', file: 'Draft_Final_Report_on_Infrastructure_Sharing.pdf', category: 'Policy', year: '2018' },
  { title: 'ccTLD .BW Acceptable User Policy', file: 'Annexure_3.3.1A_ccTLD_BW_Acceptable_User_Policy_Feb_2022.pdf', category: 'Policy', year: '2022' },
  { title: 'ccTLD .BW Registration Terms', file: 'Annexure_3.3.1B_ccTLD_DotBW_Registration_Terms_and_Conditions_Feb_2022.pdf', category: 'Policy', year: '2022' },
  { title: 'UASF Operating Manual 2021', file: 'UASF-OPERATING-MANUAL-2021.pdf', category: 'Policy', year: '2021' },
  { title: 'UASF Youth Hackathon', file: 'UASF YOUTH HACKATHON.pdf', category: 'Policy', year: '2025' },
  { title: 'Corporate Social Investment Policy', file: 'Corporate Social Investment Policy - Final Draft (v1).pdf', category: 'Policy', year: '2018' },

  // EMF & HEALTH
  { title: 'EMF Monitoring Report 2021-2022', file: 'REPORT-ON-EMF-MONITORING-FOR-PUBLISHING-FINAL-2021-2022.pdf', category: 'EMF & Health', year: '2022' },
  { title: 'RF Exposure Measurements for Base Stations', file: 'RF Exposure Measurements and Compliance for Mobile Base Station Sites.pdf', category: 'EMF & Health', year: '2018' },
  { title: 'Mobile Phones and EMF Exposure', file: 'Mobile Phones and EMF Exposure.pdf', category: 'EMF & Health', year: '2015' },
  { title: 'Health Effects of Mobile Phones', file: 'Current Epidemiologic Evidence on the Health Effects of Mobile Phones.pdf', category: 'EMF & Health', year: '2015' },
  { title: 'Health Effects from Wireless Communications', file: 'Research - Health Effects from Wireless Communications.pdf', category: 'EMF & Health', year: '2015' },
  { title: 'EMR Workshop Report', file: 'Workshop on Electromagnetic Radiation (EMR).pdf', category: 'EMF & Health', year: '2015' },

  // FORMS & APPLICATIONS
  { title: 'Accreditation Form', file: 'ACREDITATION_FORM .pdf', category: 'Forms & Applications', year: '2015' },
  { title: 'Amateur Radio Application Form', file: 'Amateur  Application Form.pdf', category: 'Forms & Applications', year: '2015' },
  { title: 'Private Radio Application Form', file: 'Private Radio Application Form.pdf', category: 'Forms & Applications', year: '2015' },
  { title: 'ccTLD Registrar Accreditation Agreement', file: 'Annexure_3.3.1C_ccTLD_Registrar_Accreditation_Agreement_Feb_2022.pdf', category: 'Forms & Applications', year: '2022' },
  { title: 'Outsourcing Questionnaire 2021', file: 'OutsourcingQuestionnaire-2021.pdf', category: 'Forms & Applications', year: '2021' },

  // BROADCASTING
  { title: 'NBB Application Procedures', file: 'NBB Application and Assessment Procedures.pdf', category: 'Broadcasting', year: '2015' },
  { title: 'Campus Radio Broadcasters Notice', file: 'Public_Notice_Campus_Radio_Broadcasters.pdf', category: 'Broadcasting', year: '2024' },
];

const CAT_KEYS = Object.keys(getCATEGORY_CONFIG('en'));

export default function DocumentsPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const CATS = getCATEGORY_CONFIG(lang);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const heroRef = useScrollReveal();

  const catCounts = useMemo(() => {
    const c = {};
    CAT_KEYS.forEach(k => { c[k] = DOCUMENTS.filter(d => d.category === k).length; });
    return c;
  }, []);

  const years = useMemo(() => [...new Set(DOCUMENTS.map(d => d.year))].sort((a, b) => b.localeCompare(a)), []);

  const filteredDocs = useMemo(() => {
    let docs = DOCUMENTS;
    if (activeCategory) docs = docs.filter(d => d.category === activeCategory);
    if (yearFilter) docs = docs.filter(d => d.year === yearFilter);
    if (search) { const q = search.toLowerCase(); docs = docs.filter(d => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)); }
    return docs.sort((a, b) => b.year.localeCompare(a.year));
  }, [activeCategory, yearFilter, search]);

  const totalDocs = DOCUMENTS.length;
  const handleDownload = (file) => { if (file) window.open(`${BASE}documents/${file}`, '_blank'); };

  return (
    <div className="bg-white">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
        <Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link><ChevronRight size={14} />
        {activeCategory ? (<><button onClick={() => setActiveCategory(null)} className="hover:text-bocra-blue">{tn ? 'Dikwalo' : 'Documents'}</button><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{CATS[activeCategory]?.name}</span></>) : (<span className="text-bocra-slate font-medium">{tn ? 'Dikwalo le Melao' : 'Documents & Legislation'}</span>)}
      </nav></div></div>

      <PageHero category="RESOURCES" categoryTn="METSWEDI" title="Documents & Legislation" titleTn="Dikwalo le Melao" description={`Browse ${totalDocs}+ official documents — legislation, reports, guidelines, policies, and forms.`} descriptionTn={`Batla dikwalo di le ${totalDocs}+ tsa semmuso — melao, dipego, ditaelo, dipholisi, le diforomo.`} color="magenta" />

      {/* Search */}
      <section className="py-4"><div className="section-wrapper max-w-3xl mx-auto"><div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={tn ? `Batla mo dikwalong di le ${totalDocs}...` : `Search ${totalDocs} documents...`} className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:border-[#00A6CE] focus:ring-2 focus:ring-[#00A6CE]/10 outline-none shadow-sm" />
        {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-bocra-slate/30 hover:text-bocra-slate"><X size={16} /></button>}
      </div></div></section>

      {!activeCategory && !search ? (
        <section className="py-6"><div className="section-wrapper">
          <h2 className="text-lg font-bold text-bocra-slate mb-1 text-center">{tn ? 'Batla ka Karolo' : 'Browse by Category'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-6">{tn ? `Dikwalo di le ${totalDocs} mo dikarolong di le ${CAT_KEYS.length}` : `${totalDocs} documents across ${CAT_KEYS.length} categories`}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAT_KEYS.map(key => { const cat = CATS[key]; const Icon = cat.icon; const count = catCounts[key] || 0; return (
              <button key={key} onClick={() => setActiveCategory(key)} className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 transition-all group-hover:h-1.5" style={{ backgroundColor: cat.color }} />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}12` }}><Icon size={22} style={{ color: cat.color }} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-bocra-slate group-hover:text-[#00458B] transition-colors">{cat.name}</h3>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cat.color}12`, color: cat.color }}>{count}</span>
                    </div>
                    <p className="text-xs text-bocra-slate/50 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              </button>
            ); })}
          </div>
        </div></section>
      ) : (
        <section className="py-6"><div className="section-wrapper max-w-4xl mx-auto">
          {activeCategory && (<div className="mb-6">
            <button onClick={() => { setActiveCategory(null); setYearFilter(''); }} className="flex items-center gap-2 text-sm text-[#00A6CE] hover:text-[#00458B] font-medium mb-4 transition-colors"><ArrowLeft size={16} /> {tn ? 'Boela kwa Dikarolong' : 'Back to Categories'}</button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${CATS[activeCategory]?.color}12` }}>
                {(() => { const Icon = CATS[activeCategory]?.icon || FolderOpen; return <Icon size={22} style={{ color: CATS[activeCategory]?.color }} />; })()}
              </div>
              <div><h2 className="text-xl font-bold text-bocra-slate">{CATS[activeCategory]?.name}</h2><p className="text-sm text-bocra-slate/40">{CATS[activeCategory]?.desc}</p></div>
            </div>
          </div>)}

          {search && !activeCategory && <div className="mb-4"><p className="text-sm text-bocra-slate/50">{tn ? `Dipholo di le ${filteredDocs.length} bakeng sa` : `${filteredDocs.length} results for`} "{search}"</p></div>}

          {(activeCategory || search) && <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button onClick={() => setYearFilter('')} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${!yearFilter ? 'bg-[#00458B] text-white border-[#00458B]' : 'bg-white text-bocra-slate/50 border-gray-200'}`}>{tn ? 'Dingwaga Tsotlhe' : 'All Years'}</button>
            {years.slice(0, 12).map(y => (<button key={y} onClick={() => setYearFilter(yearFilter === y ? '' : y)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${yearFilter === y ? 'bg-[#00458B] text-white border-[#00458B]' : 'bg-white text-bocra-slate/50 border-gray-200'}`}>{y}</button>))}
          </div>}

          {filteredDocs.length === 0 ? (
            <div className="text-center py-16"><FileText size={48} className="mx-auto text-bocra-slate/15 mb-4" /><h3 className="text-lg font-medium text-bocra-slate/40">{tn ? 'Ga go na dikwalo tse di bonweng' : 'No documents found'}</h3><p className="text-sm text-bocra-slate/30 mt-1">{tn ? 'Leka go fetola dipatlisiso kgotsa disefa' : 'Try adjusting your search or filters'}</p></div>
          ) : (
            <div className="space-y-2">{filteredDocs.map((doc, i) => { const config = CATS[doc.category]; return (
              <button key={i} onClick={() => handleDownload(doc.file)} className="w-full bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all group border border-gray-100 hover:border-gray-200 text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config?.color}15` }}><FileText size={18} style={{ color: config?.color }} /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-bocra-slate group-hover:text-[#00A6CE] transition-colors truncate">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {!activeCategory && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: config?.color }}>{config?.name || doc.category}</span>}
                    <span className="text-xs text-bocra-slate/40">{doc.year}</span><span className="text-xs text-bocra-slate/30">•</span><span className="text-xs text-bocra-slate/40">PDF</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg hover:bg-[#00A6CE]/5 transition-colors flex-shrink-0 opacity-50 group-hover:opacity-100"><Download size={18} className="text-[#00A6CE]" /></div>
              </button>
            ); })}</div>
          )}
        </div></section>
      )}

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
