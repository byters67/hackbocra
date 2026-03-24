/**
 * journeys.js — Guided Journey Decision Trees
 *
 * Phase 6: Step-by-step wizards for common citizen tasks.
 * Each journey is a self-contained decision tree rendered by GuidedJourney.jsx.
 *
 * Data structure:
 *   - steps[]: array of step objects, each with a unique `id`
 *   - options[].next: ID of the next step (null if terminal)
 *   - options[].outcome: key into the journey's `outcomes` map (terminal)
 *   - outcomes{}: map of outcome keys to outcome display objects
 *
 * All text includes English + Setswana (_tn suffix).
 */

export const journeys = [
  // ─── Journey 1: ISP / Operator Problem ───────────────────────
  {
    id: 'isp-problem',
    icon: 'Wifi',
    color: '#00A6CE',
    title: 'I have a problem with my ISP',
    title_tn: 'Ke na le bothata le ISP ya me',
    description: 'Get help with billing, network quality, unfair disconnection, or contract disputes with your service provider.',
    description_tn: 'Fumana thuso ka mathata a dituelo, boleng jwa netiweke, go kgaolwa ka go sa siama, kgotsa dikganetsano tsa dikonteraka le moabi wa tirelo ya gago.',
    steps: [
      {
        id: 'provider',
        question: 'Who is your service provider?',
        question_tn: 'Moabi wa tirelo ya gago ke mang?',
        type: 'cards',
        options: [
          { label: 'Mascom', label_tn: 'Mascom', icon: 'Phone', next: 'problem_type' },
          { label: 'BTC / beMobile', label_tn: 'BTC / beMobile', icon: 'Phone', next: 'problem_type' },
          { label: 'Orange', label_tn: 'Orange', icon: 'Phone', next: 'problem_type' },
          { label: 'Other / I\u2019m not sure', label_tn: 'O mongwe / Ga ke itse', icon: 'HelpCircle', next: 'problem_type' },
        ],
      },
      {
        id: 'problem_type',
        question: 'What type of problem are you experiencing?',
        question_tn: 'O itemogela bothata bo bo ntseng jang?',
        type: 'list',
        options: [
          { label: 'Billing or charges', label_tn: 'Dituelo kgotsa ditefiso', next: 'contacted_provider' },
          { label: 'Poor network or no signal', label_tn: 'Netiweke e e bokoa kgotsa go se na seinale', next: 'contacted_provider' },
          { label: 'Data or internet issues', label_tn: 'Mathata a data kgotsa inthanete', next: 'contacted_provider' },
          { label: 'Unfair disconnection', label_tn: 'Go kgaolwa ka go sa siama', next: 'contacted_provider' },
          { label: 'Contract or subscription dispute', label_tn: 'Kganetsano ya konteraka kgotsa sabasekeribeshene', next: 'contacted_provider' },
          { label: 'SIM swap fraud', label_tn: 'Boferefere jwa go fetola SIM', next: 'contacted_provider' },
          { label: 'Other', label_tn: 'Se sengwe', next: 'contacted_provider' },
        ],
      },
      {
        id: 'contacted_provider',
        question: 'Have you contacted your provider directly about this issue?',
        question_tn: 'A o ikgolaganye le moabi wa tirelo ka tlhamalalo ka ga bothata bo?',
        type: 'list',
        helpText: 'BOCRA recommends contacting your provider first. They may resolve your issue faster.',
        helpText_tn: 'BOCRA e gakolola gore o ikgolaganye le moabi wa tirelo pele. Ba ka rarabolola bothata jwa gago ka bonako.',
        options: [
          { label: 'Yes, but they didn\u2019t resolve it', label_tn: 'Ee, mme ga ba a bo rarabolola', next: null, outcome: 'file_complaint' },
          { label: 'No, I haven\u2019t contacted them yet', label_tn: 'Nnyaa, ga ke ise ke ikgolaganye le bona', next: null, outcome: 'contact_provider_first' },
        ],
      },
    ],
    outcomes: {
      file_complaint: {
        type: 'redirect',
        title: 'File a Complaint with BOCRA',
        title_tn: 'Kwala Ngongorego le BOCRA',
        description: 'Since your provider couldn\u2019t resolve the issue, you can file a formal complaint with BOCRA. We\u2019ll investigate on your behalf.',
        description_tn: 'Ka gore moabi wa tirelo wa gago o paletswe ke go rarabolola bothata, o ka kwala ngongorego ka semmuso le BOCRA. Re tla batlisisa mo boemong jwa gago.',
        route: '/services/file-complaint',
        buttonText: 'File Complaint',
        buttonText_tn: 'Kwala Ngongorego',
      },
      contact_provider_first: {
        type: 'info',
        title: 'Contact Your Provider First',
        title_tn: 'Ikgolaganye le Moabi wa Tirelo Pele',
        description: 'Most issues can be resolved directly with your provider. Here are their contact details:',
        description_tn: 'Mathata a le mantsi a ka rarabololwa ka go ikgolaganya le moabi wa tirelo ka tlhamalalo. Fa ke dintlha tsa bone tsa kgolagano:',
        contacts: [
          { name: 'Mascom', phone: '111', email: 'customercare@mascom.bw' },
          { name: 'BTC / beMobile', phone: '0800 600 144', email: 'customerservice@btc.bw' },
          { name: 'Orange', phone: '1234', email: 'customerservice@orange.co.bw' },
        ],
        followUp: 'If your provider doesn\u2019t resolve the issue within 14 days, come back and file a complaint with BOCRA.',
        followUp_tn: 'Fa moabi wa tirelo wa gago a sa rarabolole bothata mo malatsing a le 14, boela kwano o kwale ngongorego le BOCRA.',
        route: '/services/file-complaint',
        buttonText: 'I already tried \u2014 File Complaint',
        buttonText_tn: 'Ke setse ke lekile \u2014 Kwala Ngongorego',
      },
    },
  },

  // ─── Journey 2: Apply for a Licence ──────────────────────────
  {
    id: 'apply-licence',
    icon: 'FileText',
    color: '#00458B',
    title: 'I want to apply for a licence',
    title_tn: 'Ke batla go ikopela laesense',
    description: 'Find the right licence type for your telecommunications, broadcasting, or postal business.',
    description_tn: 'Bona mofuta o o siameng wa laesense bakeng sa kgwebo ya gago ya megala, phasalatso, kgotsa poso.',
    steps: [
      {
        id: 'licence_type',
        question: 'What type of licence are you looking for?',
        question_tn: 'O batla mofuta ofe wa laesense?',
        type: 'list',
        options: [
          { label: 'Network Facility Provider (NFP)', label_tn: 'Moabi wa Mafaratlhatlha a Netiweke (NFP)', next: null, outcome: 'go_licensing',
            detail: 'Build and operate network infrastructure (towers, fibre, etc.)',
            detail_tn: 'Aga le go tsamaisa mafaratlhatlha a netiweke (ditora, faepa, jj.)' },
          { label: 'Application Service Provider (ASP)', label_tn: 'Moabi wa Ditirelo tsa Tirisano (ASP)', next: null, outcome: 'go_licensing',
            detail: 'Provide services over existing networks (ISP, VoIP, etc.)',
            detail_tn: 'Fana ka ditirelo mo dinetiwekeng tse di leng teng (ISP, VoIP, jj.)' },
          { label: 'Content Service Provider (CSP)', label_tn: 'Moabi wa Ditirelo tsa Diteng (CSP)', next: null, outcome: 'go_licensing',
            detail: 'Provide content services (TV channels, streaming, etc.)',
            detail_tn: 'Fana ka ditirelo tsa diteng (dikanale tsa TV, go streama, jj.)' },
          { label: 'Broadcasting', label_tn: 'Phasalatso', next: null, outcome: 'go_licensing',
            detail: 'Operate radio or television broadcasting services',
            detail_tn: 'Tsamaisa ditirelo tsa phasalatso ya radio kgotsa thelebishene' },
          { label: 'Postal / Courier', label_tn: 'Poso / Motho yo o Isang', next: null, outcome: 'go_licensing',
            detail: 'Operate postal or courier delivery services',
            detail_tn: 'Tsamaisa ditirelo tsa poso kgotsa go isa diposo' },
          { label: 'Radio Frequency / Spectrum', label_tn: 'Magetla a Radio / Sepeketerama', next: null, outcome: 'go_licensing',
            detail: 'Use radio frequencies (amateur, aircraft, private radio, etc.)',
            detail_tn: 'Dirisa magetla a radio (baratani, difofane, radio ya poraefete, jj.)' },
          { label: 'I\u2019m not sure', label_tn: 'Ga ke itse', next: null, outcome: 'go_licensing',
            detail: 'Browse all 13 licence types on our Licensing Hub',
            detail_tn: 'Lebelela mefuta yotlhe ya dilaesense di le 13 mo Setlhogong sa Dilaesense' },
        ],
      },
    ],
    outcomes: {
      go_licensing: {
        type: 'redirect',
        title: 'Visit the Licensing Hub',
        title_tn: 'Etela Setlhogo sa Dilaesense',
        description: 'Our Licensing Hub has detailed information about all 13 licence types, requirements, fees, and application forms.',
        description_tn: 'Setlhogo sa rona sa Dilaesense se na le tshedimosetso e e feletseng ka ga mefuta yotlhe ya dilaesense di le 13, ditlhokego, dituelo, le diforomo tsa dikopo.',
        route: '/licensing',
        buttonText: 'Go to Licensing Hub',
        buttonText_tn: 'Ya kwa Setlhogong sa Dilaesense',
      },
    },
  },

  // ─── Journey 3: Find a Regulation ────────────────────────────
  {
    id: 'find-regulation',
    icon: 'BookOpen',
    color: '#C8237B',
    title: 'I want to find a regulation',
    title_tn: 'Ke batla go bona molao',
    description: 'Search BOCRA\u2019s library of 420+ documents including legislation, guidelines, reports, and policies.',
    description_tn: 'Batla mo bokgobapukung jwa BOCRA jwa dikwalo di le 420+ go akaretsa melao, ditaelo, dipegelo, le dipholisi.',
    steps: [
      {
        id: 'sector',
        question: 'Which sector is the regulation about?',
        question_tn: 'Molao o o ka ga lefapha lefe?',
        type: 'cards',
        options: [
          { label: 'Telecommunications', label_tn: 'Megala', icon: 'Wifi', next: 'doc_type', color: '#00A6CE' },
          { label: 'Broadcasting', label_tn: 'Phasalatso', icon: 'Radio', next: 'doc_type', color: '#C8237B' },
          { label: 'Postal Services', label_tn: 'Ditirelo tsa Poso', icon: 'Mail', next: 'doc_type', color: '#F7B731' },
          { label: 'Internet & ICT', label_tn: 'Inthanete le ICT', icon: 'Globe', next: 'doc_type', color: '#6BBE4E' },
          { label: 'Cybersecurity', label_tn: 'Tshireletso ya Saebo', icon: 'Shield', next: 'doc_type', color: '#00458B' },
          { label: 'All / Not sure', label_tn: 'Tsotlhe / Ga ke itse', icon: 'Search', next: null, outcome: 'go_documents' },
        ],
      },
      {
        id: 'doc_type',
        question: 'What type of document are you looking for?',
        question_tn: 'O batla mofuta ofe wa sekwalo?',
        type: 'list',
        options: [
          { label: 'Legislation (Acts & Laws)', label_tn: 'Molao (Melao le Ditaelo)', next: null, outcome: 'go_documents' },
          { label: 'Guidelines & Standards', label_tn: 'Ditaelo le Maemo', next: null, outcome: 'go_documents' },
          { label: 'Reports & Publications', label_tn: 'Dipegelo le Dikgatiso', next: null, outcome: 'go_documents' },
          { label: 'Policies & Frameworks', label_tn: 'Dipholisi le Dithulaganyo', next: null, outcome: 'go_documents' },
          { label: 'All types', label_tn: 'Mefuta yotlhe', next: null, outcome: 'go_documents' },
        ],
      },
    ],
    outcomes: {
      go_documents: {
        type: 'redirect',
        title: 'Browse the Document Library',
        title_tn: 'Lebelela Bokgobapuku jwa Dikwalo',
        description: 'Our document library contains 420+ regulatory documents. Use the category and year filters to narrow your search.',
        description_tn: 'Bokgobapuku jwa rona jwa dikwalo bo na le dikwalo tsa taolo di le 420+. Dirisa difilterara tsa setlhopha le ngwaga go fokotsa patlo ya gago.',
        route: '/documents/drafts',
        buttonText: 'Browse Documents',
        buttonText_tn: 'Lebelela Dikwalo',
      },
    },
  },

  // ─── Journey 4: Participate in a Consultation ────────────────
  {
    id: 'join-consultation',
    icon: 'MessageSquare',
    color: '#F7B731',
    title: 'I want to participate in a consultation',
    title_tn: 'Ke batla go tsaya karolo mo theriso-puisanong',
    description: 'Have your say on proposed regulations and policies that affect telecommunications, broadcasting, and postal services.',
    description_tn: 'Nna le seabe mo melaong le dipholising tse di tshitshinywang tse di amang megala, phasalatso, le ditirelo tsa poso.',
    steps: [
      {
        id: 'info',
        question: 'What is a public consultation?',
        question_tn: 'Theriso-puisano ya setshaba ke eng?',
        type: 'info',
        infoText: 'Before BOCRA introduces new rules or changes existing ones, we invite the public to comment. Your input helps us make better decisions that serve all citizens of Botswana. Consultations are open to everyone \u2014 citizens, businesses, and organisations.',
        infoText_tn: 'Pele BOCRA e tlhagisa melao e mesha kgotsa e fetola e e leng teng, re laletsa setshaba go fana ka maikutlo. Ditshwaelo tsa gago di re thusa go tsaya ditshwetso tse di botoka tse di direlang baagi botlhe ba Botswana. Ditheriso-puisano di bulegile go botlhe \u2014 baagi, dikgwebo, le mekgatlho.',
        options: [
          { label: 'Show me open consultations', label_tn: 'Mpontshe ditheriso-puisano tse di buletsweng', next: null, outcome: 'go_consultations' },
        ],
      },
    ],
    outcomes: {
      go_consultations: {
        type: 'redirect',
        title: 'View Open Consultations',
        title_tn: 'Bona Ditheriso-puisano tse di Buletsweng',
        description: 'See all current open consultations and submit your response. Your voice matters!',
        description_tn: 'Bona ditheriso-puisano tsotlhe tse di buletsweng ga jaana mme o romele karabo ya gago. Lentswe la gago le botlhokwa!',
        route: '/consultations',
        buttonText: 'View Consultations',
        buttonText_tn: 'Bona Ditheriso-puisano',
      },
    },
  },

  // ─── Journey 5: Register a .BW Domain ────────────────────────
  {
    id: 'register-domain',
    icon: 'Globe',
    color: '#6BBE4E',
    title: 'I want to register a .BW domain',
    title_tn: 'Ke batla go kwadisa lefelo la .BW',
    description: 'Get your Botswana country-code domain name (.bw) for your website or business.',
    description_tn: 'Bona leina la lefelo la khoutu ya naga ya Botswana (.bw) bakeng sa webosaete kgotsa kgwebo ya gago.',
    steps: [
      {
        id: 'domain_action',
        question: 'What would you like to do?',
        question_tn: 'O batla go dira eng?',
        type: 'cards',
        options: [
          { label: 'Register a new .bw domain', label_tn: 'Kwadisa lefelo le lesha la .bw', icon: 'Plus', next: null, outcome: 'new_domain' },
          { label: 'Manage an existing domain', label_tn: 'Laola lefelo le le leng teng', icon: 'Settings', next: null, outcome: 'existing_domain' },
        ],
      },
    ],
    outcomes: {
      new_domain: {
        type: 'redirect',
        title: 'Register a .BW Domain',
        title_tn: 'Kwadisa Lefelo la .BW',
        description: 'Find accredited registrars, check domain availability, and learn about registration requirements and fees.',
        description_tn: 'Bona bakwadisi ba ba amogeletsweng, tlhola gore lefelo le teng, mme o ithute ka ditlhokego le dituelo tsa kwadiso.',
        route: '/services/register-bw',
        buttonText: 'Register Domain',
        buttonText_tn: 'Kwadisa Lefelo',
      },
      existing_domain: {
        type: 'redirect',
        title: 'Registry Portal',
        title_tn: 'Potala ya Rejisteri',
        description: 'Log in to the .BW Registry Portal to manage your existing domain, update DNS settings, or renew your registration.',
        description_tn: 'Tsena mo Potaleng ya Rejisteri ya .BW go laola lefelo la gago le le leng teng, go fetola dithulaganyo tsa DNS, kgotsa go ntšhafatsa kwadiso ya gago.',
        route: '/services/register-bw/login',
        buttonText: 'Go to Registry Portal',
        buttonText_tn: 'Ya kwa Potaleng ya Rejisteri',
      },
    },
  },
];
