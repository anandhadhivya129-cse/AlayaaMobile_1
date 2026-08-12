import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { Send } from 'lucide-react-native';
import { Screen, Card, EmptyState } from '../../components/ui';
import { fetchBrokerEnquiries, replyToEnquiry } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

function EnquiryRow({ item, onReplied }) {
  const [reply, setReply] = useState(item.reply_message || '');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await replyToEnquiry(item.id, reply.trim(), {
        customer_email: item.customer?.email,
        customer_name: item.customer?.full_name,
        property_title: item.property?.title,
      });
      onReplied(item.id, reply.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: '700', color: colors.espresso900 }}>{item.customer?.full_name || 'Customer'}</Text>
      <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>{item.property?.title}</Text>
      <Text style={{ fontSize: 13, color: colors.espresso600 }}>{item.message}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <TextInput
          value={reply}
          onChangeText={setReply}
          placeholder="Write a reply..."
          placeholderTextColor={colors.textMuted}
          style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, backgroundColor: colors.espresso50 }}
        />
        <TouchableOpacity onPress={send} disabled={sending} style={{ backgroundColor: colors.espresso700, padding: 10, borderRadius: 10, opacity: sending ? 0.6 : 1 }}>
          <Send size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
      {item.status === 'replied' ? <Text style={{ fontSize: 11, color: colors.success, marginTop: 6 }}>Replied</Text> : null}
    </Card>
  );
}

export default function BrokerEnquiriesScreen() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchBrokerEnquiries(user.id);
      setEnquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const markReplied = (id, message) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'replied', reply_message: message } : e)));
  };

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900 }}>Enquiries</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.espresso700} />
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="No enquiries yet" />}
          renderItem={({ item }) => <EnquiryRow item={item} onReplied={markReplied} />}
        />
      )}
    </Screen>
  );
}
