import React from 'react';
import { Text } from 'react-native';
import styles from '../../styles/styles';

interface LabelProps {
  text: string;
}

export default function Label({ text }: LabelProps) {
  return <Text style={styles.label}>{text}</Text>;
}
