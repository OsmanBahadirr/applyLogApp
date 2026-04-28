"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from './status-badge';
import { ThemeToggle } from './theme-toggle';
import type { Application } from '@/lib/types';

export function DeletedApplications({ initialApplications, initialDeletedApplications }: { initialApplications: Application[]; initialDeletedApplications: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [deletedApplications, setDeletedApplications] = useState<Application[]>(initialDeletedApplications);
  const router = useRouter();

  const persistState = async (nextApplications: Application[], nextDeletedApplications: Application[]) => {
    await fetch('/api/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applications: nextApplications, deletedApplications: nextDeletedApplications }),
    });
  };

  const restoreApplication = async (id: number) => {
    const item = deletedApplications.find((entry) => entry.id === id);
    if (!item) return;

    const nextDeletedApplications = deletedApplications.filter((entry) => entry.id !== id);
    const nextApplications = [item, ...applications.filter((entry) => entry.id !== id)];

    setDeletedApplications(nextDeletedApplications);
    setApplications(nextApplications);

    try {
      await persistState(nextApplications, nextDeletedApplications);
      router.push('/');
      router.refresh();
    } catch {
      // Keep the UI responsive even if persistence fails.
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--theme-border)] bg-[color:var(--theme-card)] p-5 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[color:var(--theme-accent)]">Deleted</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--theme-text)] sm:text-4xl">Recoverable applications</h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--theme-text-muted)]">Keep deleted records here and restore them with one click.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-5 py-3 text-sm font-medium text-[color:var(--theme-text)] transition hover:bg-[color:var(--theme-surface-1)]">
              Home
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-1)] px-4 py-3 text-sm text-[color:var(--theme-text-muted)]">
          {deletedApplications.length} deleted records
        </div>

        <div className="mt-6 divide-y divide-[color:var(--theme-border)] overflow-hidden rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)]">
          {deletedApplications.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-[color:var(--theme-text-muted)]">No deleted applications.</div>
          ) : deletedApplications.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium text-[color:var(--theme-text)]">{item.company}</div>
                <div className="mt-1 text-sm text-[color:var(--theme-text-muted)]">{item.program}</div>
                <div className="mt-2"><StatusBadge status={item.status} /></div>
              </div>
              <button
                type="button"
                onClick={() => restoreApplication(item.id)}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-950"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
