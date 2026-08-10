import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Card, Field, Button, ErrorText } from './ui';
import { getFriendlyErrorMessage } from '../services/api';
import colors from '../theme/colors';

export default function ContactCard({ brokerName, onSubmit }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!message.trim()) {
      setError('Please enter a message for the broker.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit(message.trim());
      setSent(true);
      setMessage('');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Text style={{ fontWeight: '700', fontSize: 15, color: colors.espresso900, marginBottom: 4 }}>
        Contact {brokerName || 'the broker'}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>
        Send an enquiry and the broker will reply directly.
      </Text>
      {sent ? (
        <Text style={{ color: colors.success, fontWeight: '600' }}>Your enquiry has been sent!</Text>
      ) : (
        <>
          <ErrorText>{error}</ErrorText>
          <Field
            placeholder="I'm interested in this property..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={{ minHeight: 90, textAlignVertical: 'top' }}
          />
          <Button title="Send Enquiry" onPress={submit} loading={loading} />
        </>
      )}
    </Card>
  );
}