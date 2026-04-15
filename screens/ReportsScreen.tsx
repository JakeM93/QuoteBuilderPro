import React from 'react';
import { View, Text } from 'react-native';
import Card from '../components/ui/Card';
import money from '../utils/money';
import styles from '../styles/styles';
import { Quote, Client, QuoteTotals } from '../types';

interface ReportsScreenProps {
  quotes: Quote[];
  clients: Client[];
  totalsForQuote: (quote: Quote) => QuoteTotals;
}

export default function ReportsScreen({ quotes, clients, totalsForQuote }: ReportsScreenProps) {
  return (
    <Card title="Profit & Loss">
      {quotes.map((q) => {
        const client = clients.find((c) => c.id === q.clientId);
        const totals = totalsForQuote(q);
        return (
          <View key={q.id} style={styles.listRow}>
            <Text style={styles.listTitle}>
              {q.quoteNumber} • {client?.clientName}
            </Text>
            <Text style={styles.listMeta}>
              Sell {money(totals.total)} • Cost {money(totals.estimatedCost)} • Profit{' '}
              {money(totals.profit)}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}
