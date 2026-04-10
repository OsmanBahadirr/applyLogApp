"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
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

const STAT_CARD_STYLES: Record<string, string> = {
  'Total applications': 'border-slate-200 bg-slate-50 text-slate-950',
  'Test phase': 'border-amber-200 bg-amber-50 text-amber-950',
  'Interviewing': 'border-sky-200 bg-sky-50 text-sky-950',
  'Rejected': 'border-rose-200 bg-rose-50 text-rose-950',
  'Accepted': 'border-emerald-200 bg-emerald-50 text-emerald-950',
  'No response': 'border-violet-200 bg-violet-50 text-violet-950',
};

function StatCard({ label, value }: { label: string; value: number }) {
  const tone = STAT_CARD_STYLES[label] ?? 'border-slate-200 bg-slate-50 text-slate-950';

  return (
    <div className={`rounded-3xl border p-4 shadow-soft backdrop-blur ${tone}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

export default function JobTracker({ initialApplications, initialDeletedApplications }: { initialApplications: Application[]; initialDeletedApplications: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [deletedApplications, setDeletedApplications] = useState<Application[]>(initialDeletedApplications);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('All');
  const [workFilter, setWorkFilter] = useState<FilterValue>('All');
  const [editing, setEditing] = useState<Application | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const persistState = (nextApplications: Application[], nextDeletedApplications: Application[]) => {
    fetch('/api/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applications: nextApplications, deletedApplications: nextDeletedApplications }),
    }).catch(() => {
      // Keep the UI responsive even if persistence fails.
    });
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...applications].sort((a, b) => {
      const starredDiff = Number(b.starred) - Number(a.starred);
      if (starredDiff !== 0) return starredDiff;

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

  const saveApplication = (payload: Omit<Application, 'id' | 'starred'>) => {
    if (editing) {
      const nextApplications = applications.map((item) => (item.id === editing.id ? { ...editing, ...payload } : item));
      setApplications(nextApplications);
      persistState(nextApplications, deletedApplications);
    } else {
      const nextId = Math.max(0, ...applications.map((item) => item.id), ...deletedApplications.map((item) => item.id)) + 1;
      const nextApplications = [{ id: nextId, starred: false, ...payload }, ...applications];
      setApplications(nextApplications);
      persistState(nextApplications, deletedApplications);
    }
    setIsFormOpen(false);
    setEditing(null);
  };

  const removeApplication = (id: number) => {
    const item = applications.find((entry) => entry.id === id);
    if (!item) return;

    const nextApplications = applications.filter((entry) => entry.id !== id);
    const nextDeletedApplications = [item, ...deletedApplications.filter((entry) => entry.id !== id)];

    setApplications(nextApplications);
    setDeletedApplications(nextDeletedApplications);
    persistState(nextApplications, nextDeletedApplications);
    setOpenMenuId(null);
  };

  const toggleStar = (id: number) => {
    const nextApplications = applications.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item));
    setApplications(nextApplications);
    persistState(nextApplications, deletedApplications);
  };

  const closeDetails = () => setSelectedApplication(null);

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

          <div className="flex flex-wrap gap-3">
            <Link href="/deleted" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Silinenler ({deletedApplications.length})
            </Link>
            <button onClick={openCreate} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800">
              Add application
            </button>
          </div>
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
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-14" />
                <col className="w-[30%]" />
                <col className="w-[38%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-4 align-middle">
                    <span className="sr-only">Starred</span>
                  </th>
                  <th className="px-5 py-4 align-middle">Company</th>
                  <th className="px-5 py-4 align-middle">Program</th>
                  <th className="px-5 py-4 align-middle">Status</th>
                  <th className="px-5 py-4 align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-500">
                      No applications match the current filters.
                    </td>
                  </tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} className="align-middle">
                    <td className="px-4 py-5 align-middle">
                      <button
                        type="button"
                        aria-label={item.starred ? 'Unstar application' : 'Star application'}
                        onClick={() => toggleStar(item.id)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${item.starred ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100' : 'border-slate-200 bg-white text-slate-300 hover:bg-slate-50 hover:text-amber-400'}`}
                      >
                        {item.starred ? '★' : '☆'}
                      </button>
                    </td>
                    <td className="px-5 py-5 align-middle">
                      <div className="min-w-0 font-medium text-slate-950">{item.company}</div>
                      <div className="mt-1 text-sm text-slate-500 md:hidden">{item.program}</div>
                    </td>
                    <td className="px-5 py-5 align-middle">
                      <div className="min-w-0 text-sm text-slate-700">{item.program}</div>
                    </td>
                    <td className="px-5 py-5 align-middle">
                      <div className="inline-flex items-center"><StatusBadge status={item.status} /></div>
                    </td>
                    <td className="px-5 py-5 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedApplication(item)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                          Details
                        </button>
                        <button onClick={() => { setEditing(item); setIsFormOpen(true); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                          Edit
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Open actions menu"
                            aria-expanded={openMenuId === item.id}
                            onClick={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            ⋯
                          </button>
                          {openMenuId === item.id ? (
                            <div className="absolute right-0 top-full z-10 mt-2 w-36 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                              <button
                                type="button"
                                onClick={() => removeApplication(item.id)}
                                className="w-full rounded-xl border border-rose-200 px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {selectedApplication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetails}>
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl shadow-slate-900/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{selectedApplication.company}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedApplication.program}</p>
              </div>
              <button onClick={closeDetails} className="rounded-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Company</div>
                <div className="mt-1 text-sm font-medium text-slate-950">{selectedApplication.company}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Program</div>
                <div className="mt-1 text-sm font-medium text-slate-950">{selectedApplication.program}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
                <div className="mt-1 text-sm font-medium text-slate-950"><StatusBadge status={selectedApplication.status} /></div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Work type</div>
                <div className="mt-1 text-sm font-medium text-slate-950">{selectedApplication.workType}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Application date</div>
                <div className="mt-1 text-sm font-medium text-slate-950">{selectedApplication.applicationDate}</div>
              </div>
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Notes</div>
                <div className="mt-1 text-sm leading-6 text-slate-700">{selectedApplication.notes || 'No notes yet.'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
