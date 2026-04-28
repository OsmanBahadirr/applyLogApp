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
  status: 'Submitted' as ApplicationStatus,
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

  const fieldClass = 'mt-1 w-full rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-3 py-2 text-sm text-[color:var(--theme-text)] outline-none transition focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--theme-overlay)] px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-[color:var(--theme-card-strong)] p-5 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--theme-text)]">{initial ? 'Edit application' : 'Add application'}</h2>
            <p className="mt-1 text-sm text-[color:var(--theme-text-muted)]">Keep your tracker updated with a clean, fast form.</p>
          </div>
          <button onClick={onClose} className="rounded-full px-3 py-1.5 text-sm text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-1)]">
            Close
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-[color:var(--theme-text)]">
            Company name
            <input required className={fieldClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-[color:var(--theme-text)]">
            Program / position
            <input required className={fieldClass} value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
          </label>

          <label className="text-sm font-medium text-[color:var(--theme-text)]">
            Work type
            <select className={fieldClass} value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value as WorkType })}>
              {WORK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[color:var(--theme-text)]">
            Application status
            <select className={fieldClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-[color:var(--theme-text)]">
            Application date
            <input type="date" className={fieldClass} value={form.applicationDate} onChange={(e) => setForm({ ...form, applicationDate: e.target.value })} />
          </label>

          <label className="md:col-span-2 text-sm font-medium text-[color:var(--theme-text)]">
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
            <button type="button" onClick={onClose} className="rounded-xl border border-[color:var(--theme-border)] px-4 py-2 text-sm font-medium text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-1)]">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-[color:var(--theme-text)] px-4 py-2 text-sm font-medium text-[color:var(--theme-surface-0)] hover:bg-[color:var(--theme-accent-strong)]">
              {initial ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
