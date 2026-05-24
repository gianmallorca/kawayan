export const publicNavItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/articles', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
] as const;

export const legalNavItems = [
  { to: '/privacy-policy', slug: 'privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', slug: 'terms', label: 'Terms of Service' },
  { to: '/cookie-policy', slug: 'cookie-policy', label: 'Cookie Policy' },
] as const;
