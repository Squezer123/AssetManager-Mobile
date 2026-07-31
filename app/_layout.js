import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }}>
     <Stack.Screen name="index"></Stack.Screen>
     <Stack.Screen name="equipment"></Stack.Screen>
     <Stack.Screen name="reservation"></Stack.Screen>
  </Stack>;
}