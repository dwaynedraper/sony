"use client";

import { useState, useEffect } from "react";


interface StoreSummary {
  id: string;
  nickname: string;
  address: string;
  ownerId: string;
  issueCount: number;
  updatedAt: string;
}

/** Simple native relative time formatter */
function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default function AllIssuesPage() {
  const [summaries, setSummaries] = useState<StoreSummary[]>([]);
  const [selected, setSelected] = useState<StoreSummary | null>(null);
  const [details, setDetails] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/all-issues");
        if (res.ok) {
          const data = await res.json();
          setSummaries(data);
        }
      } catch (err) {
        console.error("Failed to load summaries:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRowClick = async (s: StoreSummary) => {
    setSelected(s);
    setDetailLoading(true);
    setDetails(null);
    try {
      const res = await fetch(`/api/admin/store-details?storeId=${s.id}&ownerId=${s.ownerId}`);
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
      }
    } catch (err) {
      console.error("Failed to load details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Management Overview</h1>
          <p className="mt-1 text-text-secondary">Summary of all camera issues across all territory stores.</p>
        </header>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">
          {/* Table Side */}
          <div className="rounded-2xl border border-border bg-surface/50 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/80">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Store</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Issues</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-text-secondary animate-pulse">
                        Fetching latest territory data...
                      </td>
                    </tr>
                  ) : summaries.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-text-secondary">
                        No issues reported yet.
                      </td>
                    </tr>
                  ) : (
                    summaries.map((s) => (
                      <tr 
                        key={`${s.ownerId}-${s.id}`} 
                        onClick={() => handleRowClick(s)}
                        className={`group cursor-pointer transition-colors hover:bg-surface-hover ${selected?.id === s.id && selected?.ownerId === s.ownerId ? 'bg-surface-hover' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{s.nickname || `BBUY${s.id}`}</div>
                          <div className="text-xs text-text-secondary">{s.id} — {s.address}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.issueCount > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                            {s.issueCount} {s.issueCount === 1 ? 'issue' : 'issues'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {timeAgo(new Date(s.updatedAt))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Side */}
          <aside className="sticky top-24">
            {selected ? (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-1">{selected.nickname || `BBUY${selected.id}`}</h2>
                <p className="text-xs text-text-muted mb-6 uppercase tracking-widest font-semibold">Detailed Issue Report</p>

                {detailLoading ? (
                  <div className="py-12 text-center text-text-secondary animate-pulse text-sm">Loading details...</div>
                ) : details && Object.keys(details).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(details).map(([name, issues]: [string, any]) => (
                      <div key={name} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="font-bold text-sm mb-2">{name}</div>
                        <div className="flex flex-wrap gap-2">
                          {issues.alarm && <Tag color="red">Alarm</Tag>}
                          {issues.noPower && <Tag color="red">No Power</Tag>}
                          {issues.broken && <Tag color="red">Broken</Tag>}
                          {issues.missing && <Tag color="red">Missing</Tag>}
                          {issues.other && (
                            <div className="w-full mt-1 text-xs text-text-secondary italic">
                              "{issues.other}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-text-secondary text-sm bg-surface-hover rounded-xl border border-dashed border-border">
                    No active issues found for this store.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-text-muted text-sm">
                Select a store to view its running tally of issues.
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: 'red' | 'green' }) {
  const colors = {
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[color]}`}>
      {children}
    </span>
  );
}
