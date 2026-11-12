import React from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight, Sparkles } from 'lucide-react';
import { UpcomingSession } from '@/types/dashboard';

interface UpcomingScheduleProps {
  sessions: UpcomingSession[];
}

export function UpcomingSchedule({ sessions }: UpcomingScheduleProps) {
  const getCategoryBadge = (category: UpcomingSession['category']) => {
    switch (category) {
      case 'Kumite':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Kata':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Cơ bản':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Nâng cao':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col rounded-3xl border border-pink-100/90 bg-white/95 p-6 shadow-xs backdrop-blur-xs">
      <div className="flex items-center justify-between border-b border-pink-50 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
            <Calendar className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Lịch Tập Sắp Diễn Ra — Karate-HaUI
            </h3>
            <p className="text-xs text-slate-500">
              Các ca tập tại Chùa Tu Hoàng (cách ĐH Công Nghiệp 900m)
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline">
          Xem toàn bộ lịch <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-pink-50 bg-gradient-to-r from-pink-50/30 via-white to-sky-50/30 p-4 transition-all duration-200 hover:border-pink-200 hover:shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getCategoryBadge(
                    session.category
                  )}`}
                >
                  {session.category}
                </span>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-pink-600 transition-colors">
                  {session.className}
                </h4>
                <span className="text-xs text-slate-400">({session.date})</span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-pink-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{session.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-pink-400" />
                  <span>{session.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <User className="h-3.5 w-3.5 text-sky-400" />
                  <span>{session.instructor}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 border-pink-50 pt-2 sm:pt-0">
              <div className="text-xs text-slate-500">
                Dự kiến: <span className="font-bold text-slate-800">{session.expectedStudents} học viên</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-[11px] font-bold text-pink-700 ring-1 ring-pink-200">
                Sắp diễn ra
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
