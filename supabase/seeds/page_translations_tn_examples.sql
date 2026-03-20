-- =============================================================================
-- BOCRA Website — Example Setswana (TN) Page Translations
-- =============================================================================
--
-- Run this in the Supabase SQL Editor to seed a few example Setswana pages.
-- Once inserted, switching the site to TN will show these translations
-- for the corresponding slugs instead of the English fallback.
--
-- To add more: copy any block below, change the slug, and provide
-- Setswana title + breadcrumb + content HTML.
-- =============================================================================

INSERT INTO page_translations (slug, lang, title, breadcrumb, accent, content, status)
VALUES

-- ── Telecommunications ──────────────────────────────────────────────
(
  'telecommunications',
  'tn',
  'Megala le Dikgolagano',
  ARRAY['Taelo', 'Megala le Dikgolagano'],
  'bocra-cyan',
  '
    <h2>Taolo ya Megala le Dikgolagano mo Botswana</h2>
    <p>Lefapha la megala le dikgolagano mo Botswana le fetogile thata fa e sale Pholisi ya Megala ya 1995, e e neng ya bula mmaraka go kgaisano. BOCRA e laola Badirisi ba Megala ba Bagolo ba le Bararo (PTOs): Botswana Telecommunications Corporation (BTC), Mascom Wireless, le Orange Botswana.</p>

    <h3>Letlhomeso la Dilaesense</h3>
    <p>Letlhomeso la dilaesense le akaretsa dilaesense tsa Network Facility Provider (NFP), Service Application Provider (SAP), le Content Service Provider (CSP). Ditirelo tsa Value Added Network Services (VANS) di lokolotswe, mme ditirelo tsa VoIP di letlelelwa ka fa tlase ga letlhomeso la taolo ya ga jaana.</p>

    <h3>Diphetogo tsa Mmaraka</h3>
    <p>Fa e sale ka 1998, BOCRA e diragaditse diphetogo tsa mmaraka tse di tswelelang pele go akaretsa go tlhagisiwa ga Dilaesense tsa Private Telecommunications Network (PTNL), ditaelo tsa dikgolagano, le melao ya ditšhelete go netefatsa kgaisano e e siameng le ditirelo tse di kgonegang go Batswana botlhe.</p>

    <h3>Badirisi ba Bagolo</h3>
    <ul>
      <li><strong>Mascom Wireless</strong> — Modirisi wa mogala o mogolo</li>
      <li><strong>BTC (be Mobile)</strong> — Kompone ya megala ya setšhaba</li>
      <li><strong>Orange Botswana</strong> — Modirisi wa boraro wa mogala</li>
      <li><strong>BoFiNet</strong> — Motlamedi wa mafaratlhatlha a inthanete a setšhaba</li>
    </ul>
  ',
  'published'
),

-- ── Broadcasting ────────────────────────────────────────────────────
(
  'broadcasting',
  'tn',
  'Phasalatso',
  ARRAY['Taelo', 'Phasalatso'],
  'bocra-magenta',
  '
    <h2>Taolo ya Phasalatso</h2>
    <p>Molao wa CRA o laela BOCRA go laola phasalatso yotlhe, ditirelo tsa taolo ya tumalano le go phasa gape ntle le phasalatso ya puso. BOCRA e laola phasalatso ya kgwebo ya radio le thelebishene mo Botswana.</p>

    <h3>Diseteishene tsa Radio tsa Kgwebo tse di Laesensitsweng</h3>
    <ul>
      <li><strong>Yarona FM</strong> — E bonala mo ditoropong le metsaneng e mentsi mo Botswana, gape e fitlhelwa lefatshe lotlhe ka phasalatso ya inthanete</li>
      <li><strong>Duma FM</strong> — E bonala mo ditoropong le metsaneng e mentsi, ka phasalatso ya inthanete go fitlhelwa lefatshe lotlhe</li>
      <li><strong>Gabz FM</strong> — E bonala mo ditoropong le metsaneng e mentsi, ka phasalatso ya inthanete go fitlhelwa lefatshe lotlhe</li>
    </ul>

    <h3>Ditlhokego tsa Diteng tsa Selegae</h3>
    <p>Baphasi ba tshwanetse go rotloetsa dikopelo tsa baopedi ba selegae. Dilaesense tsa baphasi di tlhalosa phesente nngwe ya diteng tsa selegae e e tshwanetseng go latelwa, go rotloetsa setso sa Botswana, talente, le maikutlo mo bobegakganeng.</p>
  ',
  'published'
),

-- ── Privacy Notice ──────────────────────────────────────────────────
(
  'privacy-notice',
  'tn',
  'Kitsiso ya Poraefesi',
  ARRAY['Kitsiso ya Poraefesi'],
  NULL,
  '
    <h2>Kitsiso ya Poraefesi ya BOCRA</h2>
    <p>Boto ya Taolo ya Dikgolagano ya Botswana (BOCRA) e tlotla poraefesi ya gago. Kitsiso e e tlhalosa ka fa re kokoanyetsang, re dirisang, le go sireletsa tshedimosetso ya gago ka teng.</p>

    <h3>Tshedimosetso e Re e Kokoanyang</h3>
    <p>Re ka kokoanya tshedimosetso e o re e nayang ka boithaopo fa o tlatsa diforomo tsa rona tsa inthanete, go akaretsa leina la gago, imeile, nomoro ya mogala, le diteng tsa molaetsa wa gago.</p>

    <h3>Ka Fa Re Dirisang Tshedimosetso ya Gago ka Teng</h3>
    <p>Tshedimosetso ya gago e dirisiwa fela go araba dipotso tsa gago, go sekaseka dingongorego, le go tokafatsa ditirelo tsa rona. Ga re rekise kgotsa go abelana tshedimosetso ya gago le batho ba bangwe ntle le fa molao o re laela.</p>

    <h3>Tshireletso ya Data</h3>
    <p>Re dirisa dikgato tse di maleba tsa thekenoloji le tsamaiso go sireletsa tshedimosetso ya gago kgatlhanong le phitlhelelo e e sa letlelelwang, go latlhegelwa, kgotsa go senyega.</p>
  ',
  'published'
),

-- ── FAQs ────────────────────────────────────────────────────────────
(
  'faqs',
  'tn',
  'Dipotso tse di Botswang Thata',
  ARRAY['Dipotso tse di Botswang Thata'],
  NULL,
  '
    <h2>Dipotso tse di Botswang Thata</h2>

    <h3>BOCRA ke eng?</h3>
    <p>BOCRA ke Boto ya Taolo ya Dikgolagano ya Botswana. E laola megala le dikgolagano, phasalatso, poso, le ditirelo tsa inthanete mo Botswana.</p>

    <h3>Ke faela ngongorego jang?</h3>
    <p>O ka faela ngongorego ka go dirisa foromo ya rona ya mo inthaneteng mo tsebeng ya "Faela Ngongorego", kgotsa ka go leletsa +267 395 7755, kgotsa ka go romela imeile kwa info@bocra.org.bw.</p>

    <h3>Ke kopa laesense jang?</h3>
    <p>Etela tsebe ya rona ya Dilaesense go bona mefuta e e farologaneng ya dilaesense le ditlhokego. Dikopo di ka dirwa ka Setheo sa BOCRA.</p>

    <h3>Ke netefatsa laesense ya modirisi jang?</h3>
    <p>Dirisa sedirisiwa sa rona sa Netefatso ya Laesense ya mo Inthaneteng go tlhola gore modirisi o na le laesense e e siameng.</p>
  ',
  'published'
),

-- ── Organogram ────────────────────────────────────────────────────
(
  'organogram',
  'tn',
  'Setlhamo sa Mokgatlho',
  ARRAY['Ka ga Rona', 'Setlhamo sa Mokgatlho'],
  'bocra-blue',
  '
    <h2>Thulaganyo ya Mokgatlho</h2>
    <p>BOCRA e rulagantswe ka mafapha a a latelang ka fa tlase ga boeteledipele jwa Molaodi Mogolo:</p>
    <ul>
      <li><strong>Obamelo le Tlhokego ya Melao</strong> — Go netefatsa gore ba ba nang le dilaesense ba obamela melao</li>
      <li><strong>Tshegetso ya Kompone</strong> — Ditlamelo tsa badiri, tsamaiso, le dithuso</li>
      <li><strong>Tlhabololo ya Kgwebo</strong> — Togamaano, patlisiso, le tirisano mmogo le baamegi</li>
      <li><strong>Ditirelo tsa Thekenoloji</strong> — Taolo ya megala ya wireless, kamogelo ya mefuta, le tlhokomelo ya boleng jwa ditirelo</li>
      <li><strong>Dikgolagano le Kamano tsa Kompone</strong> — Ditiro tsa setšhaba le bobegakgang</li>
      <li><strong>Ditšhelete</strong> — Taolo ya ditšhelete le theko ya dithoto</li>
      <li><strong>Dilaesense</strong> — Dikopo le taolo ya dilaesense</li>
      <li><strong>Inthanete e e Anameng le Tirelo ya Botlhe</strong> — UASF le kgolo ya inthanete e e anameng</li>
      <li><strong>Molao, Obamelo le Mokwaledi wa Boto</strong> — Ditiro tsa molao le puso</li>
    </ul>
    <h3>Maitlhomo a Mokgatlho</h3>
    <p>Maitlhomo a BOCRA a akaretsa go rotloetsa kgaisano, go netefatsa phitlhelelo ya botlhe, go sireletsa badirisi, go dirisa dikhumo sentle, go godisa talente, le go dirisana le baamegi mo lephateng la dikgolagano.</p>
  ',
  'published'
),

-- ── History ───────────────────────────────────────────────────────
(
  'history',
  'tn',
  'Hisetori ya Taolo ya Dikgolagano',
  ARRAY['Ka ga Rona', 'Hisetori'],
  'bocra-blue',
  '
    <h2>Hisetori ya Taolo ya Dikgolagano mo Botswana</h2>
    <h3>2003 — Taolo ya Ntlha</h3>
    <p>Botswana Telecommunications Corporation (BTC) e filwe laesense ya go dira ya dingwaga di le 15. BOCRA (ka nako eo e ne e bidiwa BTA) e phasaladitse Ditaelo tsa Dikgolagano, tse di isitseng kwa tshwetsong ya ntlha ya dikgolagano magareng ga BTC, Mascom Wireless, le Orange Botswana.</p>
    <h3>2012 — Molao wa CRA</h3>
    <p>Molao wa Communications Regulatory Authority wa 2012 o ile wa isiwa ke Palamente, o bopa letlhomeso la molao la molaodi o o kopaneng o o akaretsang megala le dikgolagano, phasalatso, poso, le ditirelo tsa inthanete.</p>
    <h3>2013 — BOCRA e Tlhongwa</h3>
    <p>Ka la 1 Moranang 2013, Botswana Communications Regulatory Authority (BOCRA) e ile ya tlhongwa semmuso ka fa tlase ga Molao wa CRA, e tsaya legato la Botswana Telecommunications Authority (BTA) ya pele.</p>
    <h3>2014 — Molao wa Dijitale</h3>
    <p>Molao wa Electronic Records (Evidence) le Molao wa Electronic Communications and Transactions di ile tsa fetisiwa, di atolosa go laola ga BOCRA go ya kwa ikonoming ya dijitale.</p>
    <h3>2025 — Letlhomeso la Segompieno</h3>
    <p>Molao wa Digital Services wa 2025 le Molao wa Cybersecurity wa 2025 di ile tsa isiwa, di tlhoma letlhomeso le le feletseng la go laola ditirelo tsa dijitale le go netefatsa tshireletso ya dijitale ya setšhaba.</p>
  ',
  'published'
),

-- ── Chief Executive ──────────────────────────────────────────────
(
  'chief-executive',
  'tn',
  'Lefoko go Tswa go Molaodi Mogolo',
  ARRAY['Ka ga Rona', 'Molaodi Mogolo'],
  'bocra-blue',
  '
    <h2>Rre Martin Mokgware — Molaodi Mogolo</h2>
    <p>Ke lo amogela mo webesaeteng ya Botswana Communications Regulatory Authority. Jaaka Molaodi Mogolo, ke laletsa baamegi botlhe — baagi, ba ba nang le dilaesense, le balekane — go sekaseka setheo sa rona sa dijitale le go buisana le rona ka dikgang tsa taolo ya dikgolagano.</p>
    <p>BOCRA e sa ntse e ikemiseditse go rotloetsa tikologo ya dikgolagano e e nang le kgaisano, boitlhamelo, le e e siametseng badirisi mo Botswana. Re tsweletse go dira go ya kwa ponong ya rona ya setšhaba se se golaganeng le se se etelwetsweng pele ke dijitale.</p>
    <p>Ke lo rotloetsa go dirisa ditirelo tsa rona tsa mo inthaneteng, go re neela maikutlo, le go dirisana le rona go aga Botswana e e golaganeng botoka go botlhe.</p>
  ',
  'published'
),

-- ── Board of Directors ───────────────────────────────────────────
(
  'board',
  'tn',
  'Boto ya Balaodi',
  ARRAY['Ka ga Rona', 'Boto ya Balaodi'],
  'bocra-blue',
  '
    <h2>Boto ya Balaodi</h2>
    <p>Boto ya BOCRA e neela togamaano le puso ya setheo.</p>
    <ul>
      <li><strong>Dr. Bokamoso Basutli, PhD</strong> — Modulasetilo wa Boto</li>
      <li><strong>Rre Moabi Pusumane</strong> — Motlatsa Modulasetilo</li>
      <li><strong>Mme Montle Phuthego</strong> — Leloko la Boto</li>
      <li><strong>Mme Alta Dimpho Seleka</strong> — Leloko la Boto</li>
      <li><strong>Mme Lebogang George</strong> — Leloko la Boto</li>
      <li><strong>Rre Ronald Kgafela</strong> — Leloko la Boto</li>
      <li><strong>Dr. Kennedy Ramojela</strong> — Leloko la Boto</li>
      <li><strong>Rre Martin Mokgware</strong> — Molaodi Mogolo (ka thotloetso)</li>
    </ul>
  ',
  'published'
),

-- ── Executive Management ─────────────────────────────────────────
(
  'executive-management',
  'tn',
  'Botsamaisi jo Bogolo',
  ARRAY['Ka ga Rona', 'Botsamaisi jo Bogolo'],
  'bocra-blue',
  '
    <h2>Setlhopha sa Botsamaisi jo Bogolo</h2>
    <ul>
      <li><strong>Martin Mokgware</strong> — Molaodi Mogolo</li>
      <li><strong>Murphy Setshwane</strong> — Mokaedi, Tlhabololo ya Kgwebo</li>
      <li><strong>Peter Tladinyane</strong> — Mokaedi, Ditirelo tsa Kompone</li>
      <li><strong>Bonny Mine</strong> — Mokaedi, Ditšhelete</li>
      <li><strong>Bathopi Luke</strong> — Mokaedi, Ditirelo tsa Thekenoloji</li>
      <li><strong>Tebogo Mmoshe</strong> — Mokaedi, Dilaesense</li>
      <li><strong>Maitseo Ratladi</strong> — Mokaedi, Inthanete e e Anameng le Tirelo ya Botlhe</li>
      <li><strong>Joyce Isa-Molwane</strong> — Molao, Obamelo le Mokwaledi wa Boto</li>
    </ul>
  ',
  'published'
),

-- ── Careers ───────────────────────────────────────────────────────
(
  'careers',
  'tn',
  'Ditiro',
  ARRAY['Ka ga Rona', 'Ditiro'],
  'bocra-cyan',
  '
    <h2>Ditiro kwa BOCRA</h2>
    <p>BOCRA e ikemiseditse go ngoka le go boloka baporofešenale ba ba nang le talente ba ba abelanang kgatlhego ya rona mo taoleng ya dikgolagano le tirelong ya setšhaba.</p>
    <h3>Maemo a a Leng Teng ga Jaana</h3>
    <p>Lenaane la ditiro le bewa fano fa maemo a nna teng. Leba gape ka metlha go bona ditšhono tse disha.</p>
    <p>Go kopa setipo sepe, romela CV ya gago le lekwalo la kopo kwa <strong>info@bocra.org.bw</strong> ka setlhogo sa tiro mo moring wa imeile.</p>
    <h3>Goreng o Dire kwa BOCRA?</h3>
    <ul>
      <li>Tsenya letsogo mo diphetogong tsa dijitale tsa Botswana</li>
      <li>Dira kwa pele ga taolo ya dikgolagano</li>
      <li>Ditšhono tsa tlhabololo ya boprofešenale</li>
      <li>Tuelo e e kgaisanang le dikgolelo</li>
      <li>Tikologo ya tiro e e dirisanyang le e e akaretsang</li>
    </ul>
  ',
  'published'
)

ON CONFLICT (slug, lang) DO UPDATE SET
  title      = EXCLUDED.title,
  breadcrumb = EXCLUDED.breadcrumb,
  accent     = EXCLUDED.accent,
  content    = EXCLUDED.content,
  status     = EXCLUDED.status,
  updated_at = now();
