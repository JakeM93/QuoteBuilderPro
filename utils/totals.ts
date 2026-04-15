import { Quote, Client, PricingProfile, QuoteTotals } from '../types';

const totalsForQuote = (
  quote: Quote,
  clients: Client[],
  pricingProfiles: PricingProfile[]
): QuoteTotals => {
  const client = clients.find((c) => c.id === quote.clientId);
  const profile =
    pricingProfiles.find((p) => p.id === client?.pricingProfileId) ||
    pricingProfiles[0];
  const marginPct = profile?.marginPct || 0;
  const vatRate = profile?.vatRate || 0;

  let labourCost = 0;
  let materialCost = 0;
  let internalSell = 0;

  quote.rooms
    .filter((r) => r.included)
    .forEach((room) => {
      room.items
        .filter((i) => i.included)
        .forEach((item) => {
          const baseLabour = item.labour * item.quantity;
          const baseMaterial = item.materials * item.quantity;
          const complexity = profile.complexityMultipliers[item.complexity] || 1;
          const spec = profile.specMultipliers[item.spec] || 1;
          const cost = (baseLabour + baseMaterial) * complexity * spec;

          labourCost += baseLabour;
          materialCost += baseMaterial;
          internalSell += cost * (1 + marginPct / 100);
        });
    });

  const customerSubtotal = quote.rooms
    .filter((r) => r.included)
    .reduce((sum, room) => {
      return (
        sum +
        room.items
          .filter((i) => i.included)
          .reduce((roomSum, item) => {
            const baseLabour = item.labour * item.quantity;
            const baseMaterial = item.materials * item.quantity;
            const complexity = profile.complexityMultipliers[item.complexity] || 1;
            const spec = profile.specMultipliers[item.spec] || 1;
            return roomSum + (baseLabour + baseMaterial) * complexity * spec;
          }, 0)
      );
    }, 0);

  const subtotal = internalSell;
  const vat = customerSubtotal * vatRate;
  const total = customerSubtotal + vat;
  const estimatedCost = labourCost + materialCost;
  const profit = subtotal - estimatedCost;
  const profitPct = subtotal > 0 ? (profit / subtotal) * 100 : 0;

  return {
    labourCost,
    materialCost,
    estimatedCost,
    customerSubtotal,
    subtotal,
    vat,
    total,
    profit,
    profitPct,
  };
};

export default totalsForQuote;
