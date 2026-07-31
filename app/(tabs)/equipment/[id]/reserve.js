import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createReservation } from '../../../../lib/api';

const API_URL = 'http://localhost:3001';

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

export default function ReserveScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(startOfDay(new Date()));
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/equipment/${id}`);
      if (!response.ok) throw new Error('Nie udało się pobrać sprzętu');
      const data = await response.json();
      setEquipment(data);
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
    if (!day || !equipment) return false;
    const dayStart = startOfDay(day);
    if (dayStart < today) return true;

    const reservations = equipment.reservations || [];
    const bufferMs = (equipment.bufferDays || 0) * 24 * 60 * 60 * 1000;

    return reservations.some((r) => {
      const rStart = new Date(new Date(r.startDate).getTime() - bufferMs);
      const rEnd = new Date(new Date(r.endDate).getTime() + bufferMs);
      return dayStart >= startOfDay(rStart) && dayStart <= startOfDay(rEnd);
    });
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
    setRangeStart(null);
    setSelectedDay(null);
  }

  async function handleConfirm() {
    if (!rangeStart || !selectedDay) return;

    const start = new Date(Math.min(rangeStart, selectedDay));
    const end = new Date(Math.max(rangeStart, selectedDay));

    try {
      setReservationLoading(true);
      setReservationError(null);

      await createReservation({
        equipmentId: id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      Alert.alert('Sukces', 'Rezerwacja została potwierdzona!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Błąd rezerwacji:', err);
      setReservationError(err.message || 'Nie udało się utworzyć rezerwacji');
    } finally {
      setReservationLoading(false);
    }
  }

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Rezerwacja</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{equipment.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <Pressable onPress={() => changeMonth(-1)} style={styles.monthButton}>
              <Ionicons name="chevron-back" size={18} color="#334155" />
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <Pressable onPress={() => changeMonth(1)} style={styles.monthButton}>
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
              Wybrany zakres: {new Date(Math.min(rangeStart, selectedDay)).toLocaleDateString('pl-PL')}
              {' — '}
              {new Date(Math.max(rangeStart, selectedDay)).toLocaleDateString('pl-PL')}
            </Text>
            <Pressable
              onPress={() => {
                setRangeStart(null);
                setSelectedDay(null);
              }}
            >
              <Text style={styles.clearText}>Wyczyść wybór</Text>
            </Pressable>
          </View>
        )}

        {equipment.bufferDays > 0 && (
          <Text style={styles.bufferNote}>
            Ten sprzęt wymaga {equipment.bufferDays} dni przerwy na przygotowanie po zwrocie.
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {reservationError && (
          <Text style={styles.errorText}>{reservationError}</Text>
        )}
        <Pressable
          style={[
            styles.confirmButton,
            (reservationLoading || !rangeStart || !selectedDay) && styles.confirmButtonDisabled,
          ]}
          disabled={reservationLoading || !rangeStart || !selectedDay}
          onPress={handleConfirm}
        >
          {reservationLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Potwierdź rezerwację</Text>
          )}
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
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  weekRow: { flexDirection: 'row' },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    paddingVertical: 4,
  },
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
  summaryCard: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  summaryText: { fontSize: 14, color: '#334155', marginBottom: 8 },
  clearText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },
  bufferNote: { fontSize: 13, color: '#64748B', marginTop: 16 },
  footer: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9',
    backgroundColor: '#fff',
  },
  confirmButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  confirmButtonDisabled: { backgroundColor: '#CBD5E1' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { 
    fontSize: 13, 
    color: '#EF4444', 
    marginBottom: 12,
    textAlign: 'center',
  },
});