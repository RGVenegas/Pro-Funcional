import { today } from './dates';
import { addActivity } from './gymStore';

export interface HealthMetrics {
  weight: number; // Peso (kg)
  heightCm?: number; // Altura (cm) para cálculo automático
  bmi: number; // IMC
  bodyFat: number; // % Grasa corporal
  bmr: number; // Tasa Metabólica Basal (kcal)
  bodyAge: number; // Edad corporal (años)
}

export interface BaseExercisesMetrics {
  squat: number; // Sentadilla (kg)
  benchPress: number; // Press banca (kg)
  latPulldown: number; // Jalón dorsal (kg)
  plank: number; // Plancha (segundos)
  lunges: number; // Estocadas (kg)
  barHang: number; // Suspensión en barra (segundos)
  dips: number; // Flexiones paralelas / fondos (reps)
  pushups: number; // Flexiones suelo (reps)
  crunch: number; // Abdominales crunch (reps)
  deadlift: number; // Peso muerto (kg)
}

export interface ProgressAssessment {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  evaluator: string; // Kinesiólogo / Entrenador
  health: HealthMetrics;
  exercises: BaseExercisesMetrics;
  notes?: string;
}

export type ExerciseKey = keyof BaseExercisesMetrics;
export type HealthMetricKey = keyof HealthMetrics;

export interface ExerciseMeta {
  key: ExerciseKey;
  label: string;
  unit: string;
  category: 'Tren Inferior' | 'Tren Superior' | 'Core & Estabilidad' | 'Cadena Posterior';
  target: string;
}

export const BASE_EXERCISES_INFO: ExerciseMeta[] = [
  { key: 'squat', label: 'Sentadilla (peso)', unit: 'kg', category: 'Tren Inferior', target: 'Fuerza de cuádriceps, glúteos y estabilidad de rodilla' },
  { key: 'benchPress', label: 'Press Banca (peso)', unit: 'kg', category: 'Tren Superior', target: 'Fuerza de empuje horizontal pectoral y tríceps' },
  { key: 'latPulldown', label: 'Jalón con Barra / Dorsal (peso)', unit: 'kg', category: 'Tren Superior', target: 'Fuerza de tracción vertical, dorsal ancho y bíceps' },
  { key: 'plank', label: 'Plancha (tiempo)', unit: 'seg', category: 'Core & Estabilidad', target: 'Resistencia isométrica de core y protección lumbar' },
  { key: 'lunges', label: 'Estocadas (peso)', unit: 'kg', category: 'Tren Inferior', target: 'Fuerza unilateral, propiocepción y equilibrio dinámico' },
  { key: 'barHang', label: 'Colgado en Barra (tiempo)', unit: 'seg', category: 'Tren Superior', target: 'Fuerza de prensión, antebrazo y descompresión espinal' },
  { key: 'dips', label: 'Push Ups Paralelas / Fondos (u)', unit: 'u', category: 'Tren Superior', target: 'Fuerza y potencia en tríceps, pectoral inferior y hombros' },
  { key: 'pushups', label: 'Push Ups Piso (u)', unit: 'u', category: 'Tren Superior', target: 'Resistencia muscular de empuje y estabilización escapular' },
  { key: 'crunch', label: 'Crunch Abdominal (u)', unit: 'u', category: 'Core & Estabilidad', target: 'Resistencia muscular del recto abdominal y control pélvico' },
  { key: 'deadlift', label: 'Peso Muerto (u/kg)', unit: 'kg', category: 'Cadena Posterior', target: 'Potencia de isquiotibiales, glúteo mayor y erectores espinales' },
];

export interface HealthMetricMeta {
  key: 'weight' | 'bmi' | 'bodyFat' | 'bmr' | 'bodyAge';
  label: string;
  unit: string;
  target: string;
  referenceNormal: string;
}

export const HEALTH_METRICS_INFO: HealthMetricMeta[] = [
  { key: 'weight', label: 'Peso Corporal', unit: 'kg', target: 'Masa corporal total en báscula', referenceNormal: 'Según contextura y composición' },
  { key: 'bmi', label: 'IMC (Índice Masa Corporal)', unit: 'kg/m²', target: 'Relación peso / estatura al cuadrado', referenceNormal: 'Rango saludable: 18.5 a 24.9 kg/m²' },
  { key: 'bodyFat', label: '% Grasa Corporal', unit: '%', target: 'Porcentaje de masa adiposa bioimpedancia', referenceNormal: 'Hombres: 14-20% · Mujeres: 20-28%' },
  { key: 'bmr', label: 'Tasa Metabólica Basal (TMB)', unit: 'kcal', target: 'Gasto calórico mínimo en reposo por día', referenceNormal: '1.400 - 1.950 kcal/día' },
  { key: 'bodyAge', label: 'Edad Corporal', unit: 'años', target: 'Edad biológica calculada según metabolismo y grasa', referenceNormal: 'Menor o igual a la edad cronológica' },
];

const PROGRESS_KEY = 'profuncional-member-progress-v1';
const PROGRESS_EVENT = 'profuncional-progress-changed';

// Initial realistic assessments for Juan Perez (member 1) and other members
const INITIAL_ASSESSMENTS: ProgressAssessment[] = [
  {
    id: 'prog-1-1',
    memberId: '1',
    date: '2024-11-15',
    evaluator: 'Klgo. Andrés Morales',
    health: {
      weight: 84.5,
      heightCm: 178,
      bmi: 26.7,
      bodyFat: 23.8,
      bmr: 1780,
      bodyAge: 38,
    },
    exercises: {
      squat: 50,
      benchPress: 45,
      latPulldown: 40,
      plank: 35,
      lunges: 20,
      barHang: 25,
      dips: 4,
      pushups: 14,
      crunch: 22,
      deadlift: 60,
    },
    notes: 'Evaluación inicial de ingreso. Molestia leve en rodilla derecha al bajar en sentadilla.',
  },
  {
    id: 'prog-1-2',
    memberId: '1',
    date: '2024-12-18',
    evaluator: 'Klgo. Andrés Morales',
    health: {
      weight: 82.8,
      heightCm: 178,
      bmi: 26.1,
      bodyFat: 21.9,
      bmr: 1795,
      bodyAge: 35,
    },
    exercises: {
      squat: 65,
      benchPress: 55,
      latPulldown: 50,
      plank: 50,
      lunges: 28,
      barHang: 38,
      dips: 8,
      pushups: 20,
      crunch: 30,
      deadlift: 75,
    },
    notes: 'Mes 1 de readaptación. Descenso de grasa corporal y notable aumento de tolerancia en tren superior.',
  },
  {
    id: 'prog-1-3',
    memberId: '1',
    date: '2025-01-20',
    evaluator: 'Prof. Carlos Rivera',
    health: {
      weight: 81.2,
      heightCm: 178,
      bmi: 25.6,
      bodyFat: 19.4,
      bmr: 1815,
      bodyAge: 31,
    },
    exercises: {
      squat: 80,
      benchPress: 65,
      latPulldown: 60,
      plank: 75,
      lunges: 36,
      barHang: 55,
      dips: 12,
      pushups: 28,
      crunch: 42,
      deadlift: 95,
    },
    notes: 'Mes 2. Excelente progreso en los 10 ejercicios base. Sentadilla y peso muerto sin dolor articular.',
  },
  // Camila Gonzalez (member 2)
  {
    id: 'prog-2-1',
    memberId: '2',
    date: '2024-12-01',
    evaluator: 'Klgo. Andrés Morales',
    health: {
      weight: 64.0,
      heightCm: 165,
      bmi: 23.5,
      bodyFat: 25.5,
      bmr: 1420,
      bodyAge: 30,
    },
    exercises: {
      squat: 35,
      benchPress: 25,
      latPulldown: 30,
      plank: 40,
      lunges: 16,
      barHang: 20,
      dips: 3,
      pushups: 10,
      crunch: 25,
      deadlift: 45,
    },
    notes: 'Ingreso post-evaluación kinésica.',
  },
  {
    id: 'prog-2-2',
    memberId: '2',
    date: '2025-01-18',
    evaluator: 'Prof. Carlos Rivera',
    health: {
      weight: 62.5,
      heightCm: 165,
      bmi: 23.0,
      bodyFat: 23.2,
      bmr: 1445,
      bodyAge: 27,
    },
    exercises: {
      squat: 45,
      benchPress: 32,
      latPulldown: 38,
      plank: 65,
      lunges: 22,
      barHang: 35,
      dips: 6,
      pushups: 16,
      crunch: 36,
      deadlift: 60,
    },
    notes: 'Excelente adherencia y mejora en resistencia de plancha y flexiones.',
  },
];

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getAllProgressAssessments(): ProgressAssessment[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(INITIAL_ASSESSMENTS));
      return INITIAL_ASSESSMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ASSESSMENTS;
  }
}

export function getMemberProgressAssessments(memberIdOrName: string): ProgressAssessment[] {
  const all = getAllProgressAssessments();
  const search = memberIdOrName.toLowerCase();
  return all
    .filter((a) => a.memberId === memberIdOrName || a.memberId === search)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

export function saveAllProgressAssessments(items: ProgressAssessment[]) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function subscribeToProgress(cb: () => void) {
  window.addEventListener(PROGRESS_EVENT, cb);
  return () => window.removeEventListener(PROGRESS_EVENT, cb);
}

export function addProgressAssessment(
  assessment: Omit<ProgressAssessment, 'id'>,
  memberName?: string
): ProgressAssessment {
  const all = getAllProgressAssessments();
  const created: ProgressAssessment = {
    ...assessment,
    id: `prog-${Date.now().toString(36)}`,
  };

  all.push(created);
  saveAllProgressAssessments(all);

  addActivity({
    name: memberName || 'Alumno',
    action: `registró nuevo test físico: Sentadilla ${created.exercises.squat}kg, Press banca ${created.exercises.benchPress}kg, Peso ${created.health.weight}kg`,
  });

  return created;
}

export function deleteProgressAssessment(id: string): boolean {
  const all = getAllProgressAssessments();
  const next = all.filter((a) => a.id !== id);
  if (next.length !== all.length) {
    saveAllProgressAssessments(next);
    return true;
  }
  return false;
}
