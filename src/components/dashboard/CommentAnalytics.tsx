import { BarChart3, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Comment } from '../../types';

interface CommentAnalyticsProps {
  comments: Comment[];
}

interface UserStat {
  userName: string;
  count: number;
  percentage: number;
}

export function CommentAnalytics({ comments }: CommentAnalyticsProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => {
    if (comments.length === 0) return null;

    const userCounts = new Map<string, { name: string; count: number }>();
    for (const c of comments) {
      const existing = userCounts.get(c.userId);
      if (existing) {
        existing.count++;
      } else {
        userCounts.set(c.userId, { name: c.userName, count: 1 });
      }
    }

    const uniqueUsers = userCounts.size;
    const avgPerUser = comments.length / uniqueUsers;

    const topCommenters: UserStat[] = [...userCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((u) => ({
        userName: u.name,
        count: u.count,
        percentage: (u.count / comments.length) * 100,
      }));

    const distribution = { one: 0, low: 0, mid: 0, high: 0 };
    for (const u of userCounts.values()) {
      if (u.count === 1) distribution.one++;
      else if (u.count <= 5) distribution.low++;
      else if (u.count <= 10) distribution.mid++;
      else distribution.high++;
    }

    return { uniqueUsers, avgPerUser, topCommenters, distribution };
  }, [comments]);

  if (!stats) return null;

  return (
    <div className="mb-4 rounded-lg border bg-gray-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-gray-100 rounded-lg"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-700">
            <BarChart3 className="h-4 w-4" />
            <span className="font-medium">統計</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{comments.length} コメント</span>
            <span className="text-gray-300">|</span>
            <span><Users className="inline h-3 w-3 mr-0.5" />{stats.uniqueUsers} 人</span>
            <span className="text-gray-300">|</span>
            <span>平均 {stats.avgPerUser.toFixed(1)} 件/人</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-4">
          {/* Top commenters */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">
              トップコメンター
            </h4>
            <div className="space-y-1.5">
              {stats.topCommenters.map((u, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-5 text-right text-gray-400">{i + 1}.</span>
                  <span className="w-20 truncate text-gray-700">{u.userName}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded"
                      style={{ width: `${u.percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-gray-500">
                    {u.count} 件 ({u.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Participation distribution */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">
              参加者分布
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { label: '1件', value: stats.distribution.one },
                { label: '2-5件', value: stats.distribution.low },
                { label: '6-10件', value: stats.distribution.mid },
                { label: '11件以上', value: stats.distribution.high },
              ].map((d) => (
                <div key={d.label} className="rounded-lg bg-white border p-2">
                  <div className="text-lg font-semibold text-gray-800">
                    {d.value}
                  </div>
                  <div className="text-gray-400">{d.label}</div>
                  <div className="text-gray-400">
                    ({stats.uniqueUsers > 0
                      ? ((d.value / stats.uniqueUsers) * 100).toFixed(0)
                      : 0}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
