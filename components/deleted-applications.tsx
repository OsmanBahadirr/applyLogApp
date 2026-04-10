"use client";

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from './status-badge';
import type { Application } from '@/lib/types';

export function DeletedApplications({ initialApplications, initialDeletedApplications }: { initialApplications: Application[]; initialDeletedApplications: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [deletedApplications, setDeletedApplications] = useState<Application[]>(initialDeletedApplications);

  const persistState = (nextApplications: Application[], nextDeletedApplications: Application[]) => {
    fetch('/api/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applications: nextApplications, deletedApplications: nextDeletedApplications }),
    }).catch(() => {
      // Keep the UI responsive even if persistence fails.
    });
  };

  const restoreApplication = (id: number) => {
    const item = deletedApplications.find((entry) => entry.id === id);
    if (!item) return;

    const nextDeletedApplications = deletedApplications.filter((entry) => entry.id !== id);
    const nextApplications = [item, ...applications.filter((entry) => entry.id !== id)];

    setDeletedApplications(nextDeletedApplications);
    setApplications(nextApplications);
    persistState(nextApplications, nextDeletedApplications);
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Silinenler</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Geri alınabilir başvurular</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Silinen kayıtları burada tutabilir ve tek tıkla geri alabilirsin.</p>
          </div>

          <Link href="/" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Ana sayfa
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {deletedApplications.length} silinmiş kayıt
        </div>

        <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {deletedApplications.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500">Silinen başvuru yok.</div>
          ) : deletedApplications.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium text-slate-950">{item.company}</div>
                <div className="mt-1 text-sm text-slate-600">{item.program}</div>
                <div className="mt-2"><StatusBadge status={item.status} /></div>
              </div>
              <button
                type="button"
                onClick={() => restoreApplication(item.id)}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Geri al
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
