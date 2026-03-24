/**
 * BOCRA Logo Component
 * 
 * Accurate SVG recreation of the official BOCRA logo.
 * The logo consists of:
 *   - "BOCRA" in bold dark blue sans-serif (not serif) uppercase
 *   - Four colored circles below, slightly overlapping:
 *     Cyan (#00A6CE), Magenta (#C8237B), Yellow (#F7B731), Green (#6BBE4E)
 *   
 * These represent the four regulated sectors:
 *   Telecoms, Broadcasting, Postal, Internet
 * 
 * @param {object} props
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.white] - Use white text variant (for dark backgrounds)
 * @param {number} [props.height] - Logo height in pixels (default: 48)
 */
export default function BocraLogo({ className = '', white = false, height = 48 }) {
  const textColor = white ? '#FFFFFF' : '#00458B';

  return (
    <svg
      viewBox="0 0 180 60"
      height={height}
      className={className}
      role="img"
      aria-label="BOCRA - Botswana Communications Regulatory Authority"
    >
      {/* BOCRA Text - Bold sans-serif to match actual brand */}
      <text
        x="90"
        y="32"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', 'Arial Black', 'Helvetica Neue', sans-serif"
        fontSize="38"
        fontWeight="800"
        fill={textColor}
        letterSpacing="6"
      >
        BOCRA
      </text>

      {/* Four colored dots - slightly overlapping as in actual logo */}
      <circle cx="56" cy="50" r="6" fill="#00A6CE" />
      <circle cx="74" cy="50" r="6" fill="#C8237B" />
      <circle cx="92" cy="50" r="6" fill="#F7B731" />
      <circle cx="110" cy="50" r="6" fill="#6BBE4E" />
    </svg>
  );
}
