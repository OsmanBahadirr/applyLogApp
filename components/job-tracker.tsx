"use client";

import { useEffect, useMemo, useState } from 'react';
import { ApplicationForm } from './application-form';
import { StatusBadge } from './status-badge';
import { STATUS_OPTIONS, WORK_TYPE_OPTIONS, type Application, type ApplicationStatus, type WorkType } from '@/lib/types';

type FilterValue = 'All' | ApplicationStatus | WorkType;

const STATUS_ORDER: ApplicationStatus[] = [
  'Accepted',
  'Test Phase',
  'Interviewing',
  'Applied',
  'No Response',
  'Rejected',
];

const statusRank = new Map(STATUS_ORDER.map((status, index) => [status, index]));

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

export default function JobTracker({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('All');
  const [workFilter, setWorkFilter] = useState<FilterValue>('All');
  const [editing, setEditing] = useState<Application | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetch('/api/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applications),
    }).catch(() => {
      // Keep the UI responsive even if persistence fails.
    });
  }, [applications]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...applications].sort((a, b) => {
      const statusDiff = (statusRank.get(a.status) ?? 999) - (statusRank.get(b.status) ?? 999);
      if (statusDiff !== 0) return statusDiff;

      return a.company.localeCompare(b.company);
    }).filter((item) => {
      const matchesSearch = !query || item.company.toLowerCase().includes(query) || item.program.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesWork = workFilter === 'All' || item.workType === workFilter;
      return matchesSearch && matchesStatus && matchesWork;
    });
  }, [applications, search, statusFilter, workFilter]);

  const summary = useMemo(() => {
    const count = (status: ApplicationStatus) => applications.filter((item) => item.status === status).length;
    return {
      total: applications.length,
      interviewing: count('Interviewing'),
      testPhase: count('Test Phase'),
      rejected: count('Rejected'),
      accepted: count('Accepted'),
      noResponse: count('No Response'),
    };
  }, [applications]);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const saveApplication = (payload: Omit<Application, 'id'>) => {
    if (editing) {
      setApplications((current) => current.map((item) => (item.id === editing.id ? { ...editing, ...payload } : item)));
    } else {
      setApplications((current) => {
        const nextId = Math.max(0, ...current.map((item) => item.id)) + 1;
        return [{ id: nextId, ...payload }, ...current];
      });
    }
    setIsFormOpen(false);
    setEditing(null);
  };

  const removeApplication = (id: number) => {
    setApplications((current) => current.filter((item) => item.id !== id));
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-600">Job tracker</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Track every application in one polished workspace.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A dashboard for scanning, filtering, editing, and managing your job search with minimal friction.
            </p>
          </div>

          <button onClick={openCreate} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800">
            Add application
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Total applications" value={summary.total} />
          <StatCard label="Test phase" value={summary.testPhase} />
          <StatCard label="Interviewing" value={summary.interviewing} />
          <StatCard label="Rejected" value={summary.rejected} />
          <StatCard label="Accepted" value={summary.accepted} />
          <StatCard label="No response" value={summary.noResponse} />
        </div>

        <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or program"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FilterValue)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <select value={workFilter} onChange={(e) => setWorkFilter(e.target.value as FilterValue)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
            <option value="All">All work types</option>
            {WORK_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[1.2fr_1.2fr_0.9fr_0.9fr_1fr_auto] gap-4 border-b border-slate-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <div>Company</div>
            <div>Program</div>
            <div>Work type</div>
            <div>Status</div>
            <div>Notes</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <div className="px-6 py-14 text-center text-sm text-slate-500">No applications match the current filters.</div>
            ) : filtered.map((item) => (
              <article key={item.id} className="grid gap-3 px-5 py-5 md:grid-cols-[1.2fr_1.2fr_0.9fr_0.9fr_1fr_auto] md:items-center md:gap-4">
                <div>
                  <div className="font-medium text-slate-950">{item.company}</div>
                  <div className="mt-1 text-sm text-slate-500 md:hidden">{item.program}</div>
                </div>
                <div className="hidden text-sm text-slate-700 md:block">{item.program}</div>
                <div className="text-sm text-slate-700">{item.workType}</div>
                <div><StatusBadge status={item.status} /></div>
                <details className="group rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <summary className="cursor-pointer list-none font-medium text-slate-700">
                    View notes
                  </summary>
                  <p className="mt-2 leading-6 text-slate-600">{item.notes || 'No notes yet.'}</p>
                </details>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(item); setIsFormOpen(true); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Edit
                  </button>
                  <button onClick={() => removeApplication(item.id)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ApplicationForm
        open={isFormOpen}
        initial={editing}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
        }}
        onSave={saveApplication}
      />
    </main>
  );
}
