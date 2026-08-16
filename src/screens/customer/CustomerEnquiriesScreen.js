import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { Send } from 'lucide-react-native';
import { Screen, Card, EmptyState } from '../../components/ui';
import { fetchCustomerEnquiries, fetchBrokerEnquiries, replyToEnquiry } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const STATUS_COLORS = { new: colors.warning, replied: colors.success };

function SentEnquiryCard({ item, navigation }) {
  return (
    <TouchableOpacity onPress={() => item.property_id && navigation.navigate('PropertyDetail', { propertyId: item.property_id })}>
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700', color: colors.espresso900, flex: 1 }} numberOfLines={1}>
            {item.property?.title || 'Property'}
          </Text>
          <Text style={{ color: STATUS_COLORS[item.status] || colors.textMuted, fontWeight: '700', fontSize: 11, textTransform: 'uppercase' }}>
            {item.status}
          </Text>
        </View>
        <Text style={{ color: colors.espresso600, marginTop: 6, fontSize: 13 }}>You: {item.message}</Text>
        {item.reply_message ? (
          <View style={{ marginTop: 8, backgroundColor: colors.espresso50, borderRadius: 10, padding: 10 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 2 }}>Reply</Text>
            <Text style={{ fontSize: 13, color: colors.espresso900 }}>{item.reply_message}</Text>
          </View>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

function ReceivedEnquiryCard({ item, onReplied }) {
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

export default function CustomerEnquiriesScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('sent');
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [sentData, receivedData] = await Promise.all([
        fetchCustomerEnquiries(user.id),
        fetchBrokerEnquiries(user.id), // enquiries received on properties this user posted
      ]);
      setSent(sentData);
      setReceived(receivedData);
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
    setReceived((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'replied', reply_message: message } : e)));
  };

  const data = tab === 'sent' ? sent : received;

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900 }}>Enquiries</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => setTab('sent')}
          style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: tab === 'sent' ? colors.espresso700 : colors.espresso50 }}
        >
          <Text style={{ color: tab === 'sent' ? colors.white : colors.espresso600, fontWeight: '700', fontSize: 12 }}>Sent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('received')}
          style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: tab === 'received' ? colors.espresso700 : colors.espresso50 }}
        >
          <Text style={{ color: tab === 'received' ? colors.white : colors.espresso600, fontWeight: '700', fontSize: 12 }}>
            Received{received.length ? ` (${received.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.espresso700} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <EmptyState
              title={tab === 'sent' ? 'No enquiries yet' : 'No enquiries received'}
              subtitle={
                tab === 'sent'
                  ? 'Enquire on a property to start a conversation with the owner.'
                  : "You'll see messages here when someone asks about a property you posted."
              }
            />
          }
          renderItem={({ item }) =>
            tab === 'sent' ? (
              <SentEnquiryCard item={item} navigation={navigation} />
            ) : (
              <ReceivedEnquiryCard item={item} onReplied={markReplied} />
            )
          }
        />
      )}
    </Screen>
  );
}