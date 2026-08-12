// Matches the web app's tailwind `alayaa` palette + index.css exactly.
// Token names (espresso900, espresso700, ...) are kept as-is from the earlier
// theme so existing screens don't need to change — only the hex values do.
export const colors = {
  espresso900: '#1F2937', // alayaa.text
  espresso700: '#0F766E', // alayaa.primary
  espresso600: '#134E4A', // alayaa.secondary
  espresso400: '#5EA8A0', // mid-tone tint (unused by web, kept for gradients)
  espresso100: '#F0FAF8', // hover/tint background used on nav links
  espresso50: '#FAF9F6',  // alayaa.background
  white: '#FFFFFF',       // alayaa.surface
  danger: '#DC2626',      // Tailwind red-600, matches web's error styling
  success: '#059669',     // Tailwind emerald-600, matches web's success/replied styling
  warning: '#D97706',     // Tailwind amber-600
  border: '#E5E7EB',      // alayaa.border
  textMuted: '#6B7280',   // alayaa.muted
};

export default colors;
