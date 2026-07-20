import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { Field, Card } from './ui';
import colors from '../theme/colors';

export default function EMICalculator({ defaultPrincipal = 5000000 }) {
  const [principal, setPrincipal] = useState(String(defaultPrincipal));
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');

  const emi = useMemo(() => {
    const p = Number(principal) || 0;
    const r = (Number(rate) || 0) / 12 / 100;
    const n = (Number(tenure) || 0) * 12;
    if (!p || !r || !n) return 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [principal, rate, tenure]);

  return (
    <Card>
      <Text style={{ fontWeight: '700', fontSize: 15, color: colors.espresso900, marginBottom: 12 }}>EMI Calculator</Text>
      <Field label="Loan amount (₹)" keyboardType="numeric" value={principal} onChangeText={setPrincipal} />
      <Field label="Interest rate (% p.a.)" keyboardType="numeric" value={rate} onChangeText={setRate} />
      <Field label="Tenure (years)" keyboardType="numeric" value={tenure} onChangeText={setTenure} />
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Estimated Monthly EMI</Text>
        <Text style={{ color: colors.espresso900, fontSize: 22, fontWeight: '800' }}>
          ₹{emi ? Math.round(emi).toLocaleString('en-IN') : '0'}
        </Text>
      </View>
    </Card>
  );
}
