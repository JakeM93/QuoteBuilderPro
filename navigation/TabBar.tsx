import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from '../styles/styles';

export const TABS = ['Home', 'Quotes', 'Clients', 'Pricing', 'Reports', 'Settings'] as const;

export type TabName = typeof TABS[number];

interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

export default function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.tabRow}>
      {TABS.map((t) => (
        <TouchableOpacity
          key={t}
          style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
          onPress={() => onTabPress(t)}
        >
          <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
