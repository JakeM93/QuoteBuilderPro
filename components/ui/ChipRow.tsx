import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from '../../styles/styles';

interface ChipOption {
  key: string;
  label: string;
}

interface ChipRowProps {
  options: ChipOption[];
  selected: string | null;
  onSelect: (key: string) => void;
}

export default function ChipRow({ options, selected, onSelect }: ChipRowProps) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const active = selected === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
