import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Logowanie:', email, password);
    router.replace('/equipment')

    try {
    } catch (error){

    } finally {

    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sprzętownia</Text>
      <Text style={styles.subtitle}>Zaloguj się firmowym adresem e-maill, aby rezerwować sprzęt</Text>

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

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Zaloguj się</Text>
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
  bottomtext:{
    fontSize: 13,
    textAlign: 'center',
  }

});