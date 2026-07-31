import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3001';

const CATEGORY_MAP = { LAPTOP: 'Laptop', PHONE: 'Telefon', CAMERA: 'Aparat', OTHER: 'Inne' };
const STATUS_MAP = { AVAILABLE: 'Dostępny', MAINTENANCE: 'W naprawie', RETIRED: 'Wycofany' };
const STATUS_STYLES = {
  Dostępny: { bg: '#DCFCE7', text: '#166534' },
  'W naprawie': { bg: '#FEF3C7', text: '#92400E' },
  Wycofany: { bg: '#F1F5F9', text: '#64748B' },
};

const SPEC_LABELS = {
  cpu: 'Procesor',
  ram: 'RAM',
  storage: 'Dysk',
  screen: 'Ekran',
  model: 'Model',
  memory: 'Pamięć',
  sensor: 'Matryca',
  lens: 'Obiektyw',
};

function getSpecEntries(equipment) {
  const specObject =
    equipment.laptopSpec || equipment.phoneSpec || equipment.cameraSpec || null;

  if (!specObject) return [];

  return Object.entries(specObject)
    .filter(([key]) => key !== 'id' && key !== 'equipmentId')
    .map(([key, value]) => ({
      label: SPEC_LABELS[key] || key,
      value: String(value),
    }));
}

export default function EquipmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/equipment/${id}`);
      if (!response.ok) throw new Error('Nie udało się pobrać sprzętu');
      const data = await response.json();
      setEquipment({
        ...data,
        categoryLabel: CATEGORY_MAP[data.category] || data.category,
        statusLabel: STATUS_MAP[data.status] || data.status,
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !equipment) {
    return (
      <View style={styles.center}>
        <Text>{error || 'Nie znaleziono sprzętu'}</Text>
      </View>
    );
  }

  const statusStyle = STATUS_STYLES[equipment.statusLabel] || { bg: '#E2E8F0', text: '#334155' };
  const specs = getSpecEntries(equipment);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle} numberOfLines={1}>{equipment.name}</Text>
          <Text style={styles.headerSubtitle}>{equipment.categoryLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {equipment.imageUrl ? (
          <Image source={{ uri: equipment.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.image} />
        )}

        <View style={styles.titleRow}>
          <Text style={styles.title}>{equipment.name}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {equipment.statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="barcode-outline" size={16} color="#64748B" />
          <Text style={styles.metaText}>{equipment.serialNumber}</Text>
        </View>

        {equipment.location && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.metaText}>{equipment.location}</Text>
          </View>
        )}

        {specs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>SPECYFIKACJA</Text>
            <View style={styles.specTable}>
              {specs.map((spec, i) => (
                <View
                  key={spec.label}
                  style={[styles.specRow, i !== specs.length - 1 && styles.specRowBorder]}
                >
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.reserveButton}
          onPress={() => router.push(`/equipment/${equipment.id}/reserve`)}
        >
          <Text style={styles.reserveButtonText}>Zarezerwuj</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  headerSubtitle: { fontSize: 13, color: '#64748B' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginLeft: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  metaText: { fontSize: 14, color: '#64748B' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  specTable: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  specRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  specLabel: { fontSize: 14, color: '#64748B' },
  specValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  reserveButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reserveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});