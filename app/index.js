import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      router.replace('/(tabs)/equipment');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sprzętownia</Text>
      <Text style={styles.subtitle}>Zaloguj się firmowym adresem e-maill, aby rezerwować sprzęt</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Zaloguj się</Text>
        )}
      </Pressable>

      <Text style={styles.bottomtext}>Nie masz konta? Poproś administratora o pomoc.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 32,
    textAlign: 'left',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#111',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomtext: {
    fontSize: 13,
    textAlign: 'center',
  },
});