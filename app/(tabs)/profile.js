import { useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MOCK_USER = {
  name: 'Anna Kowalska',
  email: 'anna.kowalska@firma.pl',
  department: 'Marketing',
  role: 'ADMIN',
};

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const isAdmin = MOCK_USER.role === 'ADMIN';

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(MOCK_USER.name)}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{MOCK_USER.name}</Text>
          <Text style={styles.userEmail}>{MOCK_USER.email}</Text>
        </View>
      </View>

      <View style={styles.optionsCard}>
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="business-outline" size={20} color="#334155" />
            <Text style={styles.optionLabel}>Dział</Text>
          </View>
          <Text style={styles.optionValue}>{MOCK_USER.department}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="notifications-outline" size={20} color="#334155" />
            <Text style={styles.optionLabel}>Przypomnienia o zwrocie</Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
            thumbColor="#fff"
          />
        </View>

        {isAdmin && (
          <>
            <View style={styles.divider} />
            <Pressable style={styles.optionRow} onPress={() => router.push('/admin')}>
              <View style={styles.optionLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#334155" />
                <Text style={styles.optionLabel}>Panel administratora</Text>
              </View>
              <Text style={styles.optionLink}>Otwórz</Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#0F172A" />
        <Text style={styles.logoutText}>Wyloguj się</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  optionsCard: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionLabel: {
    fontSize: 14,
    color: '#0F172A',
  },
  optionValue: {
    fontSize: 14,
    color: '#64748B',
  },
  optionLink: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});