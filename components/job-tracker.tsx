"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApplicationForm } from './application-form';
import { StatusBadge } from './status-badge';
import { ThemeToggle } from './theme-toggle';
import { STATUS_OPTIONS, WORK_TYPE_OPTIONS, type Application, type ApplicationStatus, type WorkType } from '@/lib/types';

type WorkFilterValue = 'All' | WorkType;
type DetailField = 'company' | 'program' | 'status' | 'workType' | 'applicationDate' | 'notes';
type SortDirection = 'asc' | 'desc';

const STATUS_ORDER: ApplicationStatus[] = [
  'Accepted',
  'Test Phase',
  'Interviewing',
  'Applied',
  'No Response',
  'Rejected',
];

const statusRank = new Map(STATUS_ORDER.map((status, index) => [status, index]));

const DETAIL_FIELDS: Array<{ key: DetailField; label: string; type: 'text' | 'select' | 'date' | 'textarea' }> = [
  { key: 'company', label: 'Company', type: 'text' },
  { key: 'program', label: 'Program', type: 'text' },
  { key: 'status', label: 'Status', type: 'select' },
  { key: 'workType', label: 'Work type', type: 'select' },
  { key: 'applicationDate', label: 'Application date', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const STAT_CARD_STYLES: Record<string, string> = {
  'Total applications': 'border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  'Test phase': 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
  'Interviewing': 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100',
  'Rejected': 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100',
  'Accepted': 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
  'No response': 'border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100',
};

function StatCard({ label, value }: { label: string; value: number }) {
  const tone = STAT_CARD_STYLES[label] ?? 'border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50';

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
  const [statusFilters, setStatusFilters] = useState<ApplicationStatus[]>([]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [workFilter, setWorkFilter] = useState<WorkFilterValue>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeDetailField, setActiveDetailField] = useState<DetailField | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [statusSortDirection, setStatusSortDirection] = useState<SortDirection>('asc');
  const statusFilterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isStatusFilterOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!statusFilterRef.current?.contains(event.target as Node)) {
        setIsStatusFilterOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsStatusFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isStatusFilterOpen]);

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

      const statusDiff = ((statusRank.get(a.status) ?? 999) - (statusRank.get(b.status) ?? 999)) * (statusSortDirection === 'asc' ? 1 : -1);
      if (statusDiff !== 0) return statusDiff;

      return a.company.localeCompare(b.company);
    }).filter((item) => {
      const matchesSearch = !query || item.company.toLowerCase().includes(query) || item.program.toLowerCase().includes(query);
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(item.status);
      const matchesWork = workFilter === 'All' || item.workType === workFilter;
      return matchesSearch && matchesStatus && matchesWork;
    });
  }, [applications, search, statusFilters, statusSortDirection, workFilter]);

  const statusFilterLabel = statusFilters.length === 0
    ? 'All statuses'
    : statusFilters.length === 1
      ? statusFilters[0]
      : `${statusFilters.length} statuses`;

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
    setIsFormOpen(true);
  };

  const saveApplication = async (payload: Omit<Application, 'id' | 'starred'>) => {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return;
    }

    const result = (await response.json()) as { application?: Application };

    const createdApplication = result.application;

    if (!createdApplication) {
      return;
    }

    setApplications((current) => [createdApplication, ...current.filter((item) => item.id !== createdApplication.id)]);
    setIsFormOpen(false);
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

  const toggleStatusFilter = (status: ApplicationStatus) => {
    setStatusFilters((current) => (
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status]
    ));
  };

  const closeDetails = () => {
    setSelectedApplication(null);
    setActiveDetailField(null);
  };

  const updateSelectedApplication = (patch: Partial<Application>) => {
    setSelectedApplication((current) => (current ? { ...current, ...patch } : current));
  };

  const saveDetails = () => {
    if (!selectedApplication) return;

    const nextApplications = applications.map((item) => (item.id === selectedApplication.id ? selectedApplication : item));
    setApplications(nextApplications);
    persistState(nextApplications, deletedApplications);
    closeDetails();
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/75 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-600 dark:text-cyan-300">Job tracker</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">Track every application in one polished workspace.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              A dashboard for scanning, filtering, editing, and managing your job search with minimal friction.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/deleted" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              Silinenler ({deletedApplications.length})
            </Link>
            <button onClick={openCreate} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
              Add application
            </button>
            <ThemeToggle />
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

        <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or program"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
          />

          <div ref={statusFilterRef} className="relative">
            <button
              type="button"
              onClick={() => setIsStatusFilterOpen((current) => !current)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-950 outline-none transition hover:bg-slate-50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
              aria-haspopup="listbox"
              aria-expanded={isStatusFilterOpen}
            >
              <span>{statusFilterLabel}</span>
              <span className="text-slate-400" aria-hidden="true">{isStatusFilterOpen ? '↑' : '↓'}</span>
            </button>

            {isStatusFilterOpen ? (
              <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/30">
                <button
                  type="button"
                  onClick={() => setStatusFilters([])}
                  className="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <span>All statuses</span>
                  {statusFilters.length === 0 ? <span className="text-xs text-indigo-600 dark:text-cyan-300">Selected</span> : null}
                </button>

                {STATUS_OPTIONS.map((option) => {
                  const isSelected = statusFilters.includes(option);

                  return (
                    <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleStatusFilter(option)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-cyan-400 dark:focus:ring-cyan-500"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>

          <select value={workFilter} onChange={(e) => setWorkFilter(e.target.value as WorkFilterValue)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-950">
            <option value="All">All work types</option>
            {WORK_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-14" />
              <col className="w-[30%]" />
              <col className="w-[38%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-4 align-middle">
                  <span className="sr-only">Starred</span>
                </th>
                <th className="px-5 py-4 align-middle">Company</th>
                <th className="px-5 py-4 align-middle">Program</th>
                <th className="px-5 py-4 align-middle" aria-sort={statusSortDirection === 'asc' ? 'ascending' : 'descending'}>
                  <button
                    type="button"
                    aria-label={`Sort status ${statusSortDirection === 'asc' ? 'descending' : 'ascending'}`}
                    onClick={() => setStatusSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    Status
                    <span aria-hidden="true">{statusSortDirection === 'asc' ? '↑' : '↓'}</span>
                  </button>
                </th>
                <th className="px-5 py-4 align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-500 dark:text-slate-400">
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
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${item.starred ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900' : 'border-slate-200 bg-white text-slate-300 hover:bg-slate-50 hover:text-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-amber-300'}`}
                    >
                      {item.starred ? '★' : '☆'}
                    </button>
                  </td>
                  <td className="px-5 py-5 align-middle">
                    <div className="min-w-0 font-medium text-slate-950 dark:text-slate-50">{item.company}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400 md:hidden">{item.program}</div>
                  </td>
                  <td className="px-5 py-5 align-middle">
                    <div className="min-w-0 text-sm text-slate-700 dark:text-slate-300">{item.program}</div>
                  </td>
                  <td className="px-5 py-5 align-middle">
                    <div className="inline-flex items-center"><StatusBadge status={item.status} /></div>
                  </td>
                  <td className="px-5 py-5 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedApplication(item); setActiveDetailField(null); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900">
                        Details
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="Open actions menu"
                          aria-expanded={openMenuId === item.id}
                          onClick={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                          ⋯
                        </button>
                        {openMenuId === item.id ? (
                          <div className="absolute bottom-full right-0 z-10 mb-2 w-36 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                            <button
                              type="button"
                              onClick={() => removeApplication(item.id)}
                              className="w-full rounded-xl border border-rose-200 px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-950"
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
      </section>

      <ApplicationForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
        }}
        onSave={saveApplication}
      />

      {selectedApplication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetails}>
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl shadow-slate-900/10 dark:bg-slate-900 dark:shadow-black/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{selectedApplication.company}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedApplication.program}</p>
              </div>
              <button onClick={closeDetails} className="rounded-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {DETAIL_FIELDS.map((field) => {
                const isActive = activeDetailField === field.key;
                const value = selectedApplication[field.key];

                return (
                  <div
                    key={field.key}
                    className={`rounded-2xl border p-4 transition ${isActive ? 'border-indigo-300 bg-indigo-50 ring-4 ring-indigo-100 dark:border-cyan-700 dark:bg-cyan-950/40 dark:ring-cyan-950' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800'}`}
                    onClick={() => setActiveDetailField(field.key)}
                  >
                    <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{field.label}</div>

                    {field.type === 'text' && isActive ? (
                      <input
                        autoFocus
                        value={String(value)}
                        onChange={(e) => updateSelectedApplication({ [field.key]: e.target.value } as Partial<Application>)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
                      />
                    ) : null}

                    {field.type === 'select' && isActive && field.key === 'status' ? (
                      <select
                        autoFocus
                        value={selectedApplication.status}
                        onChange={(e) => updateSelectedApplication({ status: e.target.value as ApplicationStatus })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : null}

                    {field.type === 'select' && isActive && field.key === 'workType' ? (
                      <select
                        autoFocus
                        value={selectedApplication.workType}
                        onChange={(e) => updateSelectedApplication({ workType: e.target.value as WorkType })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
                      >
                        {WORK_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : null}

                    {field.type === 'date' && isActive ? (
                      <input
                        autoFocus
                        type="date"
                        value={selectedApplication.applicationDate}
                        onChange={(e) => updateSelectedApplication({ applicationDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
                      />
                    ) : null}

                    {field.type === 'textarea' && isActive ? (
                      <textarea
                        autoFocus
                        rows={4}
                        value={selectedApplication.notes}
                        onChange={(e) => updateSelectedApplication({ notes: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
                      />
                    ) : null}

                    {!isActive ? (
                      <div className="text-sm font-medium text-slate-950 dark:text-slate-50">
                        {field.key === 'status' ? <StatusBadge status={selectedApplication.status} /> : null}
                        {field.key !== 'status' && field.key !== 'notes' ? String(value) : null}
                        {field.key === 'notes' ? <div className="whitespace-pre-wrap leading-6 text-slate-700 dark:text-slate-300">{String(value || 'No notes yet.')}</div> : null}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-indigo-600 dark:text-cyan-300">Editing</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={closeDetails} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                Close
              </button>
              <button onClick={saveDetails} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
