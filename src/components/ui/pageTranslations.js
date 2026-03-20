/**
 * pageTranslations.js — Hardcoded English → Setswana translations
 * 
 * Covers all visible text across the BOCRA website.
 * Used by PageTranslator for instant, reliable, zero-API translation.
 * 
 * To add new translations: just add entries to the TRANSLATIONS object.
 * Format: 'English text': 'Setswana text'
 */

const TRANSLATIONS = {
  // ═══════════════════════════════════════════════
  // COMMON UI ELEMENTS
  // ═══════════════════════════════════════════════
  'Home': 'Legae',
  'Search': 'Batla',
  'Search BOCRA': 'Batla BOCRA',
  'Loading...': 'E a tsenya...',
  'Loading': 'E a tsenya',
  'Submit': 'Romela',
  'Cancel': 'Khansela',
  'Close': 'Tswala',
  'Back': 'Morago',
  'Next': 'E e latelang',
  'Previous': 'E e fetileng',
  'View': 'Bona',
  'View All': 'Bona Tsotlhe',
  'View More': 'Bona go Feta',
  'View Details': 'Bona Dintlha',
  'View PDF': 'Bona PDF',
  'Download': 'Tsenya',
  'Read More': 'Bala go Feta',
  'Learn More': 'Ithute go Feta',
  'Sign In': 'Tsena',
  'Sign Out': 'Tswa',
  'Sign Up': 'Ikwadise',
  'Register': 'Ikwadise',
  'Login': 'Tsena',
  'Logout': 'Tswa',
  'Email': 'Imeile',
  'Password': 'Lefoko la Sephiri',
  'Phone': 'Mogala',
  'Name': 'Leina',
  'Full Name': 'Leina ka Botlalo',
  'Company': 'Kompone',
  'Address': 'Aterese',
  'Date': 'Letlha',
  'Status': 'Maemo',
  'Type': 'Mofuta',
  'Description': 'Tlhaloso',
  'Category': 'Karolo',
  'All': 'Tsotlhe',
  'Filter': 'Sefa',
  'Sort': 'Baakanya',
  'Newest': 'Tsa Bosheng',
  'Newest First': 'Tsa Bosheng Pele',
  'Oldest First': 'Tsa Bogologolo Pele',
  'Oldest': 'Tsa Bogologolo',
  'Reset': 'Simolola Sesha',
  'Clear': 'Tlosa',
  'Save': 'Boloka',
  'Edit': 'Fetola',
  'Delete': 'Phimola',
  'Confirm': 'Netefatsa',
  'Yes': 'Ee',
  'No': 'Nnyaa',
  'OK': 'Go Siame',
  'Done': 'Go Weditswe',
  'Error': 'Phoso',
  'Success': 'Katlego',
  'Warning': 'Temoso',
  'Info': 'Tshedimosetso',
  'Pending': 'E Emetse',
  'Active': 'E Dira',
  'Inactive': 'Ga e Dire',
  'Approved': 'E Amogetse',
  'Rejected': 'E Ganetswe',
  'Processing': 'E a Dirwa',
  'Completed': 'E Weditswe',
  'pages': 'ditsebe',
  'documents': 'dipampiri',
  'results': 'dipholo',
  'items': 'dilo',
  'of': 'tsa',
  'Showing': 'Go Bontshitswe',
  'No results found': 'Ga go na dipholo',
  'Try adjusting your search or category filter.': 'Leka go fetola dipatlisiso kgotsa sefa ya karolo.',

  // ═══════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════
  'About': 'Ka ga',
  'About BOCRA': 'Ka ga BOCRA',
  'Mandate': 'Taelo',
  'Services': 'Ditirelo',
  'Resources': 'Didirisiwa',
  'Media': 'Bobegakgang',
  'Contact': 'Ikgolaganye',
  'Contact Us': 'Ikgolaganye le Rona',
  'News & Events': 'Dikgang le Ditiragalo',
  'News': 'Dikgang',
  'Speeches': 'Dipuo',
  'Media Center': 'Senthara ya Bobegakgang',

  // ═══════════════════════════════════════════════
  // HOMEPAGE
  // ═══════════════════════════════════════════════
  'Regulating Communications for a Connected Botswana': 'Go Laola Tlhaeletsano ya Botswana e e Golaganeng',
  'Ensuring accessible, affordable, and quality communications services for all.': 'Go netefatsa ditirelo tsa tlhaeletsano tse di fitlhelelwang, tse di sa tureng, le tsa boleng jo bo kwa godimo go botlhe.',
  'File a Complaint': 'Kwala Ngongorego',
  'Apply for a Licence': 'Dira Kopo ya Laesense',
  'Verify a Licence': 'Netefatsa Laesense',
  'Quick Links': 'Dikgolagano tsa Bonako',
  'Latest News': 'Dikgang tsa Bosheng',
  'Our Services': 'Ditirelo tsa Rona',
  'Licensed Operators': 'Badiri ba ba Nang le Laesense',
  'Mobile Subscribers': 'Badirisisi ba Megala',
  'Internet Penetration': 'Tsenelelo ya Inthanete',
  'Complaints Resolved': 'Dingongorego tse di Rarabotsweng',
  'Telecom Statistics': 'Dipalopalo tsa Megala',
  'Stay informed with the latest updates from BOCRA': 'Nna le kitso ka diphetogo tsa bosheng go tswa go BOCRA',

  // ═══════════════════════════════════════════════
  // ABOUT PAGES
  // ═══════════════════════════════════════════════
  'Profile': 'Porofaele',
  'BOCRA Profile': 'Porofaele ya BOCRA',
  'Chief Executive': 'Mokaedi Mogolo',
  'History': 'Histori',
  'History of Communication Regulation': 'Histori ya Taolo ya Tlhaeletsano',
  'Organogram': 'Thulaganyo ya Setheo',
  'Board of Directors': 'Boto ya Bakaedi',
  'Executive Management': 'Botsamaisi jwa Phethagatso',
  'Careers': 'Ditiro',
  'Mission': 'Maikaelelo',
  'Vision': 'Ponelopele',
  'Core Values': 'Maitlhomo a Motheo',
  'Our Mission': 'Maikaelelo a Rona',
  'Our Vision': 'Ponelopele ya Rona',
  'Our Values': 'Maitlhomo a Rona',

  // ═══════════════════════════════════════════════
  // MANDATE PAGES
  // ═══════════════════════════════════════════════
  'Telecommunications': 'Megala',
  'Broadcasting': 'Phatlhalatso',
  'Postal Services': 'Ditirelo tsa Poso',
  'Internet & ICT': 'Inthanete le ICT',
  'Legislation': 'Molao',
  'Licensing Framework': 'Thulaganyo ya Dilaesense',
  'Sectors': 'Mafapha',
  'Regulation': 'Taolo',
  'Projects': 'Diporojeke',
  'Digital Switchover': 'Phetogo ya Dijithale',
  'Infrastructure Sharing': 'Karogano ya Mafaratlhatlha',

  // ═══════════════════════════════════════════════
  // SERVICES PAGES
  // ═══════════════════════════════════════════════
  'For Citizens': 'Bakeng sa Baagi',
  'For Industry': 'Bakeng sa Intaseteri',
  'File Complaint': 'Kwala Ngongorego',
  'Consumer Education': 'Thuto ya Badirisi',
  'Licence Verification': 'Netefatso ya Laesense',
  'Type Approval': 'Kamo ya Mofuta',
  'Spectrum Management': 'Tsamaiso ya Marang',
  'Register .BW Domain': 'Kwadisa .BW Domain',
  'Cybersecurity Hub': 'Senthara ya Tshireletso ya Saebara',
  'Cybersecurity': 'Tshireletso ya Saebara',
  'QoS Monitoring': 'Tlhokomelo ya Boleng jwa Tirelo',
  'Quality of Service': 'Boleng jwa Tirelo',
  'Report an Incident': 'Bega Tiragalo',
  'Safety Tips': 'Maele a Polokesego',

  // Complaint Form
  'Step': 'Kgato',
  'Your Information': 'Tshedimosetso ya Gago',
  'Complaint Details': 'Dintlha tsa Ngongorego',
  'Service Provider': 'Motlamedi wa Tirelo',
  'Complaint Type': 'Mofuta wa Ngongorego',
  'Select Provider': 'Tlhopha Motlamedi',
  'Select Type': 'Tlhopha Mofuta',
  'Billing Issues': 'Mathata a Tuelo',
  'Network Coverage': 'Marang a Netweke',
  'Service Quality': 'Boleng jwa Tirelo',
  'Data Issues': 'Mathata a Data',
  'Please describe your complaint in detail': 'Tlhalosa ngongorego ya gago ka botlalo',
  'I consent to BOCRA processing my personal data': 'Ke dumelana gore BOCRA e dirise data ya me ya botho',
  'Submit Complaint': 'Romela Ngongorego',
  'Complaint Submitted Successfully': 'Ngongorego e Romeletswe ka Katlego',

  // ═══════════════════════════════════════════════
  // QoS MONITORING PAGE
  // ═══════════════════════════════════════════════
  'Overview': 'Kakaretso',
  'Compare Operators': 'Bapisa Badiri',
  'Regional': 'Kgaolo',
  'Call Success Rate': 'Seelo sa Katlego ya Mogala',
  'Dropped Call Rate': 'Seelo sa Megala e e Wetseng',
  'Network Uptime': 'Nako ya Netweke e Dira',
  'Download Speed': 'Lebelo la go Tsenya',
  'Upload Speed': 'Lebelo la go Romela',
  'Latency': 'Tiego',
  'SMS Delivery Rate': 'Seelo sa Phitlhelelo ya SMS',
  'AI Insights': 'Ditlhaloso tsa AI',
  'Generate AI Analysis': 'Tlhama Tshekatsheko ya AI',
  'Analyzing data...': 'E sekaseka data...',

  // ═══════════════════════════════════════════════
  // OPERATOR PORTAL
  // ═══════════════════════════════════════════════
  'Operator Portal': 'Portale ya Modiri',
  'ASMS-WebCP': 'ASMS-WebCP',
  'Create Account': 'Bula Akhaonto',
  'Sign In to Your Account': 'Tsena mo Akhaontong ya Gago',
  'Existing Customer Search': 'Batla Moreki yo o Leng Teng',
  'Customer Number': 'Nomoro ya Moreki',
  'Dashboard': 'Dashboroto',
  'My Applications': 'Dikopo tsa Me',
  'My Complaints': 'Dingongorego tsa Me',
  'Account Settings': 'Ditlhophelo tsa Akhaonto',
  'Profile Picture': 'Setshwantsho sa Porofaele',
  'Upload Photo': 'Tsenya Setshwantsho',
  'Remove Photo': 'Tlosa Setshwantsho',
  'Verify your email': 'Netefatsa imeile ya gago',
  'Email Verified!': 'Imeile e Netefaditswe!',
  'Your email has been successfully verified. Your BOCRA account is now active.': 'Imeile ya gago e netefaditswe ka katlego. Akhaonto ya gago ya BOCRA e a dira jaanong.',

  // ═══════════════════════════════════════════════
  // LICENSING HUB
  // ═══════════════════════════════════════════════
  'Licensing Hub': 'Senthara ya Dilaesense',
  'Choose a Licence Type': 'Tlhopha Mofuta wa Laesense',
  'Application Form': 'Foromo ya Kopo',
  'Requirements': 'Ditlhokego',
  'Fees': 'Dituelo',
  'Aircraft Radio': 'Radio ya Sefofane',
  'Amateur Radio': 'Radio ya Boitapoloso',
  'Broadcasting Licence': 'Laesense ya Phatlhalatso',
  'Cellular Licence': 'Laesense ya Cellular',
  'Private Radio': 'Radio ya Poraefete',
  'Radio Dealers': 'Barekisi ba Radio',
  'Radio Frequency': 'Marang a Radio',
  'Satellite': 'Satellite',
  'VANS': 'VANS',
  'Licence Type': 'Mofuta wa Laesense',
  'Reference Number': 'Nomoro ya Referense',

  // ═══════════════════════════════════════════════
  // CYBERSECURITY HUB
  // ═══════════════════════════════════════════════
  'Report Cyber Incident': 'Bega Tiragalo ya Saebara',
  'Incident Type': 'Mofuta wa Tiragalo',
  'Phishing': 'Phishing',
  'Malware': 'Malware',
  'Ransomware': 'Ransomware',
  'Data Breach': 'Tlolomolao ya Data',
  'SIM Swap Fraud': 'Boferefere jwa SIM Swap',
  'Other': 'Tse Dingwe',
  'Urgency': 'Potlako',
  'Low': 'Tlase',
  'Medium': 'Magareng',
  'High': 'Godimo',
  'Critical': 'Botlhokwa Thata',
  'Stay Safe Online': 'Nna o Babalesegile mo Inthaneteng',
  'Protect Yourself': 'Itshireletse',
  'Common Threats': 'Ditshoso tse di Tlwaelegileng',
  'Latest Vulnerabilities': 'Bokoa jwa Bosheng',

  // ═══════════════════════════════════════════════
  // REGISTER .BW PAGE
  // ═══════════════════════════════════════════════
  'Register a .BW Domain': 'Kwadisa .BW Domain',
  'Domain Registration': 'Kwadiso ya Domain',
  'WHOIS Lookup': 'Patlisiso ya WHOIS',
  'Domain Name': 'Leina la Domain',
  'Registrar': 'Mokwadisi',
  'Available': 'E a Fitlhelwa',
  'Taken': 'E Tseilwe',
  'Check Availability': 'Leka go e Bona',

  // ═══════════════════════════════════════════════
  // DOCUMENTS & LEGISLATION
  // ═══════════════════════════════════════════════
  'Documents & Legislation': 'Dipampiri le Melao',
  'Documents': 'Dipampiri',
  'Publications': 'Diphatlalatso',
  'ICT Licensing Framework': 'Thulaganyo ya Dilaesense tsa ICT',
  'Annual Reports': 'Dipego tsa Ngwaga',
  'Guidelines & Standards': 'Ditaelo le Maemo',
  'Licensing': 'Dilaesense',
  'Technical Specifications': 'Ditlhaloso tsa Thekenoloji',
  'Consultation Papers': 'Dipampiri tsa Therisano',
  'Tariffs': 'Dituelo tsa Ditirelo',
  'CATEGORIES': 'DIKAROLO',
  'Categories': 'Dikarolo',
  'Search documents...': 'Batla dipampiri...',

  // ═══════════════════════════════════════════════
  // NEWS & EVENTS PAGE
  // ═══════════════════════════════════════════════
  'MEDIA': 'BOBEGAKGANG',
  'Public Notices': 'Dikitsiso tsa Setšhaba',
  'Tenders & Procurement': 'Ditendara le Theko',
  'Media Releases': 'Dikgang tsa Bobegakgang',
  'Regulatory Documents': 'Dipampiri tsa Taolo',
  'Public Notice': 'Kitsiso ya Setšhaba',
  'Tender': 'Tendara',
  'Media Release': 'Kgang ya Bobegakgang',
  'Regulatory': 'Taolo',
  'Code of Conduct for Broadcasting During Elections': 'Molao wa Maitshwaro wa Phatlhalatso ka Nako ya Ditlhopho',
  'Licensed Communications Operators Publication': 'Phatlalatso ya Badiri ba Tlhaeletsano ba ba Nang le Laesense',
  'QoS Monitoring System — Public Notice': 'Tsamaiso ya Tlhokomelo ya Boleng jwa Tirelo — Kitsiso ya Setšhaba',
  'BOCRA Approves Reduction in Fixed Broadband Prices': 'BOCRA e Amogela Phokotso ya Ditlhwatlhwa tsa Broadband',
  'Supply and Delivery of ICT Equipment': 'Tlamelo le Phitlhelelo ya Didirisiwa tsa ICT',
  'BOCRA Public Tender Notice': 'Kitsiso ya Tendara ya Setšhaba ya BOCRA',
  'Notice of Best Evaluated Bidder — Etsha 6 Computer Lab': 'Kitsiso ya Moneedi yo o Siameng — Etsha 6 Computer Lab',
  'BOCRA Public Advertisement': 'Papatso ya Setšhaba ya BOCRA',
  'Comprehensive code governing broadcasting service licensees during election periods. Covers impartiality, party political broadcasts, advertising rules, and complaints procedures.': 'Molao o o feletseng o o laolang ba ba nang le dilaesense tsa phatlhalatso ka nako ya ditlhopho. O akaretsa go se tsee letlhakore, diphatlhalatso tsa dipolotiki, melao ya dipapatso, le ditsamaiso tsa dingongorego.',
  'Official gazette listing all BOCRA-licensed SAP, NFP, Mobile Network Operators (BTC, Mascom, Orange), Postal Service Providers, and Broadcasting Operators.': 'Lenaane la semmuso la badiri botlhe ba ba nang le dilaesense tsa BOCRA go akaretsa SAP, NFP, Badiri ba Megala (BTC, Mascom, Orange), Batlamedi ba Poso, le Badiri ba Phatlhalatso.',
  'Tender notice for supply, installation and commissioning of a Quality of Service monitoring system for fixed and mobile networks. Tender No: BOCRA/PT/002/2021.2022.': 'Kitsiso ya tendara ya go reka, go tsenya le go simolola tsamaiso ya tlhokomelo ya boleng jwa tirelo ya dinetweke tsa megala. Tendara No: BOCRA/PT/002/2021.2022.',
  'BOCRA approved up to 40% price reductions for BTC fixed broadband services. 20Mbps from P975 to P650, 50Mbps from P1,985 to P1,200, 100Mbps from P2,800 to P1,900.': 'BOCRA e amogetse phokotso ya ditlhwatlhwa go ya go 40% ya ditirelo tsa BTC tsa broadband. 20Mbps go tswa P975 go ya P650, 50Mbps go tswa P1,985 go ya P1,200, 100Mbps go tswa P2,800 go ya P1,900.',
  'Invitation to tender for the supply and delivery of ICT equipment to support BOCRA operational capacity and digital infrastructure.': 'Taletso ya tendara ya go reka le go fitlhisa didirisiwa tsa ICT go tshegetsa bokgoni jwa tiragatso jwa BOCRA.',
  'General procurement notice inviting qualified bidders to submit proposals for various Authority service requirements.': 'Kitsiso ya theko e e laleditseng baneedi ba ba tshwanelang go romela ditshitshinyo tsa ditlhokego tsa ditirelo tsa Botlhatlhami.',
  'Contract awarded to C.E.N. Enterprises (Pty) Ltd for BWP 1,881,718.92 for construction of a computer laboratory at Etsha 6 Primary School, Okavango District.': 'Konteraka e neilwe C.E.N. Enterprises (Pty) Ltd ka BWP 1,881,718.92 ya go aga laporatori ya dikhomputara kwa Sekolong sa Etsha 6, Kgaolo ya Okavango.',
  'Official BOCRA advertisement outlining regulatory updates, service information, and stakeholder communications published in national media.': 'Papatso ya semmuso ya BOCRA e e tlhalosang diphetogo tsa taolo, tshedimosetso ya ditirelo, le dipuisano le baamegi.',

  // ═══════════════════════════════════════════════
  // CONTACT PAGE
  // ═══════════════════════════════════════════════
  'Get in Touch': 'Ikgolaganye le Rona',
  'Send us a message': 'Re romelele molaetsa',
  'Subject': 'Setlhogo',
  'Message': 'Molaetsa',
  'Your message has been sent successfully': 'Molaetsa wa gago o romeletswe ka katlego',
  'Physical Address': 'Aterese ya Lefelo',
  'Postal Address': 'Aterese ya Poso',
  'Telephone': 'Mogala',
  'Fax': 'Fekese',
  'Working Hours': 'Diura tsa Tiro',
  'Monday - Friday': 'Mosupologo - Labotlhano',
  'Saturday - Sunday': 'Matlhatso - Tshipi',
  'Closed': 'Go Tswaletswe',

  // ═══════════════════════════════════════════════
  // SEARCH PAGE
  // ═══════════════════════════════════════════════
  'Search pages, documents, services, operators...': 'Batla ditsebe, dipampiri, ditirelo, badiri...',
  'Popular Searches': 'Dipatlisiso tse di Ratiwang',
  'Pages': 'Ditsebe',
  'Documents & Legislation': 'Dipampiri le Melao',
  'Operators': 'Badiri',
  'No results found for': 'Ga go na dipholo tsa',
  'Try different keywords or browse our sections below': 'Leka mafoko a mangwe kgotsa leba dikarolo tsa rona',

  // ═══════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════
  'Quick Links': 'Dikgolagano tsa Bonako',
  'Legal': 'Molao',
  'Privacy Policy': 'Pholisi ya Poraefasi',
  'Privacy Notice': 'Kitsiso ya Poraefasi',
  'Terms of Service': 'Melao ya Tirelo',
  'Cookie Policy': 'Pholisi ya Dikhukhi',
  'Disclaimer': 'Kganetso',
  'All Rights Reserved': 'Ditshwanelo Tsotlhe di Sireleditwe',
  'Follow Us': 'Re Latelele',
  'Imagine the world without order': 'Akanya lefatshe le le senang thulaganyo',
  'Imagine Botswana without BOCRA': 'Akanya Botswana e se na BOCRA',
  'Independence Avenue': 'Independence Avenue',
  'Gaborone': 'Gaborone',

  // ═══════════════════════════════════════════════
  // COOKIE CONSENT
  // ═══════════════════════════════════════════════
  'Cookie Preferences': 'Ditlhophelo tsa Dikhukhi',
  'Accept All': 'Amogela Tsotlhe',
  'Essential Only': 'Tse di Botlhokwa Fela',
  'Decline': 'Gana',
  'This website uses cookies to enhance your experience.': 'Webosaete eno e dirisa dikhukhi go tokafatsa maitemogelo a gago.',

  // ═══════════════════════════════════════════════
  // ACCESSIBILITY WIDGET
  // ═══════════════════════════════════════════════
  'Accessibility': 'Phitlhelelo',
  'Accessibility Options': 'Ditlhophelo tsa Phitlhelelo',
  'Text Size': 'Bogolo jwa Mokwalo',
  'Increase': 'Godisa',
  'Decrease': 'Fokotsa',
  'High Contrast': 'Pharologanyo e Kgolo',
  'Dyslexia Font': 'Fonte ya Dyslexia',
  'Line Height': 'Bogodimo jwa Mola',
  'Letter Spacing': 'Sekgala sa Ditlhaka',
  'Hide Images': 'Fitlha Ditshwantsho',
  'Reading Guide': 'Motataisi wa go Bala',
  'Reset All': 'Simolola Tsotlhe Sesha',
  'Focus Mode': 'Mokgwa wa go Tota',
  'Large Cursor': 'Khesa e Kgolo',

  // ═══════════════════════════════════════════════
  // ADMIN PAGES
  // ═══════════════════════════════════════════════
  'Admin Portal': 'Portale ya Botsamaisi',
  'Complaints Management': 'Tsamaiso ya Dingongorego',
  'Applications': 'Dikopo',
  'Incidents': 'Ditiragalo',
  'QoS Reports': 'Dipego tsa Boleng jwa Tirelo',
  'Data Requests': 'Dikopo tsa Data',
  'Manage Complaints': 'Laola Dingongorego',
  'Total Complaints': 'Dingongorego Tsotlhe',
  'Open': 'Tse di Butsweng',
  'In Progress': 'Tse di Dirwang',
  'Resolved': 'Tse di Rarabotsweng',
  'Urgent': 'Potlako',
  'Response': 'Karabo',
  'Reply': 'Araba',
  'Send Reply': 'Romela Karabo',

  // ═══════════════════════════════════════════════
  // TELECOM STATISTICS
  // ═══════════════════════════════════════════════
  'Telecommunications Statistics': 'Dipalopalo tsa Megala',
  'Mobile Subscriptions': 'Dikwadiso tsa Megala',
  'Fixed Line Subscriptions': 'Dikwadiso tsa Megala ya Ntlha',
  'Internet Subscribers': 'Baikwadisi ba Inthanete',
  'Broadband Penetration': 'Tsenelelo ya Broadband',
  'Mobile Money': 'Madi a Mogala',
  'Market Share': 'Kabelo ya Mmaraka',
  'Year': 'Ngwaga',
  'Quarter': 'Kotara',
  'Growth': 'Kgolo',
  'Trend': 'Tshekamelo',

  // ═══════════════════════════════════════════════
  // LICENCE VERIFICATION
  // ═══════════════════════════════════════════════
  'Licence Verification Portal': 'Portale ya Netefatso ya Laesense',
  'Enter licence number or company name': 'Tsenya nomoro ya laesense kgotsa leina la kompone',
  'Search licences...': 'Batla dilaesense...',
  'Valid': 'E a Dira',
  'Expired': 'E Fedile',
  'Suspended': 'E Emisitswe',
  'Licence Number': 'Nomoro ya Laesense',
  'Licence Holder': 'Mong wa Laesense',
  'Issue Date': 'Letlha la go Ntshiwa',
  'Expiry Date': 'Letlha la go Fela',
  'Licence Status': 'Maemo a Laesense',

  // ═══════════════════════════════════════════════
  // DATA REQUEST (DSAR)
  // ═══════════════════════════════════════════════
  'Data Subject Access Request': 'Kopo ya Phitlhelelo ya Data ya Motho',
  'Request Type': 'Mofuta wa Kopo',
  'Access my data': 'Fitlhelela data ya me',
  'Delete my data': 'Phimola data ya me',
  'Correct my data': 'Baakanya data ya me',
  'Data portability': 'Go Sutisa data',

  // ═══════════════════════════════════════════════
  // HISTORY PAGE
  // ═══════════════════════════════════════════════
  'Timeline': 'Motseletsele wa Dinako',
  'Milestones': 'Dikgato tsa Botlhokwa',
  'From BTA to BOCRA': 'Go tswa go BTA go ya BOCRA',

  // ═══════════════════════════════════════════════
  // MISC
  // ═══════════════════════════════════════════════
  'FAQs': 'Dipotso tse di Botswang Thata',
  'Frequently Asked Questions': 'Dipotso tse di Botswang Thata',
  'Tenders': 'Ditendara',
  'Signed in': 'O tsenne',
  'My Portal': 'Portale ya Me',
  'Verify Licence': 'Netefatsa Laesense',
  'BOCRA Portal': 'Portale ya BOCRA',
  'Go to Operator Portal': 'Ya kwa Portaleng ya Modiri',
  'Back to Home': 'Boela kwa Legaeng',
};

export default TRANSLATIONS;
