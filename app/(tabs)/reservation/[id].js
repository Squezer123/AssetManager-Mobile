import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyReservations, editReservation } from '../../../lib/api';

const MONTH_NAMES = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];
const DAY_NAMES = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function EditReservationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [reservation, setReservation] = useState(null);
  const [otherReservations, setOtherReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(startOfDay(new Date()));
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const all = await getMyReservations();
      const current = all.find((r) => r.id === id);

      if (!current) {
        throw new Error('Rezerwacja nie znaleziona');
      }
      if (new Date(current.startDate) <= new Date()) {
        throw new Error('Ta rezerwacja już się rozpoczęła i nie można zmienić jej terminu');
      }

      setReservation(current);
      setCurrentMonth(startOfDay(current.startDate));
      setRangeStart(startOfDay(current.startDate).getTime());
      setSelectedDay(startOfDay(current.endDate).getTime());
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = useMemo(() => startOfDay(new Date()), []);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [currentMonth]);

  function isDayFullyBooked(day) {
    if (!day || !reservation) return false;
    const dayStart = startOfDay(day);
    if (dayStart < today) return true;
    return false; 
  }

  function isDayInSelectedRange(day) {
    if (!rangeStart || !selectedDay) return false;
    const d = startOfDay(day).getTime();
    return d >= Math.min(rangeStart, selectedDay) && d <= Math.max(rangeStart, selectedDay);
  }

  function handleDayClick(day) {
    if (!day || isDayFullyBooked(day)) return;
    if (!rangeStart) {
      setRangeStart(startOfDay(day).getTime());
      setSelectedDay(startOfDay(day).getTime());
    } else {
      setSelectedDay(startOfDay(day).getTime());
    }
  }

  function changeMonth(delta) {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  const handleSave = async () => {
    if (!rangeStart || !selectedDay) return;
    const start = new Date(Math.min(rangeStart, selectedDay));
    const end = new Date(Math.max(rangeStart, selectedDay));

    try {
      setSubmitting(true);
      await editReservation(id, { startDate: start.toISOString(), endDate: end.toISOString() });
      router.back();
    } catch (err) {
      Alert.alert('Nie udało się zapisać zmian', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !reservation) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Nie znaleziono rezerwacji'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Wróć</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Zmień termin</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{reservation.equipment?.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <Pressable onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={18} color="#334155" />
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <Pressable onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={18} color="#334155" />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {DAY_NAMES.map((d) => (
              <Text key={d} style={styles.weekDayLabel}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, i) => {
              if (!day) return <View key={i} style={styles.dayCell} />;

              const booked = isDayFullyBooked(day);
              const isSelected =
                selectedDay === startOfDay(day).getTime() || isDayInSelectedRange(day);

              return (
                <Pressable
                  key={i}
                  disabled={booked}
                  onPress={() => handleDayClick(day)}
                  style={[
                    styles.dayCell,
                    booked && styles.dayCellBooked,
                    isSelected && styles.dayCellSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      booked && styles.dayCellTextBooked,
                      isSelected && styles.dayCellTextSelected,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {rangeStart && selectedDay && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              Nowy zakres: {new Date(Math.min(rangeStart, selectedDay)).toLocaleDateString()}
              {' — '}
              {new Date(Math.max(rangeStart, selectedDay)).toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
          disabled={submitting}
          onPress={handleSave}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Zapisz zmiany</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  errorText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 12 },
  backLink: { padding: 8 },
  backLinkText: { color: '#0F172A', fontWeight: '600' },
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
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
  },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monthTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  weekRow: { flexDirection: 'row' },
  weekDayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: '#94A3B8', paddingVertical: 4 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  dayCellBooked: { backgroundColor: '#F8FAFC' },
  dayCellSelected: { backgroundColor: '#0F172A' },
  dayCellText: { fontSize: 14, color: '#334155' },
  dayCellTextBooked: { color: '#CBD5E1' },
  dayCellTextSelected: { color: '#fff', fontWeight: '600' },
  summaryCard: { marginTop: 16, padding: 14, backgroundColor: '#F8FAFC', borderRadius: 12 },
  summaryText: { fontSize: 14, color: '#334155' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  saveButton: { backgroundColor: '#0F172A', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});