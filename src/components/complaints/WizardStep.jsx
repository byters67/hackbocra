/**
 * WizardStep.jsx — Step wrapper for the ComplaintWizard
 * Provides consistent layout: title, optional subtitle, children content.
 */

export default function WizardStep({ title, subtitle, children }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-bocra-slate">{title}</h3>
        {subtitle && (
          <p className="text-sm text-bocra-slate/60 mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
