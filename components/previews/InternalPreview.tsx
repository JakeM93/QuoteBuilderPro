import React from 'react';
import { View } from 'react-native';
import InfoRow from '../ui/InfoRow';
import money from '../../utils/money';
import { QuoteTotals } from '../../types';

interface InternalPreviewProps {
  totals: QuoteTotals;
}

export default function InternalPreview({ totals }: InternalPreviewProps) {
  return (
    <View>
      <InfoRow label="Labour Cost" value={money(totals.labourCost)} />
      <InfoRow label="Material Cost" value={money(totals.materialCost)} />
      <InfoRow label="Estimated Cost" value={money(totals.estimatedCost)} />
      <InfoRow label="Internal Sell Before VAT" value={money(totals.subtotal)} />
      <InfoRow label="Customer Sell Before VAT" value={money(totals.customerSubtotal)} />
      <InfoRow label="Estimated Profit" value={money(totals.profit)} />
      <InfoRow label="Profit %" value={`${totals.profitPct.toFixed(1)}%`} strong />
    </View>
  );
}
