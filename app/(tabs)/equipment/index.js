import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3001'; 

const CATEGORIES = ['Wszystkie', 'Laptop', 'Telefon', 'Aparat', 'Inne'];

const STATUSES = ['Każdy status', 'Dostępny', 'W naprawie', 'Wycofany'];

const CATEGORY_MAP = {
  LAPTOP: 'Laptop',
  PHONE: 'Telefon',
  CAMERA: 'Aparat',
  OTHER: 'Inne',
};

const STATUS_MAP = {
  AVAILABLE: 'Dostępny',
  MAINTENANCE: 'W naprawie',
  RETIRED: 'Wycofany',
};

const STATUS_STYLES = {
  Dostępny: { bg: '#DCFCE7', text: '#166534' },
  'W naprawie': { bg: '#FEF3C7', text: '#92400E' },
  Wycofany: { bg: '#F1F5F9', text: '#64748B' },
};

export default function EquipmentScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Wszystkie');
  const [status, setStatus] = useState('Każdy status');

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/equipment`);

      if (!response.ok) {
        throw new Error('Nie udało się pobrać sprzętu');
      }

      const data = await response.json();

      const mapped = data.map((item) => ({
        ...item,
        category: CATEGORY_MAP[item.category] || item.category,
        status: STATUS_MAP[item.status] || item.status,
      }));

      setEquipment(mapped);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Wszystkie' || item.category === category;
    const matchesStatus = status === 'Każdy status' || item.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sprzęt</Text>
        <Text style={styles.subtitle}>{equipment.length} pozycji w katalogu</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj sprzętu..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.pillRow}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setCategory(item)}
            style={[styles.pill, category === item && styles.pillActive]}
          >
            <Text style={[styles.pillText, category === item && styles.pillTextActive]}>
              {item}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STATUSES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.pillRow}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setStatus(item)}
            style={[styles.pill, status === item && styles.pillActive]}
          >
            <Text style={[styles.pillText, status === item && styles.pillTextActive]}>
              {item}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const statusStyle = STATUS_STYLES[item.status] || { bg: '#E2E8F0', text: '#334155' };

          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/equipment/${item.id}`)}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnail} />
              )}

              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {item.category}
                </Text>

                <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },

  pillRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },

  pill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
  },

  pillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },

  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },

  pillTextActive: {
    color: '#fff',
  },

  list: {
    padding: 20,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },

  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});