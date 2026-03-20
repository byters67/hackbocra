/**
 * Data Protection Act Consent Checkbox
 *
 * Reusable consent component for all forms that collect personal data.
 * Required by the Botswana Data Protection Act, 2018 (Section 18).
 *
 * Usage:
 *   <ConsentCheckbox checked={consent} onChange={setConsent} purpose="complaint resolution" />
 */
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function ConsentCheckbox({ checked, onChange, purpose = 'processing your request' }) {
  return (
    <div className="bg-bocra-blue/[0.03] border border-bocra-blue/10 rounded-xl p-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-bocra-blue focus:ring-bocra-blue flex-shrink-0"
        />
        <div className="space-y-1">
          <span className="text-sm text-bocra-slate leading-relaxed block">
            I consent to BOCRA collecting and processing my personal data for the purpose of{' '}
            <strong>{purpose}</strong>, in accordance with the{' '}
            <Link to="/privacy-notice" className="text-bocra-blue hover:underline font-medium" target="_blank">
              Data Protection Act, 2018
            </Link>.
          </span>
          <span className="text-xs text-bocra-slate/40 flex items-center gap-1">
            <Shield size={10} />
            Your data is encrypted, never sold, and retained only as long as necessary.
          </span>
        </div>
      </label>
    </div>
  );
}
