import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/styles';

interface InfoRowProps {
  label: string;
  value: string;
  strong?: boolean;
  compact?: boolean;
}

export default function InfoRow({ label, value, strong, compact }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, compact && { marginBottom: 6 }]}>
      <Text style={[styles.infoLabel, strong && styles.strongText]}>{label}</Text>
      <Text style={[styles.infoValue, strong && styles.strongText]}>{value}</Text>
    </View>
  );
}
