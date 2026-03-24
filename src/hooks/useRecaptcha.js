/**
 * useRecaptcha — Google reCAPTCHA v3 hook
 * 
 * Returns an executeRecaptcha function that generates a token
 * for server-side verification. Score-based, invisible to users.
 * 
 * Usage:
 *   const { executeRecaptcha } = useRecaptcha();
 *   const token = await executeRecaptcha('submit_complaint');
 */

// Must match the `render=` key in index.html (and your reCAPTCHA v3 site key in Google Admin).
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LdQpZIsAAAAAOcSTO1ysgiemlV7HwC_1aej1jwz';

export function useRecaptcha() {
  const executeRecaptcha = async (action = 'submit') => {
    try {
      if (!window.grecaptcha) {
        console.warn('[BOCRA] reCAPTCHA not loaded');
        return null;
      }
      await new Promise((resolve) => window.grecaptcha.ready(resolve));
      const token = await window.grecaptcha.execute(SITE_KEY, { action });
      return token;
    } catch (err) {
      console.warn('[BOCRA] reCAPTCHA execution failed:', err);
      return null;
    }
  };

  return { executeRecaptcha };
}

export default useRecaptcha;
