import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

  function handleConfirm() {
    if (!rangeStart || !selectedDay) return;
    const start = new Date(Math.min(rangeStart, selectedDay));
    const end = new Date(Math.max(rangeStart, selectedDay));

    console.log('Rezerwacja:', { equipmentId: id, startDate: start, endDate: end });
  }

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !equipment) {
    return (
      <View>
        <Text>{error || 'Nie znaleziono sprzętu'}</Text>
      </View>
    );
  }

  return (
    <View>
      <View>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </Pressable>
        <View>
          <Text>Rezerwacja</Text>
          <Text numberOfLines={1}>{equipment.name}</Text>
        </View>
      </View>

      <ScrollView>
        <View>
          <View>
            <Pressable onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={18} />
            </Pressable>
            <Text>
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <Pressable onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={18} />
            </Pressable>
          </View>

          <View>
            {DAY_NAMES.map((d) => (
              <Text key={d}>{d}</Text>
            ))}
          </View>

          <View>
            {days.map((day, i) => {
              if (!day) return <View key={i} />;

              const booked = isDayFullyBooked(day);
              const isSelected =
                selectedDay === startOfDay(day).getTime() || isDayInSelectedRange(day);

              return (
                <Pressable key={i} disabled={booked} onPress={() => handleDayClick(day)}>
                  <Text>{day.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {rangeStart && selectedDay && (
          <View>
            <Text>
              Wybrany zakres: {new Date(Math.min(rangeStart, selectedDay)).toLocaleDateString()}
              {' — '}
              {new Date(Math.max(rangeStart, selectedDay)).toLocaleDateString()}
            </Text>
            <Pressable
              onPress={() => {
                setRangeStart(null);
                setSelectedDay(null);
              }}
            >
              <Text>Wyczyść wybór</Text>
            </Pressable>
          </View>
        )}

        {equipment.bufferDays > 0 && (
          <Text>
            Ten sprzęt wymaga {equipment.bufferDays} dni przerwy na przygotowanie po zwrocie.
          </Text>
        )}
      </ScrollView>

      <View>
        <Pressable disabled={!rangeStart || !selectedDay} onPress={handleConfirm}>
          <Text>Potwierdź rezerwację</Text>
        </Pressable>
      </View>
    </View>
  );
}