import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import styles from '../../styles/styles';

export default function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#6b7280"
      style={[styles.input, props.multiline && styles.inputMulti]}
      {...props}
    />
  );
}
