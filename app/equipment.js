import { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Wszystkie', 'Laptop', 'Telefon', 'Aparat'];
const STATUSES = ['Każdy status', 'Dostępny', 'W naprawie', 'Wycofany'];

const STATUS_STYLES = {
  Dostępny: { bg: '#DCFCE7', text: '#166534' },
  'W naprawie': { bg: '#FEF3C7', text: '#92400E' },
  Wycofany: { bg: '#F1F5F9', text: '#64748B' },
};

const MOCK_EQUIPMENT = [
  { id: '1', name: 'MacBook Pro 14"', category: 'Laptop', sn: 'SN-8814-A', status: 'Dostępny' },
  { id: '2', name: 'Dell Latitude 7440', category: 'Laptop', sn: 'SN-2231-C', status: 'W naprawie' },
  { id: '3', name: 'iPhone 15 Pro', category: 'Telefon', sn: 'SN-5590-B', status: 'Dostępny' },
  { id: '4', name: 'Samsung Galaxy S23', category: 'Telefon', sn: 'SN-1042-D', status: 'Wycofany' },
  { id: '5', name: 'Sony Alpha A7 IV', category: 'Aparat', sn: 'SN-7781-E', status: 'Dostępny' },
  { id: '6', name: 'Canon EOS R6', category: 'Aparat', sn: 'SN-4420-F', status: 'Dostępny' },
];

export default function EquipmentScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Wszystkie');
  const [status, setStatus] = useState('Każdy status');

  const filtered = MOCK_EQUIPMENT.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Wszystkie' || item.category === category;
    const matchesStatus = status === 'Każdy status' || item.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sprzęt</Text>
        <Text style={styles.subtitle}>{MOCK_EQUIPMENT.length} pozycji w katalogu</Text>
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
            <Text style={[styles.pillText, category === item && styles.pillTextActive]} numberOfLines={1}>
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
            <Text style={[styles.pillText, status === item && styles.pillTextActive]} numberOfLines={1}>
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
          const statusStyle = STATUS_STYLES[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.thumbnail} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {item.category} · {item.sn}
                </Text>
                <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
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
    flexGrow: 0,
  },
  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
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
    minHeight: 100, 
    padding: 20,
    gap: 12,
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
    shadowOffset: { width: 0, height: 2 },
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