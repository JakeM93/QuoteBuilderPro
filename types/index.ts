export interface CatalogueItem {
  id: string;
  name: string;
  labour: number;
  materials: number;
}

export type Catalogue = Record<string, CatalogueItem[]>;

export interface PricingProfile {
  id: string;
  name: string;
  vatRate: number;
  marginPct: number;
  complexityMultipliers: Record<string, number>;
  specMultipliers: Record<string, number>;
  catalogue: Catalogue;
}

export interface Client {
  id: string;
  clientName: string;
  companyName: string;
  billingAddress: string;
  siteAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  pricingProfileId: string;
  notes: string;
}

export interface QuoteItem {
  id: string;
  included: boolean;
  category: string;
  name: string;
  quantity: number;
  labour: number;
  materials: number;
  complexity: string;
  spec: string;
  notes: string;
}

export interface Room {
  id: string;
  name: string;
  included: boolean;
  description: string;
  items: QuoteItem[];
}

export interface ActivityEntry {
  id: string;
  action: string;
  date: string;
  note: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'On Hold';
  title: string;
  createdAt: string;
  description: string;
  exclusions: string;
  revision?: string;
  activity: ActivityEntry[];
  rooms: Room[];
}

export interface Company {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  quotePrefix: string;
  nextQuoteNumber: number;
  defaultTerms: string;
  defaultExclusions: string;
}

export interface QuoteTotals {
  labourCost: number;
  materialCost: number;
  estimatedCost: number;
  customerSubtotal: number;
  subtotal: number;
  vat: number;
  total: number;
  profit: number;
  profitPct: number;
}

export interface DashboardStats {
  totalClients: number;
  totalQuotes: number;
  draftQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  sentQuotes: number;
  totalQuotedValue: number;
  totalProfit: number;
}

export interface ClientTotalsRow {
  clientName: string;
  total: number;
  profit: number;
}
