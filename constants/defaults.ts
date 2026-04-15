import uid from '../utils/uid';
import { Catalogue, PricingProfile, Client, Quote, Company } from '../types';

const DEFAULT_ITEMS: Catalogue = {
  Power: [
    { id: uid(), name: 'Double Socket', labour: 25, materials: 18 },
    { id: uid(), name: 'Cooker Connection', labour: 45, materials: 30 },
    { id: uid(), name: 'Fused Spur', labour: 22, materials: 12 },
  ],
  Lighting: [
    { id: uid(), name: 'Downlight', labour: 18, materials: 11 },
    { id: uid(), name: 'Pendant Light', labour: 20, materials: 10 },
    { id: uid(), name: 'LED Strip', labour: 30, materials: 22 },
  ],
  Other: [
    { id: uid(), name: 'Extractor Fan', labour: 35, materials: 28 },
    { id: uid(), name: 'Smoke Alarm', labour: 20, materials: 14 },
    { id: uid(), name: 'Data Point', labour: 28, materials: 16 },
  ],
};

const DEFAULT_PROFILE_ID = uid();
const DEFAULT_CLIENT_ID = uid();
const DEFAULT_QUOTE_ID = uid();
const DEFAULT_ROOM_ID = uid();

export const defaultPricingProfiles: PricingProfile[] = [
  {
    id: DEFAULT_PROFILE_ID,
    name: 'Standard Domestic',
    vatRate: 0.2,
    marginPct: 25,
    complexityMultipliers: {
      'New Install': 1.0,
      Modification: 1.35,
    },
    specMultipliers: {
      Standard: 1.0,
      Premium: 1.2,
    },
    catalogue: JSON.parse(JSON.stringify(DEFAULT_ITEMS)),
  },
];

export const defaultClients: Client[] = [
  {
    id: DEFAULT_CLIENT_ID,
    clientName: 'Demo Client',
    companyName: '',
    billingAddress: '1 Demo Street',
    siteAddress: '1 Demo Street',
    contactName: 'Site Contact',
    contactPhone: '07123 456789',
    contactEmail: 'demo@example.com',
    pricingProfileId: DEFAULT_PROFILE_ID,
    notes: 'Standard domestic client',
  },
];

export const defaultQuotes: Quote[] = [
  {
    id: DEFAULT_QUOTE_ID,
    quoteNumber: 'EQ-1001',
    clientId: DEFAULT_CLIENT_ID,
    status: 'Draft',
    title: 'Demo House Rewire Quote',
    createdAt: '2026-04-07',
    description:
      'Supply and install new power and lighting works throughout the property.',
    exclusions:
      'Decoration, making good, and unforeseen hidden defects are excluded unless stated.',
    activity: [{ id: uid(), action: 'Quote created', date: '2026-04-07', note: '' }],
    rooms: [
      {
        id: DEFAULT_ROOM_ID,
        name: 'Kitchen',
        included: true,
        description: 'Supply and install kitchen power and lighting modifications.',
        items: [
          {
            id: uid(),
            included: true,
            category: 'Power',
            name: 'Double Socket',
            quantity: 4,
            labour: 25,
            materials: 18,
            complexity: 'Modification',
            spec: 'Standard',
            notes: 'Install above worktop where practical',
          },
          {
            id: uid(),
            included: true,
            category: 'Lighting',
            name: 'Downlight',
            quantity: 6,
            labour: 18,
            materials: 11,
            complexity: 'New Install',
            spec: 'Premium',
            notes: 'Warm white LED downlights',
          },
        ],
      },
    ],
  },
];

export const companyDefaults: Company = {
  companyName: 'Soar Electrical',
  address: 'Unit 1, Long Eaton',
  phone: '0115 000 0000',
  email: 'quotes@soarelectrical.co.uk',
  website: 'www.soarelectrical.co.uk',
  quotePrefix: 'EQ',
  nextQuoteNumber: 1002,
  defaultTerms:
    'Payment due within 7 days of invoice unless otherwise agreed. Materials remain property of the contractor until paid in full.',
  defaultExclusions:
    'Decoration, making good, asbestos removal, and structural works excluded unless stated.',
};

export { DEFAULT_ITEMS, DEFAULT_PROFILE_ID, DEFAULT_CLIENT_ID, DEFAULT_QUOTE_ID, DEFAULT_ROOM_ID };
