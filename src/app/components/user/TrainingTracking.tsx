import React from 'react';
import { Calendar, TrendingUp, Dumbbell, Zap } from 'lucide-react';

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: string;
  instructor?: string;
}

export function TrainingTracking() {
  const sessions: WorkoutSession[] = [
    { id: '1', name: 'HIIT Training', date: '2025-01-22', duration: 45, type: 'Group Class', instructor: 'Mike R.' },
    { id: '2', name: 'Morning Yoga', date: '2025-01-22', duration: 60, type: 'Group Class', instructor: 'Sarah K.' },
    { id: '3', name: 'Strength Training', date: '2025-01-21', duration: 90, type: 'Solo Workout' },
    { id: '4', name: 'Morning Yoga', date: '2025-01-20', duration: 60, type: 'Group Class', instructor: 'Sarah K.' },
    { id: '5', name: 'CrossFit', date: '2025-01-20', duration: 60, type: 'Group Class', instructor: 'John D.' },
    { id: '6', name: 'Cardio Session', date: '2025-01-19', duration: 45, type: 'Solo Workout' },
    { id: '7', name: 'Spinning', date: '2025-01-18', duration: 45, type: 'Group Class', instructor: 'Emma L.' },
    { id: '8', name: 'HIIT Training', date: '2025-01-17', duration: 45, type: 'Group Class', instructor: 'Mike R.' },
  ];

  const stats = {
    thisWeek: 5,
    totalHours: 12.5,
    streak: 12,
    avgPerWeek: 4.2,
  };

  const groupByDate = (sessions: WorkoutSession[]) => {
    const grouped: Record<string, WorkoutSession[]> = {};
    sessions.forEach(session => {
      if (!grouped[session.date]) {
        grouped[session.date] = [];
      }
      grouped[session.date].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupByDate(sessions);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Historial de entrenamiento</h1>
        <p className="text-white/60">Sigue tu progreso y tus entrenamientos</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#09C82C]/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#09C82C]" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.thisWeek}</p>
          <p className="text-sm text-white/60">Esta semana</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#09C82C]/20 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-[#09C82C]" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.totalHours}h</p>
          <p className="text-sm text-white/60">Horas totales</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#09C82C]/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#09C82C]" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.streak}</p>
          <p className="text-sm text-white/60">Dias seguidos</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#09C82C]/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#09C82C]" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.avgPerWeek}</p>
          <p className="text-sm text-white/60">Promedio semanal</p>
        </div>
      </div>

      {/* Progress Chart Placeholder */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h3 className="font-semibold mb-4 text-[#F7F7F7]">Actividad semanal</h3>
        <div className="flex items-end gap-2 h-32">
          {[3, 5, 4, 6, 5, 7, 5].map((height, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-[#09C82C]/20 rounded-t-lg hover:bg-[#09C82C]/30 transition-colors" style={{ height: `${height * 14}%` }}>
                <div className="w-full bg-[#09C82C] rounded-t-lg" style={{ height: '100%' }} />
              </div>
              <span className="text-xs text-white/60">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Workout Timeline */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h3 className="font-semibold mb-4 text-[#F7F7F7]">Entrenamientos recientes</h3>
        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([date, daySessions]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-[#09C82C] rounded-full" />
                <p className="font-medium text-[#F7F7F7]">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="ml-5 space-y-3 border-l-2 border-white/10 pl-6">
                {daySessions.map((session) => (
                  <div key={session.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-[#F7F7F7]">{session.name}</h4>
                        <p className="text-sm text-white/60">{session.type === 'Group Class' ? 'Clase grupal' : 'Entrenamiento individual'}</p>
                      </div>
                      <span className="text-sm text-[#09C82C] font-medium">{session.duration} min</span>
                    </div>
                    {session.instructor && (
                      <p className="text-sm text-white/60">Instructor: {session.instructor}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}