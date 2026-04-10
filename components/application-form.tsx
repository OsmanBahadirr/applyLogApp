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
  workType: 'Remote',
  status: 'Applied',
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

  const fieldClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{initial ? 'Edit application' : 'Add application'}</h2>
            <p className="mt-1 text-sm text-slate-500">Keep your tracker updated with a clean, fast form.</p>
          </div>
          <button onClick={onClose} className="rounded-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Company name
            <input required className={fieldClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Program / position
            <input required className={fieldClass} value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Work type
            <select className={fieldClass} value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value as WorkType })}>
              {WORK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Application status
            <select className={fieldClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Application date
            <input type="date" className={fieldClass} value={form.applicationDate} onChange={(e) => setForm({ ...form, applicationDate: e.target.value })} />
          </label>

          <label className="md:col-span-2 text-sm font-medium text-slate-700">
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
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              {initial ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
