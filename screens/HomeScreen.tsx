import React from 'react';
import { View, Text } from 'react-native';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import InfoRow from '../components/ui/InfoRow';
import Button from '../components/ui/Button';
import money from '../utils/money';
import styles from '../styles/styles';
import { DashboardStats, ClientTotalsRow } from '../types';

interface HomeScreenProps {
  dashboardStats: DashboardStats;
  totalByClient: ClientTotalsRow[];
  addQuote: () => void;
  addClient: () => void;
}

export default function HomeScreen({
  dashboardStats,
  totalByClient,
  addQuote,
  addClient,
}: HomeScreenProps) {
  return (
    <>
      <View style={styles.rowWrap}>
        <StatCard title="Clients" value={dashboardStats.totalClients} />
        <StatCard title="Quotes" value={dashboardStats.totalQuotes} />
        <StatCard title="Draft" value={dashboardStats.draftQuotes} />
        <StatCard title="Sent" value={dashboardStats.sentQuotes} />
        <StatCard title="Accepted" value={dashboardStats.acceptedQuotes} />
        <StatCard title="Rejected" value={dashboardStats.rejectedQuotes} />
      </View>

      <Card title="Financial Overview">
        <InfoRow
          label="Total Quoted Value"
          value={money(dashboardStats.totalQuotedValue)}
        />
        <InfoRow
          label="Total Estimated Profit"
          value={money(dashboardStats.totalProfit)}
        />
      </Card>

      <Card title="Quick Actions">
        <Button text="New Quote" onPress={addQuote} />
        <Button text="New Client" onPress={addClient} />
      </Card>

      <Card title="Profit by Client">
        {totalByClient.map((row) => (
          <View key={row.clientName} style={styles.listRow}>
            <Text style={styles.listTitle}>{row.clientName}</Text>
            <Text style={styles.listMeta}>
              {money(row.total)} • Profit {money(row.profit)}
            </Text>
          </View>
        ))}
      </Card>
    </>
  );
}
