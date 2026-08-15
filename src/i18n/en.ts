export const en = {
  'nav.browse': 'Browse',
  'nav.map': 'Map search',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.saved': 'Saved',
  'nav.messages': 'Messages',
  'nav.login': 'Log in',
  'nav.signup': 'Sign up',
  'nav.logout': 'Log out',
  'nav.dashboard': 'Dashboard',

  'hero.badge': 'Now covering Nyarugenge, Gasabo & Kicukiro',
  'hero.headline': 'Find your next home in Kigali, without the guesswork',
  'hero.subheadline':
    'Browse verified houses and apartments with exact map pins, transparent pricing in RWF, and direct contact with owners — no middlemen, no surprises.',

  'footer.tagline':
    'Find and list rental houses and apartments across Kigali — from budget shared rooms to executive villas.',
  'footer.rights': 'All rights reserved.',
  'footer.madeFor': 'Made for renters and owners across Kigali.',

  'status.available': 'Available',
  'status.reserved': 'Reserved',
  'status.rented': 'Rented',
  'status.sold': 'Sold',
  'listing.forRent': 'For rent',
  'listing.forSale': 'For sale',
  'listing.negotiable': 'Negotiable',

  'auth.login.title': 'Log in',
  'auth.login.subtitle': 'Welcome back. Enter your details to continue.',
  'auth.login.email': 'Email',
  'auth.login.password': 'Password',
  'auth.login.submit': 'Log in',
  'auth.login.forgot': 'Forgot password?',
  'auth.login.noAccount': "Don't have an account?",
  'auth.login.signUp': 'Sign up',
  'auth.demo.title': 'Demo accounts',
  'auth.demo.subtitle': 'Any password works. Click one to sign in instantly.',

  'filters.title': 'Filters',
  'filters.reset': 'Reset',
  'filters.location': 'Location',
  'filters.bedrooms': 'Bedrooms',
  'filters.bathrooms': 'Bathrooms',
  'filters.propertyType': 'Property type',
  'filters.furnished': 'Furnished',
  'filters.amenities': 'Amenities',
  'filters.availability': 'Availability',
  'filters.all': 'All',

  'property.chatWithOwner': 'Chat with owner',
  'property.sendEnquiry': 'Send an enquiry',
  'property.verified': 'Verified',
} as const

export type TranslationKey = keyof typeof en
