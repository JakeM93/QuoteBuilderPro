import React from 'react';
import { View, Text } from 'react-native';
import InfoRow from '../ui/InfoRow';
import money from '../../utils/money';
import styles from '../../styles/styles';
import { Quote, QuoteTotals, PricingProfile } from '../../types';

interface BreakdownPreviewProps {
  quote: Quote;
  totals: QuoteTotals;
  profile: PricingProfile;
}

export default function BreakdownPreview({ quote, totals, profile }: BreakdownPreviewProps) {
  return (
    <View>
      {quote.rooms
        .filter((r) => r.included)
        .map((room) => (
          <View key={room.id} style={styles.itemCardSoft}>
            <Text style={styles.groupTitle}>{room.name}</Text>
            {room.items
              .filter((i) => i.included)
              .map((item) => {
                const multiplier =
                  (profile.complexityMultipliers[item.complexity] || 1) *
                  (profile.specMultipliers[item.spec] || 1);
                const line =
                  (item.labour + item.materials) * item.quantity * multiplier;
                return (
                  <View key={item.id} style={styles.listRow}>
                    <Text style={styles.listTitle}>
                      {item.name} x{item.quantity}
                    </Text>
                    <Text style={styles.listMeta}>
                      {item.category} • {item.notes || 'No notes'} • {money(line)}
                    </Text>
                  </View>
                );
              })}
          </View>
        ))}

      <InfoRow label="Subtotal" value={money(totals.customerSubtotal)} />
      <InfoRow label="VAT" value={money(totals.vat)} />
      <InfoRow label="Total" value={money(totals.total)} strong />
    </View>
  );
}
