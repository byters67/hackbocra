/**
 * Generic Content Page
 *
 * A reusable template for content-heavy pages like:
 * - Mandate sub-pages (Telecommunications, Broadcasting, Postal, Internet, Licensing)
 * - About sub-pages (Chief Executive, History, Board, Executive Management)
 * - Services pages (Licence Verification, Type Approval, Register .BW, QoS, Spectrum)
 * - Other pages (Privacy Notice, Telecom Statistics, etc.)
 *
 * Content will be fetched from Supabase 'pages' table by slug.
 * For now, uses placeholder content from the BOCRA Website Audit.
 *
 * BILINGUAL SUPPORT:
 *   Each page entry can optionally include title_tn, breadcrumb_tn, and content_tn
 *   fields for Setswana. If missing, English is used as fallback.
 *
 * NOTE: dangerouslySetInnerHTML is the existing project pattern per the GUIDE.
 * All content is from hardcoded template strings within this file, not user input.
 * This is safe because the HTML is authored by the development team.
 */

/* ═══════════════════════════════════════════════════
 * IMPORTS
 * React, routing, UI libraries, and project modules.
 * ═══════════════════════════════════════════════════ */

import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useScrollReveal } from '../../hooks/useAnimations';
import { useLanguage } from '../../lib/language';
import usePageContent from '../../hooks/usePageContent';
import { sanitizeHtml } from '../../lib/sanitizeHtml';
import Breadcrumb from '../../components/ui/Breadcrumb';

/* ═══════════════════════════════════════════════════
 * DATA & CONSTANTS
 * Bilingual page content database and accent/colour mappings.
 * ═══════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE CONTENT DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
//
// HOW TO EDIT: Find the page you want by its slug (e.g., 'telecommunications').
// Edit the 'content' field using HTML inside backticks (` `).
//
// HOW TO ADD A NEW PAGE: Copy any existing entry, change the slug (key),
// title, breadcrumb, and content. Then add a matching <Route> in App.jsx.
//
// BILINGUAL: Add title_tn, breadcrumb_tn, content_tn for Setswana.
// If any _tn field is missing, English is shown as fallback.
//
// RULES:
//   - Use \u2019 for apostrophes (not straight quotes)
//   - Use \u2014 for em-dashes
//   - Use &amp; for ampersands in HTML content
//   - Available accent colours: bocra-blue, bocra-cyan, bocra-magenta, bocra-yellow, bocra-green
//
// See GUIDE_MANUAL_EDITING.md for full instructions.
// ═══════════════════════════════════════════════════════════════════════════════

const PAGE_CONTENT = {

  // ──────────────────────────────────────────────────────────────
  // MANDATE SECTION — Pages under the "Mandate" dropdown menu
  // ──────────────────────────────────────────────────────────────

  'telecommunications': {
    title: 'Telecommunications',
    breadcrumb: ['Mandate', 'Telecommunications'],
    accent: 'bocra-cyan',
    content: `
      <h2>Telecommunications Regulation in Botswana</h2>
      <p>The telecommunications sector in Botswana has undergone significant transformation since the 1995 Telecommunications Policy, which opened the market to competition. BOCRA regulates three Primary Telecommunications Operators (PTOs): Botswana Telecommunications Corporation (BTC), Mascom Wireless, and Orange Botswana.</p>

      <h3>Licensing Framework</h3>
      <p>The licensing framework includes Network Facility Provider (NFP) licences, Service Application Provider (SAP) licences, and Content Service Provider (CSP) licences. Value Added Network Services (VANS) have been liberalised, and VoIP services are permitted under the current regulatory framework.</p>

      <h3>Market Reforms</h3>
      <p>Since 1998, BOCRA has implemented progressive market reforms including the introduction of Private Telecommunications Network Licences (PTNL), interconnection guidelines, and tariff regulations to ensure fair competition and affordable services for all Batswana.</p>

      <h3>Key Operators</h3>
      <ul>
        <li><strong>Mascom Wireless</strong> \u2014 Leading mobile operator</li>
        <li><strong>BTC (be Mobile)</strong> \u2014 National telecommunications company</li>
        <li><strong>Orange Botswana</strong> \u2014 Third mobile network operator</li>
        <li><strong>BoFiNet</strong> \u2014 National broadband backbone provider</li>
      </ul>
    `,
    title_tn: 'Megala le Dikgolagano',
    breadcrumb_tn: ['Taelo', 'Megala le Dikgolagano'],
    content_tn: `
      <h2>Taolo ya Megala le Dikgolagano mo Botswana</h2>
      <p>Lefapha la megala le dikgolagano mo Botswana le fetogile thata go tloga ka Pholisi ya Megala ya 1995, e e buileng mebaraka go kgaisano. BOCRA e laola Batsamaisi ba Bararo ba Megala (PTOs): Botswana Telecommunications Corporation (BTC), Mascom Wireless, le Orange Botswana.</p>

      <h3>Letlhomeso la Dilaesense</h3>
      <p>Letlhomeso la dilaesense le akaretsa dilaesense tsa Network Facility Provider (NFP), Service Application Provider (SAP), le Content Service Provider (CSP). Ditirelo tsa Value Added Network Services (VANS) di ntshitswe mo taolong, mme ditirelo tsa VoIP di letlelelwa ka fa tlase ga letlhomeso la gompieno la taolo.</p>

      <h3>Diphetogo tsa Mebaraka</h3>
      <p>Go tloga ka 1998, BOCRA e dirisitse diphetogo tsa mebaraka tse di tsweletseng pele go akaretsa go tlhagisiwa ga dilaesense tsa Private Telecommunications Network (PTNL), ditaelo tsa kopanyo, le melawana ya dituelo go netefatsa kgaisano e e siameng le ditirelo tse di kgonega mo Batswaneng botlhe.</p>

      <h3>Batsamaisi ba Bagolo</h3>
      <ul>
        <li><strong>Mascom Wireless</strong> \u2014 Motsamaisi wa mogala o mogolo</li>
        <li><strong>BTC (be Mobile)</strong> \u2014 Kompone ya megala ya bosetšhaba</li>
        <li><strong>Orange Botswana</strong> \u2014 Motsamaisi wa boraro wa netweke ya mogala</li>
        <li><strong>BoFiNet</strong> \u2014 Motlamedi wa broadband wa bosetšhaba</li>
      </ul>
    `,
  },
  'broadcasting': {
    title: 'Broadcasting',
    breadcrumb: ['Mandate', 'Broadcasting'],
    accent: 'bocra-magenta',
    content: `
      <h2>Broadcasting Regulation</h2>
      <p>The CRA Act mandates BOCRA to regulate all broadcasting, subscription management services and re-broadcasting activities save for state broadcasting. BOCRA regulates commercial radio and television broadcasting in Botswana.</p>

      <h3>Licensed Commercial Radio Stations</h3>
      <ul>
        <li><strong>Yarona FM</strong> \u2014 Available in most major towns and villages in Botswana, also accessible worldwide via online broadcasting</li>
        <li><strong>Duma FM</strong> \u2014 Available in most major towns and villages, with online broadcasting for worldwide access</li>
        <li><strong>Gabz FM</strong> \u2014 Available in most major towns and villages, with online broadcasting for worldwide access</li>
      </ul>

      <h3>Licensed Television</h3>
      <ul>
        <li><strong>eBotswana TV</strong> \u2014 Currently available in Gaborone and surrounding villages within a 60km radius through terrestrial broadcasting. Plans to introduce satellite broadcast service for national coverage.</li>
      </ul>

      <h3>Local Content Requirements</h3>
      <p>Broadcasters are required to promote music tracks by local artists. Broadcasters\u2019 licences specify a certain percentage of local content to be complied with, promoting Botswana culture, talent, and perspectives in the media landscape.</p>

      <h3>Online Broadcasting</h3>
      <p>Commercial radio stations have extended access to their services through online broadcasting transmission, making them accessible worldwide. This extends BOCRA\u2019s regulatory mandate into digital broadcasting platforms.</p>
    `,
    title_tn: 'Phasalatso',
    breadcrumb_tn: ['Taelo', 'Phasalatso'],
    content_tn: `
      <h2>Taolo ya Phasalatso</h2>
      <p>Molao wa CRA o laela BOCRA go laola phasalatso yotlhe, ditirelo tsa taolo ya disamosetšene le ditiro tsa go phasalatsa gape kwantle ga phasalatso ya puso. BOCRA e laola phasalatso ya radio le ya thelebišene ya kgwebo mo Botswana.</p>

      <h3>Diteišene tsa Radio tsa Kgwebo tse di nang le Laesense</h3>
      <ul>
        <li><strong>Yarona FM</strong> \u2014 E bonwa mo ditoropong le metsaneng e mentsi mo Botswana, gape e fitlhelelwa lefatshe lotlhe ka phasalatso ya mo inthaneteng</li>
        <li><strong>Duma FM</strong> \u2014 E bonwa mo ditoropong le metsaneng e mentsi, ka phasalatso ya mo inthaneteng ya go fitlhelelwa lefatshe lotlhe</li>
        <li><strong>Gabz FM</strong> \u2014 E bonwa mo ditoropong le metsaneng e mentsi, ka phasalatso ya mo inthaneteng ya go fitlhelelwa lefatshe lotlhe</li>
      </ul>

      <h3>Thelebišene e e nang le Laesense</h3>
      <ul>
        <li><strong>eBotswana TV</strong> \u2014 Ga jaana e bonwa mo Gaborone le metsaneng e e e dikologileng mo radiaseng ya 60km ka phasalatso ya lefatshe. Go na le dithulaganyo tsa go tlhagisa tirelo ya phasalatso ya satellite go akaretsa naga yotlhe.</li>
      </ul>

      <h3>Ditlhokego tsa Diteng tsa Selegae</h3>
      <p>Baphasalatsi ba tshwanetse go rotloetsa dipina tsa baopedi ba selegae. Dilaesense tsa baphasalatsi di tlhomamisa phesente e e rileng ya diteng tsa selegae e e tshwanetseng go latelwa, go rotloetsa setso sa Botswana, bokgoni, le dikakanyo mo lefapheng la bobegakgang.</p>

      <h3>Phasalatso ya mo Inthaneteng</h3>
      <p>Diteišene tsa radio tsa kgwebo di okeleditse phitlhelelo ya ditirelo tsa tsone ka phasalatso ya mo inthaneteng, e e di dirang gore di fitlhelelwe lefatshe lotlhe. Se se atolosa taelo ya taolo ya BOCRA go ya mo ditseleng tsa phasalatso ya dijithale.</p>
    `,
  },
  'postal': {
    title: 'Postal Services',
    breadcrumb: ['Mandate', 'Postal'],
    accent: 'bocra-yellow',
    content: `
      <h2>Postal Services Regulation</h2>
      <p>The CRA Act, 2012 ushered in a new dawn of regulation for the postal sector as BOCRA assumed the mandate of supervising the provision of postal services in Botswana. The CRA Act prohibits any person from providing postal services without a valid licence issued by BOCRA.</p>

      <p>The Authority is mandated to ensure that there is provision of safe, reliable, efficient and affordable postal services throughout Botswana.</p>

      <h3>Market Structure</h3>
      <p>The postal sector is divided into two main categories:</p>
      <ul>
        <li><strong>Universal Postal Services</strong> \u2014 Provided by the Designated Postal Operator (DPO), ensuring nationwide mail delivery coverage</li>
        <li><strong>Commercial Postal Services</strong> \u2014 Courier and value-added services provided by licensed Commercial Postal Operators (CPOs)</li>
      </ul>

      <h3>Licensing Categories</h3>
      <ul>
        <li><strong>Public Postal Operator / Designated Postal Operator (DPO)</strong> \u2014 Designated to provide universal postal service across Botswana</li>
        <li><strong>Commercial Postal Operator (CPO)</strong> \u2014 Licensed courier, express mail, and value-added postal services</li>
      </ul>

      <h3>Regulatory Instruments</h3>
      <p>BOCRA has prepared regulatory instruments and tools that allow ease of market entry and support innovation for the provision of varied postal service offerings. These include the Postal Sector Licensing Framework to guide the provision of postal services in the country.</p>

      <h3>Interconnection</h3>
      <p>Postal service operators offering interconnection services are regulated to ensure seamless mail delivery across the national network.</p>
    `,
    title_tn: 'Ditirelo tsa Poso',
    breadcrumb_tn: ['Taelo', 'Poso'],
    content_tn: `
      <h2>Taolo ya Ditirelo tsa Poso</h2>
      <p>Molao wa CRA, 2012 o tlhagisitse paka e ntšhwa ya taolo ya lefapha la poso ka BOCRA e tsereng taelo ya go okamela tlhagiso ya ditirelo tsa poso mo Botswana. Molao wa CRA o thibela motho mongwe le mongwe go tlamela ka ditirelo tsa poso kwantle ga laesense e e siameng e e ntshitsweng ke BOCRA.</p>

      <p>Boto e laelwa go netefatsa gore go na le tlhagiso ya ditirelo tsa poso tse di babalesegileng, tse di ikanyegang, tse di nonofileng le tse di kgonega mo Botswana yotlhe.</p>

      <h3>Popego ya Mebaraka</h3>
      <p>Lefapha la poso le arolwa ka dikarolo di le pedi tse dikgolo:</p>
      <ul>
        <li><strong>Ditirelo tsa Poso e e Akaretsang</strong> \u2014 Di tlamelwa ke Motsamaisi wa Poso o o Tlhophilweng (DPO), go netefatsa phitlhelelo ya go romela diposo mo nageng yotlhe</li>
        <li><strong>Ditirelo tsa Poso ya Kgwebo</strong> \u2014 Ditirelo tsa courier le tse di okeditsweng tse di tlamelwang ke Batsamaisi ba Poso ya Kgwebo (CPOs) ba ba nang le dilaesense</li>
      </ul>

      <h3>Mefuta ya Dilaesense</h3>
      <ul>
        <li><strong>Motsamaisi wa Poso ya Setšhaba / Motsamaisi wa Poso o o Tlhophilweng (DPO)</strong> \u2014 O tlhophilwe go tlamela ka tirelo ya poso e e akaretsang mo Botswana yotlhe</li>
        <li><strong>Motsamaisi wa Poso ya Kgwebo (CPO)</strong> \u2014 Ditirelo tsa courier tse di nang le laesense, poso e e potlakileng, le ditirelo tsa poso tse di okeditsweng</li>
      </ul>

      <h3>Didirisiwa tsa Taolo</h3>
      <p>BOCRA e baakantse didirisiwa le didiriswa tsa taolo tse di letlang bonolo jwa go tsena mo mebarakeng le go tshegetsa boitlhamedi jwa go tlamela ka ditirelo tse di farologaneng tsa poso.</p>

      <h3>Kopanyo</h3>
      <p>Batsamaisi ba ditirelo tsa poso ba ba tlamelang ka ditirelo tsa kopanyo ba laolwa go netefatsa go romelwa ga diposo go se na dikgoreletsi mo netwekeng ya bosetšhaba.</p>
    `,
  },
  'internet': {
    title: 'Internet & ICT',
    breadcrumb: ['Mandate', 'Internet'],
    accent: 'bocra-green',
    content: `
      <h2>Internet Regulation</h2>
      <p>BOCRA plays a crucial role in Internet regulation in Botswana. The growth of internet services has been driven primarily by smartphone adoption, which has accelerated mobile broadband uptake across the country.</p>

      <h3>Key Initiatives</h3>
      <ul>
        <li><strong>.BW Domain Management</strong> \u2014 BOCRA administers the .bw country code top-level domain under Section 38(1) of the CRA Act, serving as trustee, administrative and technical contact</li>
        <li><strong>BW CIRT</strong> \u2014 The National Computer Incident Response Team operates under BOCRA as part of the National Cybersecurity Strategy developed by the Ministry of Transport and Communications</li>
        <li><strong>EASSy Submarine Cable</strong> \u2014 The Eastern Africa Submarine Cable System has significantly impacted broadband pricing in Botswana, enabling more affordable international bandwidth</li>
        <li><strong>Cybersecurity</strong> \u2014 Implementation of the National Cybersecurity Strategy and the Cybersecurity Act 2025</li>
      </ul>

      <h3>Hospitality WiFi Guidelines</h3>
      <p>BOCRA has developed guidelines for WiFi provision in the hospitality sector, ensuring that hotels, lodges, and public venues can provide internet access to visitors while complying with regulatory requirements.</p>

      <h3>Wholesale Bandwidth Pricing</h3>
      <p>BOCRA monitors wholesale bandwidth pricing trends to ensure competitive downstream pricing for consumers. The impact of international submarine cable connectivity through the EASSy cable has contributed to significant reductions in wholesale bandwidth costs.</p>

      <h3>Broadband Growth</h3>
      <p>Mobile broadband continues to grow rapidly, driven by increasing smartphone adoption and BOCRA-directed data price reductions by operators. Fixed broadband penetration is supported by BoFiNet\u2019s national backbone infrastructure.</p>
    `,
    title_tn: 'Inthanete le ICT',
    breadcrumb_tn: ['Taelo', 'Inthanete'],
    content_tn: `
      <h2>Taolo ya Inthanete</h2>
      <p>BOCRA e tshameka karolo e e botlhokwa mo taolong ya inthanete mo Botswana. Kgolo ya ditirelo tsa inthanete e tsamaisitswe thata ke go amogela megala ya bofefo, se se potlakisitseng tiriso ya broadband ya mogala mo nageng yotlhe.</p>

      <h3>Dithulaganyo tse Dikgolo</h3>
      <ul>
        <li><strong>Taolo ya Lefelo la .BW</strong> \u2014 BOCRA e laola lefelo la .bw la khoutu ya naga ka fa tlase ga Karolo 38(1) ya Molao wa CRA</li>
        <li><strong>BW CIRT</strong> \u2014 Setlhopha sa Bosetšhaba sa Tshiamelo ya Dikotsi tsa Khomphiutha se dira ka fa tlase ga BOCRA</li>
        <li><strong>Terata ya ka fa Tlase ga Lewatle ya EASSy</strong> \u2014 Tsamaiso ya Terata ya ka fa Tlase ga Lewatle ya Afrika Botlhaba e amile ditlhwatlhwa tsa broadband mo Botswana thata</li>
        <li><strong>Tshireletso ya Saebara</strong> \u2014 Go diragatsa Togamaano ya Bosetšhaba ya Tshireletso ya Saebara le Molao wa Tshireletso ya Saebara wa 2025</li>
      </ul>

      <h3>Ditaelo tsa WiFi ya Boeng</h3>
      <p>BOCRA e dirile ditaelo tsa go tlamela ka WiFi mo lefapheng la boeng, go netefatsa gore dihotele, diloše, le mafelo a setšhaba a ka tlamela baeng ka phitlhelelo ya inthanete.</p>

      <h3>Ditlhwatlhwa tsa Bandwidth ya Kgwebisano</h3>
      <p>BOCRA e tlhokomela ditlhwatlhwa tsa bandwidth ya kgwebisano go netefatsa ditlhwatlhwa tse di kgaisanyang tsa badirisi.</p>

      <h3>Kgolo ya Broadband</h3>
      <p>Broadband ya mogala e tswelela go gola ka bonako, e tsamaiswa ke tiriso e e oketsegeng ya megala ya bofefo le go fokotsa ga ditlhwatlhwa tsa data go laetswe ke BOCRA.</p>
    `,
  },
  'legislation': {
    title: 'Legislation',
    breadcrumb: ['Mandate', 'Legislation'],
    accent: 'bocra-blue',
    content: `
      <h2>Governing Legislation</h2>
      <p>The Botswana Communications Regulatory Authority (BOCRA) is an independent communications regulatory authority established through the Communications Regulatory Authority Act 2012 (CRA) on 1 April 2013 with the mandate to regulate the communications sector in Botswana comprising Telecommunications, Internet and Information and Communications Technologies (ICTs), Radio communications, Broadcasting, Postal services and related matters.</p>

      <p>BOCRA also has a mandate under the Electronic Records (Evidence) Act No 13 of 2014. That Act deals with the admissibility of electronic evidence in court, to establish an approved process for the production of electronic documents and also certify electronic records systems for purposes of integrity.</p>

      <p>The Electronic Communications and Transactions Act, 2014 mandates BOCRA to carry out accreditation of the secure digital signature service providers and administration of the take down notices.</p>

      <h3>Key Legislation</h3>
      <ul>
        <li><strong>Communications Regulatory Authority Act, 2012</strong> \u2014 Establishes BOCRA and defines its mandate.</li>
        <li><strong>Electronic Records (Evidence) Act No. 13 of 2014</strong> \u2014 Allows for the admissibility and authentication of electronic records as evidence in legal proceedings.</li>
        <li><strong>Electronic Communications and Transactions Act, 2014</strong> \u2014 Mandates BOCRA to carry out accreditation of secure digital signature service providers.</li>
        <li><strong>Universal Access and Service Notarial Deed of Trust</strong> \u2014 Establishes the UASF for extending communications services to underserved areas.</li>
        <li><strong>Digital Services Act, 2025</strong> \u2014 New framework for regulating digital services in Botswana.</li>
        <li><strong>Cybersecurity Act, 2025</strong> \u2014 National cybersecurity governance and incident response framework.</li>
        <li><strong>Botswana Data Protection Act, 2024 (BDPA)</strong> \u2014 Governs the collection, processing, and storage of personal data.</li>
      </ul>
    `,
    title_tn: 'Melao',
    breadcrumb_tn: ['Taelo', 'Melao'],
    content_tn: `
      <h2>Melao e e Laolang</h2>
      <p>Botswana Communications Regulatory Authority (BOCRA) ke boto e e ikemetseng ya taolo ya dikgolagano e e tlhomilweng ka Molao wa Communications Regulatory Authority Act 2012 (CRA) ka la 1 Moranang 2013 ka taelo ya go laola lefapha la dikgolagano mo Botswana.</p>

      <h3>Melao e e Botlhokwa</h3>
      <ul>
        <li><strong>Molao wa Communications Regulatory Authority, 2012</strong> \u2014 O tlhoma BOCRA le go tlhalosa taelo ya yone.</li>
        <li><strong>Molao wa Electronic Records (Evidence) No. 13 wa 2014</strong> \u2014 O letla go amogela le go netefatsa direkoto tsa elektroniki jaaka bosupi mo tsamaisong ya molao.</li>
        <li><strong>Molao wa Electronic Communications and Transactions, 2014</strong> \u2014 O laela BOCRA go diragatsa tumelano ya batlamedi ba ditirelo tsa saeno ya dijithale.</li>
        <li><strong>Universal Access and Service Notarial Deed of Trust</strong> \u2014 O tlhoma Letlole la UASF go atolosa ditirelo tsa dikgolagano.</li>
        <li><strong>Molao wa Digital Services, 2025</strong> \u2014 Letlhomeso le lesha la go laola ditirelo tsa dijithale mo Botswana.</li>
        <li><strong>Molao wa Cybersecurity, 2025</strong> \u2014 Letlhomeso la bosetšhaba la puso ya tshireletso ya saebara.</li>
        <li><strong>Molao wa Tshireletso ya Data wa Botswana, 2024 (BDPA)</strong> \u2014 O laola go kokoanya, go dirisa, le go boloka tshedimosetso ya motho ka namana.</li>
      </ul>
    `,
  },
  'licensing': {
    title: 'Licensing',
    breadcrumb: ['Mandate', 'Licensing'],
    accent: 'bocra-blue',
    content: `
      <h2>Licensing Framework</h2>
      <p>BOCRA is mandated by Section 6(h) of the CRA Act to process applications for and issue licences, permits, permissions, concessions and authorities for regulated sectors being telecommunications, Internet, radio communications, broadcasting and postal.</p>

      <h3>Major Licensing Categories</h3>
      <ul>
        <li><strong>Network Facilities Provider (NFP)</strong> \u2014 Licensees own, operate or provide any form of physical infrastructure used principally for carrying services, applications and content.</li>
        <li><strong>Service Application Provider (SAP)</strong> \u2014 Licensees provide telecommunications services to end users using network facilities provided by NFP licensees.</li>
        <li><strong>Content Service Provider (CSP)</strong> \u2014 Licensees provide content material solely for broadcasting (TV and radio) and other information services including Subscription TV.</li>
      </ul>

      <h3>Postal Licensing</h3>
      <ul>
        <li><strong>Designated Postal Operator (DPO)</strong> \u2014 Provides for a postal operator to be designated to carry universal postal service obligations</li>
        <li><strong>Commercial Postal Operator (CPO)</strong> \u2014 Provides for postal operators which provide value-added services</li>
      </ul>

      <h3>Apply for a Licence</h3>
      <p>Choose the type of licence you are applying for from the following list:</p>
      <ul>
        <li>Aircraft Radio Station Licence</li>
        <li>Amateur Radio Licence</li>
        <li>Broadcasting Licence</li>
        <li>Cellular Licence</li>
        <li>Citizen Band Radio Licence</li>
        <li>Point-to-Multipoint Radio Licence</li>
        <li>Private Telecommunications Network Licence (PTNL)</li>
        <li>Public Telecommunications Operator Licence</li>
        <li>Postal Operator Licence</li>
        <li>Value Added Network Services (VANS) Licence</li>
        <li>Ship Station Radio Licence</li>
        <li>VSAT Terminal Licence</li>
      </ul>
    `,
    title_tn: 'Dilaesense',
    breadcrumb_tn: ['Taelo', 'Dilaesense'],
  },
  // About sub-pages
  'chief-executive': {
    title: 'A Word From The Chief Executive',
    breadcrumb: ['About', 'Chief Executive'],
    accent: 'bocra-blue',
    content: `
      <h2>Mr. Martin Mokgware \u2014 Chief Executive</h2>
      <p>Welcome to the Botswana Communications Regulatory Authority website. As Chief Executive, I invite all stakeholders \u2014 citizens, licensees, and partners \u2014 to explore our digital platform and engage with us on matters of communications regulation.</p>
      <p>BOCRA remains committed to fostering a competitive, innovative, and consumer-friendly communications environment in Botswana. We continue to work towards our vision of a connected and digitally driven society.</p>
      <p>I encourage you to use our online services, provide feedback, and partner with us in building a better-connected Botswana for all.</p>
    `,
    title_tn: 'Lefoko go Tswa go Motlhankedi yo Mogolo',
    breadcrumb_tn: ['Ka ga Rona', 'Motlhankedi yo Mogolo'],
    content_tn: `
      <h2>Rre Martin Mokgware \u2014 Motlhankedi yo Mogolo</h2>
      <p>Re le amogela mo webosaeteng ya Botswana Communications Regulatory Authority. Jaaka Motlhankedi yo Mogolo, ke laletsa baamegi botlhe \u2014 baagi, ba ba nang le dilaesense, le balekane \u2014 go sekaseka setheo sa rona sa dijithale le go ikgolaganya le rona mo merarong ya taolo ya dikgolagano.</p>
      <p>BOCRA e ntse e ikemiseditse go rotloetsa tikologo ya dikgolagano e e nang le kgaisano, boitlhamedi, le e e ratang badirisi mo Botswana. Re tswelela go dira go ya pelong ya rona ya setšhaba se se golaganeng le se se etelletsweng pele ke dijithale.</p>
      <p>Ke lo rotloetsa go dirisa ditirelo tsa rona tsa mo inthaneteng, go neela maikutlo, le go nna balekane ba rona mo go ageng Botswana e e golaganeng botoka mo go botlhe.</p>
    `,
  },
  'board': {
    title: 'Board of Directors',
    breadcrumb: ['About', 'Board of Directors'],
    accent: 'bocra-blue',
    content: `
      <h2>Board of Directors</h2>
      <p>The BOCRA Board provides strategic oversight and governance for the authority.</p>
      <ul>
        <li><strong>Dr. Bokamoso Basutli, PhD</strong> \u2014 Board Chairperson</li>
        <li><strong>Mr. Moabi Pusumane</strong> \u2014 Vice Chairperson</li>
        <li><strong>Ms. Montle Phuthego</strong> \u2014 Board Member</li>
        <li><strong>Ms. Alta Dimpho Seleka</strong> \u2014 Board Member</li>
        <li><strong>Ms. Lebogang George</strong> \u2014 Board Member</li>
        <li><strong>Mr. Ronald Kgafela</strong> \u2014 Board Member</li>
        <li><strong>Dr. Kennedy Ramojela</strong> \u2014 Board Member</li>
        <li><strong>Mr. Martin Mokgware</strong> \u2014 Chief Executive (ex-officio)</li>
      </ul>
    `,
    title_tn: 'Boto ya Batsamaisi',
    breadcrumb_tn: ['Ka ga Rona', 'Boto ya Batsamaisi'],
    content_tn: `
      <h2>Boto ya Batsamaisi</h2>
      <p>Boto ya BOCRA e tlamela ka tlhokomelo ya togamaano le puso ya setheo.</p>
      <ul>
        <li><strong>Ngaka Bokamoso Basutli, PhD</strong> \u2014 Modulasetulo wa Boto</li>
        <li><strong>Rre Moabi Pusumane</strong> \u2014 Motlatsa Modulasetulo</li>
        <li><strong>Mme Montle Phuthego</strong> \u2014 Leloko la Boto</li>
        <li><strong>Mme Alta Dimpho Seleka</strong> \u2014 Leloko la Boto</li>
        <li><strong>Mme Lebogang George</strong> \u2014 Leloko la Boto</li>
        <li><strong>Rre Ronald Kgafela</strong> \u2014 Leloko la Boto</li>
        <li><strong>Ngaka Kennedy Ramojela</strong> \u2014 Leloko la Boto</li>
        <li><strong>Rre Martin Mokgware</strong> \u2014 Motlhankedi yo Mogolo (ex-officio)</li>
      </ul>
    `,
  },
  'executive-management': {
    title: 'Executive Management',
    breadcrumb: ['About', 'Executive Management'],
    accent: 'bocra-blue',
    content: `
      <h2>Executive Management Team</h2>
      <ul>
        <li><strong>Martin Mokgware</strong> \u2014 Chief Executive</li>
        <li><strong>Murphy Setshwane</strong> \u2014 Director, Business Development</li>
        <li><strong>Peter Tladinyane</strong> \u2014 Director, Corporate Services</li>
        <li><strong>Bonny Mine</strong> \u2014 Director, Finance</li>
        <li><strong>Bathopi Luke</strong> \u2014 Director, Technical Services</li>
        <li><strong>Tebogo Mmoshe</strong> \u2014 Director, Licensing</li>
        <li><strong>Maitseo Ratladi</strong> \u2014 Director, Broadband & Universal Service</li>
        <li><strong>Joyce Isa-Molwane</strong> \u2014 Legal, Compliance & Board Secretary</li>
      </ul>
    `,
    title_tn: 'Botsamaisi jwa Phethagatso',
    breadcrumb_tn: ['Ka ga Rona', 'Botsamaisi jwa Phethagatso'],
    content_tn: `
      <h2>Setlhopha sa Botsamaisi jwa Phethagatso</h2>
      <ul>
        <li><strong>Martin Mokgware</strong> \u2014 Motlhankedi yo Mogolo</li>
        <li><strong>Murphy Setshwane</strong> \u2014 Molaodi, Tlhabololo ya Kgwebo</li>
        <li><strong>Peter Tladinyane</strong> \u2014 Molaodi, Ditirelo tsa Koporeiti</li>
        <li><strong>Bonny Mine</strong> \u2014 Molaodi, Ditšhelete</li>
        <li><strong>Bathopi Luke</strong> \u2014 Molaodi, Ditirelo tsa Thekenoloji</li>
        <li><strong>Tebogo Mmoshe</strong> \u2014 Molaodi, Dilaesense</li>
        <li><strong>Maitseo Ratladi</strong> \u2014 Molaodi, Broadband le Tirelo e e Akaretsang</li>
        <li><strong>Joyce Isa-Molwane</strong> \u2014 Molao, Obamelo le Mokwaledi wa Boto</li>
      </ul>
    `,
  },
  // Services pages
  'licence-verification': {
    title: 'Licence Verification',
    breadcrumb: ['Services', 'Licence Verification'],
    accent: 'bocra-cyan',
    content: `
      <h2>Verify a Licence</h2>
      <p>Use BOCRA\u2019s licence verification tool to check whether an operator holds a valid licence. This service is available to consumers, businesses, and other stakeholders who wish to confirm that a service provider is properly licensed.</p>
      <p><em>The licence verification search tool will be integrated here. For now, please contact BOCRA directly for verification queries.</em></p>
    `,
  },
  'type-approval': {
    title: 'Type Approval',
    breadcrumb: ['Services', 'Type Approval'],
    accent: 'bocra-cyan',
    content: `
      <h2>Equipment Type Approval</h2>
      <p>Under Section 84 of the CRA Act, BOCRA manages the type approval process for telecommunications equipment imported into or manufactured in Botswana. Type approval ensures equipment meets international standards for consumer safety, frequency compatibility, and network integrity.</p>
      <h3>Why Type Approval?</h3>
      <ul>
        <li>International standards compliance</li>
        <li>Consumer protection</li>
        <li>Frequency compatibility with Botswana\u2019s spectrum allocations</li>
      </ul>
      <p>Search the approved equipment database or submit a new type approval application through the BOCRA portal.</p>
    `,
  },
  'register-bw': {
    title: 'Register .BW Domain',
    breadcrumb: ['Services', 'Register .BW'],
    accent: 'bocra-green',
    content: `
      <h2>.BW Domain Registration</h2>
      <p>BOCRA manages the .bw country-code top-level domain (ccTLD) under Section 38(1) of the CRA Act. The .bw domain provides a distinctive online identity for Botswana organisations and individuals.</p>
      <h3>How to Register</h3>
      <p>Domain registrations are processed through BOCRA-accredited ISP registrars who perform the retail registration function. The Technical Advisory Committee (TAC) with 9 stakeholders oversees domain operations.</p>
    `,
  },
  'qos-monitoring': {
    title: 'Quality of Service Monitoring',
    breadcrumb: ['Services', 'QoS Monitoring'],
    accent: 'bocra-yellow',
    content: `
      <h2>Network Quality Monitoring</h2>
      <p>BOCRA\u2019s Quality of Service (QoS) monitoring system tracks the performance of Botswana\u2019s mobile network operators in real time. The NMS (Network Monitoring System) measures service quality across the country.</p>
      <h3>Operators Monitored</h3>
      <ul>
        <li><strong>Mascom</strong> \u2014 3G Voice QoS: 99.29%</li>
        <li><strong>BTC</strong> \u2014 3G Voice QoS: 100%</li>
        <li><strong>Orange</strong> \u2014 3G Voice QoS: 99.62%</li>
      </ul>
      <p>The interactive QoS dashboard with coverage maps and KPI data will be integrated from the DQoS platform.</p>
    `,
  },
  'spectrum': {
    title: 'Spectrum Management',
    breadcrumb: ['Services', 'Spectrum Management'],
    accent: 'bocra-blue',
    content: `
      <h2>Spectrum Management</h2>
      <p>BOCRA manages Botswana\u2019s radio frequency spectrum under the national frequency plan, covering 9 kHz to 105 GHz. The Automated Spectrum Management System (ASMS-WebCP) provides tools for spectrum allocation and monitoring.</p>
      <h3>Key Functions</h3>
      <ul>
        <li>National frequency plan management</li>
        <li>Frequency occupancy monitoring</li>
        <li>International coordination (ITU Radio Regulations)</li>
        <li>Spectrum tariffs and standards</li>
        <li>Harmful interference avoidance</li>
      </ul>
    `,
  },
  'projects': {
    title: 'Projects',
    breadcrumb: ['Projects'],
    accent: 'bocra-blue',
    content: `
      <h2>BOCRA Projects</h2>
      <h3>Country Code Top-Level Domain (.bw)</h3>
      <p>BOCRA administers the .bw country-code top-level domain under Section 38(1) of the CRA Act. The Technical Advisory Committee (TAC), comprising 9 stakeholders, oversees the .bw domain operations. ISPs perform the retail registration function for .bw domains.</p>
      <h3>Infrastructure Sharing</h3>
      <p>BOCRA has developed passive infrastructure sharing guidelines to promote efficient use of telecommunications infrastructure. Environmental guidelines ensure that infrastructure deployment respects Botswana\u2019s natural environment while expanding coverage to underserved areas.</p>
      <h3>Digital Switchover</h3>
      <p>In line with ITU Regional Radiocommunication Conference 2006 (RRC-06), Botswana is migrating from analogue to digital broadcasting. This transition frees up valuable spectrum for mobile broadband and enables higher quality television services for all Batswana.</p>
    `,
  },
  'bw-cctld': {
    title: '.BW Country Code TLD',
    breadcrumb: ['Projects', '.BW ccTLD'],
    accent: 'bocra-cyan',
    content: `
      <h2>.BW Country Code Top-Level Domain</h2>
      <p>Under Section 38(1) of the CRA Act, BOCRA serves as the trustee, administrative contact, and technical contact for the .bw country-code top-level domain.</p>
      <h3>BOCRA\u2019s Role</h3>
      <ul>
        <li>Administer the .bw ccTLD</li>
        <li>Maintain stability and security of the domain name system</li>
        <li>Ensure cost-effective administration</li>
        <li>Maintain a secure and accurate database of registrations</li>
      </ul>
      <p>Domain registrations are processed through BOCRA-accredited ISP registrars. The Technical Advisory Committee (TAC) with 9 stakeholders oversees all operations.</p>
    `,
  },
  'bw-cirt': {
    title: 'BW CIRT',
    breadcrumb: ['Projects', 'BW CIRT'],
    accent: 'bocra-green',
    content: `
      <h2>Botswana Computer Incident Response Team (BW CIRT)</h2>
      <p>The National Cybersecurity Strategy, developed by the Ministry of Transport and Communications, established the Botswana Computer Incident Response Team (BW CIRT) under BOCRA.</p>
      <h3>Functions</h3>
      <ul>
        <li>Coordinate national cybersecurity incident response</li>
        <li>Provide early warning systems for cyber threats</li>
        <li>Promote cybersecurity awareness and best practices</li>
        <li>Collaborate with international CIRTs and security organisations</li>
      </ul>
    `,
  },
  'electronic-evidence': {
    title: 'Electronic Evidence',
    breadcrumb: ['Projects', 'Electronic Evidence'],
    accent: 'bocra-blue',
    content: `
      <h2>Electronic Records (Evidence) Act</h2>
      <p>The Electronic Records (Evidence) Act No. 13 of 2014 governs the admissibility and use of electronic records as evidence in Botswana. BOCRA plays a key role in the certification of electronic evidence agents.</p>
      <h3>Available Resources</h3>
      <ul>
        <li>Certifying Agents Application Form</li>
        <li>Guide to Certification</li>
        <li>List of Approved Certifying Agents</li>
        <li>Electronic Records Regulations</li>
      </ul>
    `,
  },
  'electronic-communications-transactions': {
    title: 'Electronic Communications & Transactions',
    breadcrumb: ['Projects', 'ECT'],
    accent: 'bocra-cyan',
    content: `
      <h2>Electronic Communications and Transactions</h2>
      <p>Under the Electronic Communications and Transactions Act 2014, BOCRA is responsible for accrediting Secure Electronic Signature Service Providers.</p>
      <h3>Approved Certification Authority</h3>
      <p><strong>LAWtrust</strong> \u2014 85 Regency Drive, Route 21 Corporate Office Park, Centurion, South Africa \u2014 is the approved Certification Authority for Botswana.</p>
      <h3>Resources</h3>
      <ul>
        <li>Accreditation Procedure</li>
        <li>Advanced Certification Standards (ACS)</li>
        <li>Accreditation Checklist</li>
        <li>List of Approved Auditors</li>
        <li>ECT Act Full Text</li>
      </ul>
    `,
  },
  'complaints': {
    title: 'Complaints',
    breadcrumb: ['Complaints'],
    accent: 'bocra-magenta',
    content: `
      <h2>Complaints Overview</h2>
      <p>BOCRA handles consumer complaints related to billing, equipment failure, interconnection, service delays, mobile problems, and internet contracts. The standard resolution timeline is 2 business days.</p>
      <h3>Types of Complaints We Handle</h3>
      <ul>
        <li>Billing and charging disputes</li>
        <li>Network coverage and signal problems</li>
        <li>Internet service quality issues</li>
        <li>Equipment failure</li>
        <li>Service provider delays</li>
        <li>Interconnection issues</li>
        <li>Broadcasting content complaints</li>
        <li>Postal service complaints</li>
      </ul>
      <h3>How to File</h3>
      <p>You can file a complaint online using our <a href="/services/file-complaint">complaint form</a>, or contact us directly by phone (+267 395 7755) or email (info@bocra.org.bw).</p>
    `,
  },
  'consumer-education': {
    title: 'Consumer Education',
    breadcrumb: ['Complaints', 'Consumer Education'],
    accent: 'bocra-magenta',
    content: `
      <h2>Know Your Consumer Rights</h2>
      <p>As a consumer of communications services in Botswana, you have the following fundamental rights:</p>
      <h3>Right To Be Informed</h3>
      <p>You have the right to clear, accurate information about services, tariffs, terms and conditions from your service provider.</p>
      <h3>Right To Choice</h3>
      <p>You have the right to choose between different service providers and service packages without unfair restrictions.</p>
      <h3>Right To Be Heard</h3>
      <p>You have the right to voice complaints and have them addressed in a timely and fair manner.</p>
      <h3>Right To Safety</h3>
      <p>You have the right to safe equipment and services that meet approved technical standards and do not pose health or safety risks.</p>
    `,
  },
  'registering-complaints': {
    title: 'How to Register a Complaint',
    breadcrumb: ['Complaints', 'Registering Complaints'],
    accent: 'bocra-magenta',
    content: `
      <h2>5-Step Complaint Handling Process</h2>
      <p><strong>Step 1:</strong> Address your complaint directly to your service provider first.</p>
      <p><strong>Step 2:</strong> Ask for a resolution timeline and reference number from the provider.</p>
      <p><strong>Step 3:</strong> Keep copies of all correspondence and evidence.</p>
      <p><strong>Step 4:</strong> If not resolved, escalate within the service provider\u2019s complaints hierarchy.</p>
      <p><strong>Step 5:</strong> If still unresolved, escalate to BOCRA by <a href="/services/file-complaint">filing a complaint online</a> or contacting us at info@bocra.org.bw or +267 395 7755.</p>
    `,
  },
  'radio-frequency-plan': {
    title: 'Radio Frequency Plan',
    breadcrumb: ['Technical', 'Radio Frequency Plan'],
    accent: 'bocra-blue',
    content: `
      <h2>National Radio Frequency Plan</h2>
      <p>Based on Section 47 of the CRA Act and ITU Radio Regulations, BOCRA maintains the National Radio Frequency Plan covering the spectrum from 9 kHz to 105 GHz.</p>
      <h3>Band Plan Structure</h3>
      <p>The frequency plan follows a 7-column table structure covering frequency bands, ITU Region 1 allocations, national allocations, current utilizations, mid frequencies, duplex bands, and remarks.</p>
      <p>The complete Radio Frequency Plan document is available for download from the <a href="/documents/drafts">Documents</a> section.</p>
    `,
  },
  'radio-spectrum-planning': {
    title: 'Radio Spectrum Planning',
    breadcrumb: ['Technical', 'Spectrum Planning'],
    accent: 'bocra-blue',
    content: `
      <h2>Radio Spectrum Planning</h2>
      <p>BOCRA\u2019s spectrum management mandate includes:</p>
      <ul>
        <li>Developing and maintaining the national frequency plan</li>
        <li>Planning for existing and new radio services</li>
        <li>Frequency occupancy monitoring</li>
        <li>International regulations compliance</li>
        <li>Setting spectrum tariffs and technical standards</li>
        <li>Avoiding harmful interference between services</li>
        <li>Allocating spectrum between government and non-government users</li>
      </ul>
    `,
  },
  'numbering-plan': {
    title: 'Numbering Plan',
    breadcrumb: ['Technical', 'Numbering Plan'],
    accent: 'bocra-cyan',
    content: `
      <h2>National Numbering Plan</h2>
      <p>BOCRA manages Botswana\u2019s E.164 telephone numbering plan. The plan allocates numbering resources across telecommunications operators and services.</p>
      <h3>Current Plan Details</h3>
      <ul>
        <li>Population served: approximately 2.1 million</li>
        <li>Fixed teledensity: approximately 8%</li>
        <li>DDI lines in Gaborone: 7 digits (36/355 ranges)</li>
        <li>Mobile codes: 71, 72 prefixes</li>
        <li>Short codes: 08 prefix for special services</li>
      </ul>
      <p>The full Numbering Plan and List of Numbering Resource Allocations is available in the <a href="/documents/drafts">Documents</a> section.</p>
    `,
  },
  'history': {
    title: 'History of Communication Regulation',
    breadcrumb: ['About', 'History'],
    accent: 'bocra-blue',
    content: `
      <h2>History of Communication Regulation in Botswana</h2>
      <h3>2003 \u2014 Early Regulation</h3>
      <p>Botswana Telecommunications Corporation (BTC) was granted a 15-year operating licence. BOCRA (then BTA) published Interconnection Guidelines, leading to the first interconnection ruling between BTC, Mascom Wireless, and Orange Botswana.</p>
      <h3>2012 \u2014 CRA Act</h3>
      <p>The Communications Regulatory Authority Act 2012 was enacted by Parliament, creating the legal framework for a converged regulator covering telecommunications, broadcasting, postal, and internet services.</p>
      <h3>2013 \u2014 BOCRA Established</h3>
      <p>On 1 April 2013, the Botswana Communications Regulatory Authority (BOCRA) was officially established under the CRA Act, replacing the former Botswana Telecommunications Authority (BTA).</p>
      <h3>2014 \u2014 Digital Legislation</h3>
      <p>The Electronic Records (Evidence) Act and the Electronic Communications and Transactions Act were passed, expanding BOCRA\u2019s regulatory scope into the digital economy.</p>
      <h3>2025 \u2014 Modern Framework</h3>
      <p>The Digital Services Act 2025 and Cybersecurity Act 2025 were enacted, establishing a comprehensive framework for regulating digital services and ensuring national cybersecurity.</p>
    `,
    title_tn: 'Hisitori ya Taolo ya Dikgolagano',
    breadcrumb_tn: ['Ka ga Rona', 'Hisitori'],
    content_tn: `
      <h2>Hisitori ya Taolo ya Dikgolagano mo Botswana</h2>
      <h3>2003 \u2014 Taolo ya Pele</h3>
      <p>Botswana Telecommunications Corporation (BTC) e neilwe laesense ya go dira ya dingwaga di le 15. BOCRA (ka nako eo e le BTA) e phasaladitse Ditaelo tsa Kopanyo, tse di isitseng kwa phetho ya ntlha ya kopanyo magareng ga BTC, Mascom Wireless, le Orange Botswana.</p>
      <h3>2012 \u2014 Molao wa CRA</h3>
      <p>Molao wa Communications Regulatory Authority Act 2012 o dirilwe ke Palamente, o dira letlhomeso la molao la molaodi o o kopanetsweng o o akaretsang megala, phasalatso, poso, le ditirelo tsa inthanete.</p>
      <h3>2013 \u2014 BOCRA e Tlhomiwa</h3>
      <p>Ka la 1 Moranang 2013, Botswana Communications Regulatory Authority (BOCRA) e tlhomilwe semmuso ka fa tlase ga Molao wa CRA, e tsaya legato la Botswana Telecommunications Authority (BTA) ya pele.</p>
      <h3>2014 \u2014 Melao ya Dijithale</h3>
      <p>Molao wa Electronic Records (Evidence) le Molao wa Electronic Communications and Transactions di fetisitswe, go atolosa maatla a taolo a BOCRA go ya mo ikonoming ya dijithale.</p>
      <h3>2025 \u2014 Letlhomeso la Segompieno</h3>
      <p>Molao wa Digital Services 2025 le Molao wa Cybersecurity 2025 di dirilwe, go tlhoma letlhomeso le le feletseng la go laola ditirelo tsa dijithale le go netefatsa tshireletso ya saebara ya bosetšhaba.</p>
    `,
  },
  'organogram': {
    title: 'Organogram',
    breadcrumb: ['About', 'Organogram'],
    accent: 'bocra-blue',
    content: `
      <h2>Organisational Structure</h2>
      <p>BOCRA is structured into the following departments under the leadership of the Chief Executive:</p>
      <ul>
        <li><strong>Compliance &amp; Monitoring</strong> \u2014 Ensuring licensee compliance with regulations</li>
        <li><strong>Corporate Support</strong> \u2014 Human resources, administration, and facilities</li>
        <li><strong>Business Development</strong> \u2014 Strategy, research, and stakeholder engagement</li>
        <li><strong>Technical Services</strong> \u2014 Spectrum management, type approval, and QoS monitoring</li>
        <li><strong>Corporate Communications &amp; Relations</strong> \u2014 Public affairs and media</li>
        <li><strong>Finance</strong> \u2014 Financial management and procurement</li>
        <li><strong>Licensing</strong> \u2014 Licence applications and management</li>
        <li><strong>Broadband &amp; Universal Service</strong> \u2014 UASF and broadband expansion</li>
        <li><strong>Legal, Compliance &amp; Board Secretary</strong> \u2014 Legal affairs and governance</li>
      </ul>
      <h3>Organisational Objectives</h3>
      <p>BOCRA\u2019s organisational objectives include promoting competition, ensuring universal access, protecting consumers, optimising resources, developing talent, and engaging stakeholders across the communications sector.</p>
    `,
    title_tn: 'Thanamiso ya Tiro',
    breadcrumb_tn: ['Ka ga Rona', 'Thanamiso ya Tiro'],
    content_tn: `
      <h2>Popego ya Setheo</h2>
      <p>BOCRA e bopilwe ka mafapha a a latelang ka fa tlase ga botsamaisi jwa Motlhankedi yo Mogolo:</p>
      <ul>
        <li><strong>Obamelo le Tlhokomelo</strong> \u2014 Go netefatsa gore ba ba nang le dilaesense ba obamela melawana</li>
        <li><strong>Tshegetso ya Koporeiti</strong> \u2014 Merero ya batho, tsamaiso, le mafaratlhatlha</li>
        <li><strong>Tlhabololo ya Kgwebo</strong> \u2014 Togamaano, patlisiso, le go ikgolaganya le baamegi</li>
        <li><strong>Ditirelo tsa Thekenoloji</strong> \u2014 Taolo ya sepeketeramo, tumelano ya mofuta, le tlhokomelo ya boleng jwa tirelo</li>
        <li><strong>Dikgolagano le Dikamano tsa Koporeiti</strong> \u2014 Merero ya setšhaba le bobegakgang</li>
        <li><strong>Ditšhelete</strong> \u2014 Taolo ya ditšhelete le theko</li>
        <li><strong>Dilaesense</strong> \u2014 Dikopo tsa dilaesense le taolo</li>
        <li><strong>Broadband le Tirelo e e Akaretsang</strong> \u2014 UASF le go atolosa broadband</li>
        <li><strong>Molao, Obamelo le Mokwaledi wa Boto</strong> \u2014 Merero ya molao le puso</li>
      </ul>
      <h3>Maikemisetso a Setheo</h3>
      <p>Maikemisetso a setheo sa BOCRA a akaretsa go rotloetsa kgaisano, go netefatsa phitlhelelo e e akaretsang, go sireletsa badirisi, go tokafatsa tiriso ya metswedi, go godisa bokgoni, le go ikgolaganya le baamegi mo lefapheng la dikgolagano.</p>
    `,
  },
  'careers': {
    title: 'Careers',
    breadcrumb: ['About', 'Careers'],
    accent: 'bocra-cyan',
    content: `
      <h2>Careers at BOCRA</h2>
      <p>BOCRA is committed to attracting and retaining talented professionals who share our passion for communications regulation and public service.</p>
      <h3>Current Openings</h3>
      <p>Job listings are posted here as positions become available. Check back regularly for new opportunities.</p>
      <p>To apply for any position, please send your CV and cover letter to <a href="mailto:info@bocra.org.bw" style="color:#00A6CE;text-decoration:underline;"><strong>info@bocra.org.bw</strong></a> with the job title in the subject line.</p>
      <h3>Why Work at BOCRA?</h3>
      <ul>
        <li>Contribute to Botswana\u2019s digital transformation</li>
        <li>Work at the forefront of communications regulation</li>
        <li>Professional development opportunities</li>
        <li>Competitive compensation and benefits</li>
        <li>Collaborative and inclusive work environment</li>
      </ul>
    `,
    title_tn: 'Menyetla ya Ditiro',
    breadcrumb_tn: ['Ka ga Rona', 'Menyetla ya Ditiro'],
    content_tn: `
      <h2>Ditiro kwa BOCRA</h2>
      <p>BOCRA e ikemiseditse go ngoka le go boloka baporofešenale ba ba nang le bokgoni ba ba abelanang keletso ya rona ya taolo ya dikgolagano le tirelo ya setšhaba.</p>
      <h3>Maemo a a Leng Teng</h3>
      <p>Lenaane la ditiro le beilwe fa fa maemo a a leng teng. Boelang gape ka metlha go bona menyetla e mesha.</p>
      <p>Go ikopela maemo afe kgotsa afe, romela CV ya gago le lekwalo la kopo go <strong>info@bocra.org.bw</strong> ka leina la tiro mo motlhalong.</p>
      <h3>Ke Goreng o Dira kwa BOCRA?</h3>
      <ul>
        <li>Tshwaela mo phetogong ya dijithale ya Botswana</li>
        <li>Dira kwa pele ga taolo ya dikgolagano</li>
        <li>Menyetla ya tlhabololo ya boprofešenale</li>
        <li>Tuelo e e kgaisanyang le mesola</li>
        <li>Tikologo ya tiro e e dirisanyang le e e akaretsang</li>
      </ul>
    `,
  },
  'telecom-statistics': {
    title: 'Telecom Statistics',
    breadcrumb: ['Telecom Statistics'],
    accent: 'bocra-cyan',
    content: `
      <h2>Botswana Telecommunications Statistics</h2>
      <p>Key indicators for the Botswana telecommunications sector (latest available data):</p>
      <h3>Mobile Telephony</h3>
      <p>Total mobile subscriptions exceed 4.2 million across three operators (Mascom, BTC, Orange). Prepaid subscriptions account for the vast majority of the market.</p>
      <h3>Mobile Money</h3>
      <p>Over 2.1 million mobile money subscriptions, reflecting strong adoption of financial services via mobile platforms.</p>
      <h3>Mobile Broadband</h3>
      <p>Approximately 850,000 mobile broadband subscribers, driven by growing smartphone adoption and data price reductions directed by BOCRA.</p>
      <h3>Fixed Broadband</h3>
      <p>Fixed broadband penetration continues to grow, supported by BoFiNet\u2019s national backbone infrastructure and the EASSy submarine cable connection.</p>
      <h3>Fixed Telephony</h3>
      <p>Fixed teledensity stands at approximately 8%, with DDI lines concentrated in Gaborone and major urban centres.</p>
      <p><em>Detailed statistical charts and downloadable data will be available through the interactive statistics dashboard.</em></p>
    `,
  },
  'tariffs': {
    title: 'Tariffs',
    breadcrumb: ['Tariffs'],
    accent: 'bocra-blue',
    content: `
      <h2>Telecommunications Tariffs</h2>
      <p>BOCRA regulates tariffs to ensure that telecommunications services remain affordable and competitive for all Batswana.</p>
      <h3>Recent Tariff Actions</h3>
      <ul>
        <li>SADC Roaming Tariff Reductions (2026)</li>
        <li>BTC Mobile Data Price Reductions (2026)</li>
        <li>Orange Botswana Data Price Reductions (2025)</li>
        <li>MNO Tariff Reduction Directive (2025)</li>
      </ul>
      <h3>Tariff Regulation</h3>
      <p>BOCRA monitors and regulates voice, data, and SMS tariffs across all licensed operators. Wholesale bandwidth pricing trends are tracked to ensure competitive downstream pricing for consumers.</p>
    `,
  },
  'faqs': {
    title: 'Frequently Asked Questions',
    breadcrumb: ['FAQs'],
    accent: 'bocra-cyan',
    content: `
      <h2>Frequently Asked Questions</h2>
      <h3>What is BOCRA?</h3>
      <p>BOCRA is the Botswana Communications Regulatory Authority, established on 1 April 2013 under the Communications Regulatory Authority Act 2012 to regulate telecommunications, broadcasting, internet, and postal services.</p>
      <h3>How do I file a complaint?</h3>
      <p>You can file a complaint using our <a href="/services/file-complaint">online complaint form</a>, by calling +267 395 7755, or by emailing info@bocra.org.bw. We recommend first raising the issue with your service provider directly.</p>
      <h3>How do I register a .bw domain?</h3>
      <p>Domain registrations are processed through BOCRA-accredited ISP registrars. Visit the <a href="/services/register-bw">.BW registration page</a> for more information.</p>
      <h3>How do I apply for a licence?</h3>
      <p>Visit our <a href="/mandate/licensing">Licensing page</a> for information on available licence types and application requirements.</p>
      <h3>How do I check if equipment is type-approved?</h3>
      <p>Visit our <a href="/services/type-approval">Type Approval page</a> to search the approved equipment database or submit a new application.</p>
      <h3>Where is BOCRA located?</h3>
      <p>BOCRA is located at Plot 50671 Independence Avenue, Gaborone, Botswana. See our <a href="/contact">Contact page</a> for full details.</p>
    `,
    title_tn: 'Dipotso tse di Botswang Thata',
    breadcrumb_tn: ['Dipotso tse di Botswang Thata'],
    content_tn: `
      <h2>Dipotso tse di Botswang Thata</h2>
      <h3>BOCRA ke eng?</h3>
      <p>BOCRA ke Botswana Communications Regulatory Authority, e e tlhomilweng ka la 1 Moranang 2013 ka fa tlase ga Molao wa Communications Regulatory Authority Act 2012 go laola megala, phasalatso, inthanete, le ditirelo tsa poso.</p>
      <h3>Ke faela ngongorego jang?</h3>
      <p>O ka faela ngongorego ka <a href="/services/file-complaint">foromo ya rona ya mo inthaneteng</a>, ka go leletsa +267 395 7755, kgotsa ka go romela imeile go info@bocra.org.bw.</p>
      <h3>Ke kwadisa lefelo la .bw jang?</h3>
      <p>Dikwadiso tsa mafelo di dirwa ka ISP tse di dumetsweng ke BOCRA. Etela <a href="/services/register-bw">tsebe ya kwadiso ya .BW</a> go ithuta go feta.</p>
      <h3>Ke ikopela laesense jang?</h3>
      <p>Etela <a href="/mandate/licensing">tsebe ya Dilaesense</a> ya rona go bona tshedimosetso ka mefuta ya dilaesense le ditlhokego tsa kopo.</p>
      <h3>BOCRA e kae?</h3>
      <p>BOCRA e kwa Plot 50671 Independence Avenue, Gaborone, Botswana. Bona <a href="/contact">tsebe ya Ikgolaganye le Rona</a> go bona tshedimosetso e e feletseng.</p>
    `,
  },
  'privacy-notice': {
    title: 'Privacy Notice',
    breadcrumb: ['Privacy Notice'],
    accent: 'bocra-blue',
    content: `
      <h2>Privacy Notice</h2>
      <p><em>Effective: 1 January 2026 &nbsp;|&nbsp; Last updated: 18 March 2026</em></p>
      <p>This Privacy Notice explains how the Botswana Communications Regulatory Authority (&ldquo;BOCRA&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, stores, and protects your personal data when you use our website and services. It is issued in compliance with the <strong>Data Protection Act, 2018</strong> (Cap. 53:04).</p>

      <h3>1. Data Controller</h3>
      <p>The Botswana Communications Regulatory Authority<br/>Plot 50671 Independence Avenue<br/>Private Bag 00495, Gaborone, Botswana<br/>Tel: +267 395 7755 &nbsp;|&nbsp; Email: <a href="mailto:privacy@bocra.org.bw">privacy@bocra.org.bw</a></p>

      <h3>2. Personal Data We Collect</h3>
      <p>We collect only the minimum personal data necessary for each purpose:</p>
      <table>
        <thead><tr><th>Category</th><th>Data Collected</th><th>Source</th></tr></thead>
        <tbody>
          <tr><td>Contact enquiries</td><td>Name, email, phone, message</td><td>Contact form</td></tr>
          <tr><td>Consumer complaints</td><td>Name, company, email, phone, complaint details, service provider</td><td>Complaint form</td></tr>
          <tr><td>Licence applications</td><td>Name, company, email, phone, Omang, address, qualifications</td><td>Application form</td></tr>
          <tr><td>Cybersecurity incidents</td><td>Incident details; optionally: name, email, phone</td><td>Incident report form</td></tr>
          <tr><td>Portal accounts</td><td>Name, email, password (hashed), role</td><td>Registration</td></tr>
          <tr><td>Browsing data</td><td>Cookie preferences, language preference</td><td>Browser (localStorage)</td></tr>
        </tbody>
      </table>

      <h3>3. Legal Basis for Processing</h3>
      <p>We process personal data under the following legal bases as defined in the Data Protection Act, 2018:</p>
      <ul>
        <li><strong>Consent</strong> &mdash; You provide explicit consent via the checkbox on each form before submission (Section 18).</li>
        <li><strong>Legitimate interest</strong> &mdash; Processing necessary for BOCRA&rsquo;s regulatory mandate under the Communications Regulatory Authority Act, 2012.</li>
        <li><strong>Legal obligation</strong> &mdash; Processing required to comply with the Cybersecurity Act, 2025 or other applicable legislation.</li>
      </ul>

      <h3>4. How We Use Your Data</h3>
      <ul>
        <li>Investigating and resolving consumer complaints</li>
        <li>Processing licence and type approval applications</li>
        <li>Responding to enquiries and correspondence</li>
        <li>Investigating cybersecurity incidents (CSIRT function)</li>
        <li>Generating anonymised statistics for regulatory reporting</li>
        <li>Improving website functionality and user experience</li>
      </ul>
      <p>We <strong>do not</strong> use your data for marketing, profiling, or automated decision-making.</p>

      <h3>5. Data Sharing</h3>
      <p>Your data may be shared with:</p>
      <ul>
        <li><strong>Licensed operators</strong> &mdash; complaint details shared with the relevant service provider for resolution</li>
        <li><strong>Law enforcement</strong> &mdash; when required by law or court order</li>
        <li><strong>Supabase Inc.</strong> &mdash; our cloud database provider, which processes data under strict contractual safeguards</li>
      </ul>
      <p>We <strong>never sell</strong> personal data to third parties.</p>

      <h3>6. Data Retention Policy</h3>
      <table>
        <thead><tr><th>Data Type</th><th>Retention Period</th><th>After Expiry</th></tr></thead>
        <tbody>
          <tr><td>Consumer complaints</td><td>3 years from resolution</td><td>Anonymised or deleted</td></tr>
          <tr><td>Licence applications</td><td>Duration of licence + 2 years</td><td>Archived then deleted</td></tr>
          <tr><td>Contact enquiries</td><td>1 year</td><td>Deleted</td></tr>
          <tr><td>Cybersecurity incidents</td><td>5 years (Cybersecurity Act requirement)</td><td>Anonymised</td></tr>
          <tr><td>Portal accounts</td><td>Until account deletion requested</td><td>Deleted within 30 days</td></tr>
          <tr><td>Audit logs</td><td>2 years</td><td>Purged automatically</td></tr>
          <tr><td>Cookie preferences</td><td>12 months</td><td>Re-prompted</td></tr>
        </tbody>
      </table>

      <h3>7. Your Rights</h3>
      <p>Under the Data Protection Act, 2018, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> &mdash; Request a copy of the personal data we hold about you</li>
        <li><strong>Rectification</strong> &mdash; Request correction of inaccurate or incomplete data</li>
        <li><strong>Erasure</strong> &mdash; Request deletion of your data (subject to legal retention requirements)</li>
        <li><strong>Restrict processing</strong> &mdash; Request that we limit how we use your data</li>
        <li><strong>Data portability</strong> &mdash; Request your data in a structured, machine-readable format</li>
        <li><strong>Withdraw consent</strong> &mdash; Withdraw your consent at any time without affecting prior processing</li>
      </ul>
      <p>To exercise any of these rights, submit a request through the <a href="/portal/data-request">My BOCRA Portal</a> or email <a href="mailto:privacy@bocra.org.bw">privacy@bocra.org.bw</a>. We will respond within <strong>30 days</strong>.</p>

      <h3>8. Security Measures</h3>
      <p>We implement appropriate technical and organisational measures to protect your personal data:</p>
      <ul>
        <li>TLS encryption for all data in transit</li>
        <li>Row Level Security (RLS) database policies &mdash; users can only access their own data</li>
        <li>Role-based access control for administrative staff</li>
        <li>Immutable audit logging of all data access and changes</li>
        <li>Content Security Policy (CSP) headers to prevent XSS attacks</li>
        <li>Input sanitisation on all forms</li>
        <li>Regular security assessments aligned with OWASP Top 10</li>
      </ul>

      <h3>9. Cookies</h3>
      <p>This website uses only essential cookies (language preference and cookie consent choice stored in your browser&rsquo;s localStorage). We do not use tracking cookies, analytics cookies, or third-party advertising cookies. See our cookie banner for controls.</p>

      <h3>10. Changes to This Notice</h3>
      <p>We may update this Privacy Notice from time to time. The &ldquo;Last updated&rdquo; date at the top will reflect the most recent revision. Material changes will be communicated via a banner on the website.</p>

      <h3>11. Complaints</h3>
      <p>If you believe your data protection rights have been violated, you may lodge a complaint with BOCRA at <a href="mailto:privacy@bocra.org.bw">privacy@bocra.org.bw</a> or with the relevant supervisory authority under the Data Protection Act, 2018.</p>

      <h3>12. Contact</h3>
      <p>For all privacy-related enquiries:<br/>
      Email: <a href="mailto:privacy@bocra.org.bw">privacy@bocra.org.bw</a><br/>
      Tel: +267 395 7755<br/>
      Post: Data Protection Officer, BOCRA, Private Bag 00495, Gaborone, Botswana</p>
    `,
  },
  'tenders': {
    title: 'Tenders',
    breadcrumb: ['Tenders'],
    accent: 'bocra-blue',
    content: `
      <h2>Active and Past Tenders</h2>
      <p>BOCRA publishes tenders for goods and services required to fulfil its regulatory mandate. All tenders are conducted in accordance with the Public Procurement Act.</p>
      <h3>Current Opportunities</h3>
      <p>Expression of Interest: Supplier Database 2026/27 \u2014 BOCRA invites qualified suppliers to register for inclusion in the Authority\u2019s supplier database for the upcoming financial year.</p>
      <h3>How to Apply</h3>
      <p>Tender documents are available from BOCRA offices at Plot 50671 Independence Avenue, Gaborone. Completed submissions must be deposited in the tender box at BOCRA\u2019s reception by the stated deadline.</p>
      <p>For procurement enquiries, contact the Finance Department at <a href="tel:+2673957755" style="color:#00A6CE;text-decoration:underline;">+267 395 7755</a> or email <a href="mailto:info@bocra.org.bw" style="color:#00A6CE;text-decoration:underline;">info@bocra.org.bw</a>.</p>
    `,
  },
  'digital-switchover': {
    title: 'Digital Switchover',
    breadcrumb: ['Projects', 'Digital Switchover'],
    accent: 'bocra-magenta',
    content: `
      <h2>Digital Switchover Process</h2>
      <p>In line with the ITU Regional Radiocommunication Conference 2006 (RRC-06), Botswana is transitioning from analogue to digital broadcasting. This migration frees valuable spectrum for mobile broadband services and enables higher quality television for citizens.</p>
      <h3>Benefits</h3>
      <ul>
        <li>Improved picture and sound quality for television viewers</li>
        <li>More channels and content choices</li>
        <li>Release of spectrum dividend for mobile broadband</li>
        <li>Interactive and multimedia services</li>
        <li>Efficient use of scarce radio frequency spectrum</li>
      </ul>
      <h3>Timeline</h3>
      <p>The digital switchover is being implemented in phases, with priority given to major urban centres before extending to rural areas across Botswana.</p>
    `,
  },
  'infrastructure-sharing': {
    title: 'Infrastructure Sharing',
    breadcrumb: ['Projects', 'Infrastructure Sharing'],
    accent: 'bocra-green',
    content: `
      <h2>Infrastructure Sharing</h2>
      <p>BOCRA has developed passive infrastructure sharing guidelines to promote efficient use of telecommunications infrastructure across Botswana. Infrastructure sharing reduces costs, minimises environmental impact, and accelerates network coverage expansion.</p>
      <h3>Guidelines</h3>
      <ul>
        <li><strong>Passive Infrastructure Sharing</strong> \u2014 Sharing of towers, masts, ducts, and building spaces</li>
        <li><strong>Environmental Guidelines</strong> \u2014 Ensuring infrastructure deployment respects Botswana\u2019s environment</li>
        <li><strong>Cost Sharing</strong> \u2014 Fair allocation of shared infrastructure costs between operators</li>
      </ul>
      <p>These guidelines support BOCRA\u2019s objective of universal access by enabling operators to extend coverage to underserved areas more cost-effectively.</p>
    `,
  },
  'itu-capacity-building': {
    title: 'ITU Capacity Building Workshop',
    breadcrumb: ['Documents', 'ITU Capacity Building'],
    accent: 'bocra-cyan',
    content: `
      <h2>ITU Capacity Building Workshop</h2>
      <p>BOCRA participates in and hosts ITU (International Telecommunication Union) capacity building workshops to strengthen regulatory capacity across the Southern African region.</p>
      <h3>Focus Areas</h3>
      <ul>
        <li>Spectrum management best practices</li>
        <li>Regulatory framework development</li>
        <li>Quality of service monitoring</li>
        <li>Cybersecurity and data protection</li>
        <li>Digital inclusion and universal access</li>
      </ul>
      <p>Workshop materials and presentations are available for download from the <a href="/documents/drafts">Documents</a> section.</p>
    `,
  },
  'speeches': {
    title: 'Speeches',
    breadcrumb: ['Media', 'Speeches'],
    accent: 'bocra-blue',
    content: `
      <h2>Speeches Archive</h2>
      <p>Speeches by the BOCRA Chief Executive and senior leadership at regulatory events, conferences, and public engagements.</p>
      <h3>Recent Speeches</h3>
      <ul>
        <li>Breakfast with Broadcasters \u2014 CE Martin Mokgware</li>
        <li>MOU Signing Ceremonies \u2014 Regional regulatory cooperation</li>
        <li>Spectrum Management Conference \u2014 Technical Services</li>
        <li>QoS-QoE Stakeholder Consultation \u2014 Industry workshop</li>
        <li>Broadcasting Code of Conduct \u2014 Media regulation</li>
        <li>UASF Projects Launch \u2014 Universal access initiatives</li>
        <li>World Post Day \u2014 Postal services celebration</li>
      </ul>
      <p>Full speech transcripts will be available for download as they are published. For media enquiries, contact <a href="mailto:info@bocra.org.bw" style="color:#00A6CE;text-decoration:underline;">info@bocra.org.bw</a> or call <a href="tel:+2673957755" style="color:#00A6CE;text-decoration:underline;">+267 395 7755</a>.</p>
    `,
  },
  'media-center': {
    title: 'Media Center',
    breadcrumb: ['Media', 'Media Center'],
    accent: 'bocra-cyan',
    content: `
      <h2>BOCRA Media Center</h2>
      <p>The BOCRA Communications Strategy targets both internal and external audiences including the Board, Government, operators, consumers, and the general public.</p>
      <h3>Our Objectives</h3>
      <ul>
        <li>Promote BOCRA\u2019s mandate and activities to the public</li>
        <li>Educate consumers about their communications rights</li>
        <li>Convey key telecommunications sector messages</li>
        <li>Support peer engagement with regional regulators</li>
        <li>Publish regulatory decisions and consultation outcomes</li>
      </ul>
      <h3>Media Enquiries</h3>
      <p>For press enquiries and media requests, contact the Corporate Communications department at <a href="mailto:info@bocra.org.bw" style="color:#00A6CE;text-decoration:underline;">info@bocra.org.bw</a> or <a href="tel:+2673957755" style="color:#00A6CE;text-decoration:underline;">+267 395 7755</a>.</p>
    `,
  },
};

/* ── Map accent name to hex colour ── */
const ACCENT_COLOURS = {
  'bocra-blue':    '#00458B',
  'bocra-cyan':    '#00A6CE',
  'bocra-magenta': '#C8237B',
  'bocra-yellow':  '#F7B731',
  'bocra-green':   '#6BBE4E',
};

/* ── Map section names to BOCRA dot colours (English + Setswana) ── */
const SECTION_COLOURS = {
  'Mandate':    '#00458B',
  'About':      '#00A6CE',
  'Services':   '#C8237B',
  'Projects':   '#6BBE4E',
  'Documents':  '#F7B731',
  'Complaints': '#C8237B',
  'Media':      '#00A6CE',
  'Technical':  '#00458B',
  'Telecom Statistics': '#6BBE4E',
  'Tariffs':    '#F7B731',
  'FAQs':       '#00A6CE',
  'Privacy Notice': '#00458B',
  'Tenders':    '#F7B731',
  'Taelo':             '#00458B',
  'Ka ga Rona':        '#00A6CE',
  'Ditirelo':          '#C8237B',
  'Diporojeke':        '#6BBE4E',
  'Dikwalo':           '#F7B731',
  'Dingongorego':      '#C8237B',
  'Bobegakgang':       '#00A6CE',
  'Thekenoloji':       '#00458B',
  'Dipalopalo tsa Megala': '#6BBE4E',
  'Ditendara':         '#F7B731',
  'Dipotso tse di Botswang Thata': '#00A6CE',
  'Kitsiso ya Poraefesi': '#00458B',
};

/* ═══════════════════════════════════════════════════
 * MAIN COMPONENT
 * Renders a content page by slug with bilingual support,
 * hero banner, sanitized HTML body, and quick-links strip.
 * ═══════════════════════════════════════════════════ */

export default function ContentPage() {
  const location = useLocation();
  const heroRef = useScrollReveal();
  const contentRef = useScrollReveal({ y: 30 });
  const { lang, t } = useLanguage();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1];
  const localFallback = PAGE_CONTENT[slug] || null;

  const { page, loading } = usePageContent(slug, lang, localFallback);

  /* Select bilingual content: use _tn fields when language is Setswana, fall back to English */
  const displayTitle = (lang === 'tn' && page?.title_tn) ? page.title_tn : (page?.title || '');
  const displayContent = (lang === 'tn' && page?.content_tn) ? page.content_tn : (page?.content || '');
  const displayBreadcrumb = (lang === 'tn' && page?.breadcrumb_tn) ? page.breadcrumb_tn : (page?.breadcrumb || []);

  const quickLinks = useMemo(() => [
    { label: t('content.fileComplaint'), path: '/services/file-complaint' },
    { label: t('content.newsEvents'), path: '/media/news' },
    { label: t('content.documents'), path: '/documents/drafts' },
    { label: t('content.licensing'), path: '/mandate/licensing' },
    { label: t('content.contactUs'), path: '/contact' },
    { label: t('content.faqs'), path: '/faqs' },
  ], [t]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-bocra-blue/20 border-t-bocra-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-bocra-slate/50 text-sm">{t('content.loading')}</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-display text-bocra-blue/20 mb-4">{t('content.404title')}</h1>
          <h2 className="text-2xl font-display text-bocra-slate mb-2">{t('content.404heading')}</h2>
          <p className="text-bocra-slate/60 mb-6">{t('content.404text')}</p>
          <Link to="/" className="btn-primary"><ArrowLeft size={16} /> {t('content.backHome')}</Link>
        </div>
      </div>
    );
  }

  const section = displayBreadcrumb[0] || '';
  const accentHex =
    (page.accent && ACCENT_COLOURS[page.accent]) ||
    SECTION_COLOURS[section] ||
    '#00458B';

  return (
    <div>
      <Helmet>
        <title>{displayTitle} — BOCRA</title>
        <meta name="description" content={displayTitle} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <Breadcrumb items={displayBreadcrumb.map((crumb) => ({ label: crumb }))} />
        </div>
      </div>

      {/* Hero — matches licensing page style, colour by category */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        <div className="relative py-8 sm:py-10 lg:py-12 px-5 sm:px-8 lg:px-10 rounded-2xl overflow-hidden" style={{ backgroundColor: accentHex }}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-1 bg-white/40 rounded-full" />
              <span className="text-xs text-white/60 uppercase tracking-widest font-medium">{section}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight">
              {displayTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* Content body — team-authored HTML rendered via dangerouslySetInnerHTML (project pattern per GUIDE) */}
      <section className="py-8 md:py-12 bg-white">
        <div ref={contentRef} className="section-wrapper">
          <div className="max-w-3xl mx-auto">
            <div
              className="content-body"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(displayContent) }}
            />
          </div>
        </div>
      </section>

      {/* Quick links strip */}
      <section className="py-10 bg-gray-50 border-t border-gray-100">
        <div className="section-wrapper">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-bold text-bocra-slate/40 uppercase tracking-wider mb-4">{t('content.quickLinks')}</h3>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-bocra-slate/70 hover:text-bocra-blue hover:border-bocra-blue/30 transition-all">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner at bottom of every content page */}
      <section className="py-14 bg-bocra-blue-dark">
        <div className="section-wrapper">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">{t('content.ctaTitle')}</h3>
              <p className="text-white/50 text-sm mt-1">{t('content.ctaSubtitle')}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/contact" className="px-5 py-2.5 bg-white text-bocra-blue font-bold text-sm rounded-xl hover:bg-gray-100 transition-all">
                {t('content.ctaContact')}
              </Link>
              <Link to="/services/file-complaint" className="px-5 py-2.5 border-2 border-white/30 text-white font-semibold text-sm rounded-xl hover:bg-white/10 transition-all">
                {t('content.ctaComplaint')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
