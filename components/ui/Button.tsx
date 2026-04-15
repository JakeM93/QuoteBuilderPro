import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../../styles/styles';

interface ButtonProps {
  text: string;
  onPress: () => void;
}

export default function Button({ text, onPress }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}
