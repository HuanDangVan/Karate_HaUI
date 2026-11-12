import React from 'react';
import { Bell, Calendar, ChevronRight, Tag } from 'lucide-react';
import { AnnouncementItem } from '@/types/dashboard';

interface RecentAnnouncementsProps {
  announcements: AnnouncementItem[];
}

export function RecentAnnouncements({ announcements }: RecentAnnouncementsProps) {
  const getPriorityBadge = (priority: AnnouncementItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-100 text-pink-700 ring-1 ring-pink-200';
      case 'medium':
        return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  };

  const getPriorityLabel = (priority: AnnouncementItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'Ưu tiên cao';
      case 'medium':
        return 'Quan trọng';
      default:
        return 'Thường';
    }
  };

  return (
    <div className="flex flex-col rounded-3xl border border-pink-100/90 bg-white/95 p-6 shadow-xs backdrop-blur-xs">
      <div className="flex items-center justify-between border-b border-pink-50 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
            <Bell className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Thông Báo Karate-HaUI
            </h3>
            <p className="text-xs text-slate-500">
              Cập nhật tin tức, giải đấu, kỳ thi đai và thông báo của CLB
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline">
          Tất cả thông báo <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 flex-1 divide-y divide-pink-50">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="group py-3.5 first:pt-0 last:pb-0 transition-colors hover:bg-pink-50/40 rounded-2xl px-2.5 -mx-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {getPriorityLabel(item.priority)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                    <Tag className="h-3 w-3 text-sky-400" />
                    {item.category}
                  </span>
                  {!item.read && (
                    <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" title="Chưa đọc" />
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-800 group-hover:text-pink-600 transition-colors">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-slate-400">
                <div className="flex items-center gap-1 text-slate-500">
                  <Calendar className="h-3 w-3 text-pink-400" />
                  <span>{item.date}</span>
                </div>
                <span className="text-[11px] font-medium text-sky-700">{item.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
