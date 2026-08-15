export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  avatar?: string
}

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Claudine Mukamana',
    role: 'Tenant, Kimironko',
    quote:
      'I found my apartment in two days flat. Being able to see the exact pin on the map before messaging the owner saved me so many wasted trips.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop',
  },
  {
    id: 'testimonial-2',
    name: 'Jean Bosco Habimana',
    role: 'Property owner',
    quote:
      'Listing my three units took less than fifteen minutes each. The enquiries come in organised and I no longer lose messages in WhatsApp.',
    avatar: 'https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=200&q=80&auto=format&fit=crop',
  },
  {
    id: 'testimonial-3',
    name: 'Yvonne Keza',
    role: 'Tenant, Remera',
    quote:
      'The filters actually work the way I expect — I set my budget and amenities once and every result matched. No more scrolling through listings I cannot afford.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80&auto=format&fit=crop',
  },
]
