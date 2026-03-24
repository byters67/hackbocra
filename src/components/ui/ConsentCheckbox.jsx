/**
 * ConsentCheckbox.jsx — Data Protection Act Consent Component
 *
 * Reusable consent checkbox required on all public forms (complaints, contact,
 * licence applications) to comply with the Botswana Data Protection Act, 2018.
 *
 * Props:
 *   checked   — boolean: whether the checkbox is ticked
 *   onChange  — function(boolean): callback when the checkbox state changes
 *   purpose   — string: English description of data processing purpose
 *   purposeTn — string: Setswana translation of the purpose
 *
 * The checkbox is marked as `required` — forms cannot submit without consent.
 * Links to the Privacy Notice page for full data processing details.
 * Bilingual (English / Setswana) — switches automatically with language toggle.
 */
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useLanguage } from '../../lib/language';

export default function ConsentCheckbox({ checked, onChange, purpose = 'processing your request', purposeTn = 'go dira kopo ya gago' }) {
  const { lang } = useLanguage();
  return (
    <div className="bg-bocra-blue/[0.03] border border-bocra-blue/10 rounded-xl p-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} required
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-bocra-blue focus:ring-bocra-blue flex-shrink-0" />
        <div className="space-y-1">
          <span className="text-sm text-bocra-slate leading-relaxed block">
            {lang === 'tn' ? (<>
              Ke dumelela BOCRA go kokoanya le go dirisa data ya me ya botho ka maikaelelo a{' '}
              <strong>{purposeTn}</strong>, go ya ka{' '}
              <Link to="/privacy-notice" className="text-bocra-blue hover:underline font-medium" target="_blank">Molao wa Tshireletso ya Data, 2018</Link>.
            </>) : (<>
              I consent to BOCRA collecting and processing my personal data for the purpose of{' '}
              <strong>{purpose}</strong>, in accordance with the{' '}
              <Link to="/privacy-notice" className="text-bocra-blue hover:underline font-medium" target="_blank">Data Protection Act, 2018</Link>.
            </>)}
          </span>
          <span className="text-xs text-bocra-slate/40 flex items-center gap-1">
            <Shield size={10} />
            {lang === 'tn' ? 'Data ya gago e sireletsegile, ga e rekisiwe, e bolokilwe fela ka nako e e tlhokegang.' : 'Your data is encrypted, never sold, and retained only as long as necessary.'}
          </span>
        </div>
      </label>
    </div>
  );
}
