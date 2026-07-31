import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyReservations, cancelReservation, returnReservation } from '../../lib/api';

const CATEGORY_MAP = { LAPTOP: 'Laptop', PHONE: 'Telefon', CAMERA: 'Aparat', OTHER: 'Inne' };

const STATUS_LABELS = {
  ACTIVE: 'Aktywna',
  CANCELLED: 'Anulowana',
  RETURNED: 'Zwrócona',
};

const STATUS_STYLES = {
  Aktywna: { bg: '#DCFCE7', text: '#166534' },
  Anulowana: { bg: '#FEE2E2', text: '#991B1B' },
  Zwrócona: { bg: '#F1F5F9', text: '#64748B' },
};

const MONTH_ABBR = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
];

function formatDate(dateString) {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ReservationsScreen() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [])
  );

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (id) => {
    Alert.alert('Anulować rezerwację?', 'Tej akcji nie można cofnąć.', [
      { text: 'Nie', style: 'cancel' },
      {
        text: 'Anuluj rezerwację',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoadingId(id);
            await cancelReservation(id);
            await fetchReservations();
          } catch (err) {
            Alert.alert('Nie udało się anulować', err.message);
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  };

  const handleReturn = async (id) => {
    try {
      setActionLoadingId(id);
      await returnReservation(id);
      await fetchReservations();
    } catch (err) {
      Alert.alert('Nie udało się oznaczyć zwrotu', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  const active = reservations.filter((r) => r.status === 'ACTIVE');
  const history = reservations.filter((r) => r.status !== 'ACTIVE');

  const renderCard = (item, showActions) => {
    const statusLabel = STATUS_LABELS[item.status] || item.status;
    const statusStyle = STATUS_STYLES[statusLabel] || { bg: '#E2E8F0', text: '#334155' };
    const categoryLabel = CATEGORY_MAP[item.equipment?.category] || item.equipment?.category;
    const isActing = actionLoadingId === item.id;

    return (
      <View key={item.id} style={styles.card}>
        <Pressable
          style={styles.cardTop}
          onPress={() => router.push(`/equipment/${item.equipment?.id}`)}
        >
          {item.equipment?.imageUrl ? (
            <Image source={{ uri: item.equipment.imageUrl }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnail} />
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.equipment?.name}</Text>
            <Text style={styles.cardSubtitle}>{categoryLabel}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.dateText}>
                {formatDate(item.startDate)} – {formatDate(item.endDate)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusLabel}</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </Pressable>

        {showActions && (
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => handleCancel(item.id)}
              disabled={isActing}
            >
              <Text style={styles.cancelButtonText}>Anuluj</Text>
            </Pressable>
            <Pressable
              style={styles.returnButton}
              onPress={() => handleReturn(item.id)}
              disabled={isActing}
            >
              {isActing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.returnButtonText}>Zwróć</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={[]}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Moje rezerwacje</Text>
          <Text style={styles.subtitle}>
            {active.length} aktywnych · {history.length} w historii
          </Text>

          {active.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>AKTYWNE</Text>
              {active.map((item) => renderCard(item, true))}
            </>
          )}

          {history.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>HISTORIA</Text>
              {history.map((item) => renderCard(item, false))}
            </>
          )}

          {reservations.length === 0 && (
            <Text style={styles.emptyText}>Nie masz jeszcze żadnych rezerwacji.</Text>
          )}
        </>
      }
      renderItem={null}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2, marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  cardSubtitle: { fontSize: 13, color: '#64748B' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dateText: { fontSize: 13, color: '#64748B' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  returnButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  returnButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyText: { fontSize: 14, color: '#64748B', marginTop: 20, textAlign: 'center' },
});