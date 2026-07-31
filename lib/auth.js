import * as SecureStore from 'expo-secure-store';

export const API_URL = 'http://localhost:3001'; 

const TOKEN_KEY = 'accessToken';

export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Nieprawidłowy email lub hasło');
  }

  await saveToken(data.accessToken);
  return data;
}

export async function getCurrentUser() {
    const token = await getToken();
  
    if (!token) {
      throw new Error('Brak tokena — użytkownik niezalogowany');
    }
  
    const response = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!response.ok) {
      throw new Error('Nie udało się pobrać danych użytkownika');
    }
  
    return response.json();
  }
  
  export async function logout() {
    await removeToken();
  }