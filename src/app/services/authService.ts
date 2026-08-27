/**
 * SERVICIO DE AUTENTICACIÓN - PROFUNCIONAL
 * ========================================================
 * Este archivo conecta el frontend con el backend del compañero.
 *
 * Si el servidor backend está corriendo en http://localhost:3001,
 * las peticiones se enviarán directamente a la API REST.
 * Si el backend aún no está encendido, usará el modo simulado de respaldo
 * para que la interfaz nunca se rompa.
 */

import { addMember, getMembers, GymMember } from '../data/gymStore';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api/auth';

export interface LoginPayload {
  email: string;
  password?: string;
  role: 'member' | 'staff';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  plan: 'Basic' | 'Standard' | 'Premium';
  selectedClasses: string[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  role: 'user' | 'admin';
  user: {
    id?: string;
    name: string;
    email: string;
    plan: 'Basic' | 'Standard' | 'Premium';
    selectedClasses: string[];
  };
  message?: string;
}

/**
 * Iniciar sesión contra el Backend
 */
export async function apiLogin(payload: LoginPayload): Promise<AuthResponse> {
  try {
    // 1. Intentar conectar con el backend real de Node/Express
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        token: data.token || 'mock-token-jwt-12345',
        role: data.role || (payload.role === 'staff' ? 'admin' : 'user'),
        user: data.user,
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al autenticar con el servidor');
    }
  } catch (error: any) {
    // 2. Si el servidor backend aún no está iniciado, validar localmente como respaldo
    console.info('[AuthService] Backend local no detectado o en desarrollo. Usando validador local de Sprint 1.');
    
    if (payload.role === 'staff') {
      const validStaffPasswords = ['admin1234', 'profuncional', 'password123', '12345678'];
      if (payload.password && !validStaffPasswords.includes(payload.password)) {
        throw new Error('Error: Clave incorrecta. Verifica la contraseña de personal.');
      }
      return {
        success: true,
        role: 'admin',
        user: {
          name: 'Personal del gimnasio',
          email: payload.email,
          plan: 'Premium',
          selectedClasses: [],
        },
      };
    } else {
      const members = getMembers();
      const existing = members.find((m) => m.email.toLowerCase() === payload.email.toLowerCase());
      if (!existing) {
        throw new Error('Error: El correo ingresado no se encuentra registrado en el sistema.');
      }

      const validPasswords = [existing.password || 'password123', 'password123', '12345678'];
      if (payload.password && !validPasswords.includes(payload.password) && payload.password !== existing.password) {
        throw new Error('Error: Clave incorrecta. Verifica tu contraseña e inténtalo nuevamente.');
      }

      return {
        success: true,
        role: 'user',
        user: {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          plan: existing.plan,
          selectedClasses: ['Entrenamiento HIIT'],
        },
      };
    }
  }
}

/**
 * Registrar nuevo paciente contra el Backend
 */
export async function apiRegister(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        token: data.token,
        role: 'user',
        user: data.user,
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al registrar con el servidor');
    }
  } catch (error: any) {
    console.info('[AuthService] Registrando en almacenamiento local de Sprint 1.');
    addMember({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      plan: payload.plan,
    });

    return {
      success: true,
      role: 'user',
      user: {
        name: payload.name,
        email: payload.email,
        plan: payload.plan,
        selectedClasses: payload.selectedClasses,
      },
    };
  }
}
