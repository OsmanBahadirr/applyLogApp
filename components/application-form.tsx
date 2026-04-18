"use client";

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { STATUS_OPTIONS, WORK_TYPE_OPTIONS, type Application, type ApplicationStatus, type WorkType } from '@/lib/types';

type FormState = Omit<Application, 'id' | 'starred'>;

function getTodayDate() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const emptyForm: FormState = {
  company: '',
  program: '',
  workType: 'Internship' as WorkType,
  status: 'Applied' as ApplicationStatus,
  applicationDate: getTodayDate(),
  notes: '',
};

export function ApplicationForm({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Application | null;
  onClose: () => void;
  onSave: (application: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(
        initial
          ? {
              company: initial.company,
              program: initial.program,
              workType: initial.workType,
              status: initial.status,
              applicationDate: initial.applicationDate,
              notes: initial.notes,
            }
          : emptyForm,
    );
  }, [initial, open]);

  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(form);
  };

  const fieldClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-950';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl shadow-slate-900/10 dark:bg-slate-900 dark:shadow-black/30">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{initial ? 'Edit application' : 'Add application'}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your tracker updated with a clean, fast form.</p>
          </div>
          <button onClick={onClose} className="rounded-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            Close
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Company name
            <input required className={fieldClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Program / position
            <input required className={fieldClass} value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Work type
            <select className={fieldClass} value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value as WorkType })}>
              {WORK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Application status
            <select className={fieldClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Application date
            <input type="date" className={fieldClass} value={form.applicationDate} onChange={(e) => setForm({ ...form, applicationDate: e.target.value })} />
          </label>

          <label className="md:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Notes
            <textarea
              rows={5}
              className={fieldClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Interview details, follow-up dates, referral notes..."
            />
          </label>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
              {initial ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
