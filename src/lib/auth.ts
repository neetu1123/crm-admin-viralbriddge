import { authApi } from './api';

const LOGIN_PATH = '/login';

export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function redirectToLogin(): void {
  window.location.replace(LOGIN_PATH);
}

export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // ignore
  }
  clearSession();
  redirectToLogin();
}
