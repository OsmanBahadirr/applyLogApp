"use client";

import Link from 'next/link';
import { DragDropProvider, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApplicationForm } from './application-form';
import { StatusBadge } from './status-badge';
import { ThemeToggle } from './theme-toggle';
import { useToast } from './toast';
import { statusBadgeStyles, statusDotStyles, statusSurfaceStyles } from '@/lib/status-styles';
import { STATUS_OPTIONS, WORK_TYPE_OPTIONS, WORK_TYPE_DETAILS, type Application, type ApplicationStatus, type WorkType } from '@/lib/types';

type WorkFilterValue = 'All' | WorkType;
type DetailField = 'company' | 'program' | 'status' | 'workType' | 'applicationDate' | 'notes';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'board' | 'list';
type TimeViewMode = 'day' | 'week';

function getStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'list';
  const stored = window.localStorage.getItem('job-tracker-view-mode');
  return stored === 'board' || stored === 'list' ? stored : 'list';
}

function getStoredTimeViewMode(): TimeViewMode {
  if (typeof window === 'undefined') return 'day';
  const stored = window.localStorage.getItem('job-tracker-time-view-mode');
  return stored === 'week' || stored === 'day' ? stored : 'day';
}

type KanbanColumn = {
  id: ApplicationStatus;
  label: string;
  description: string;
};

const STATUS_ORDER: ApplicationStatus[] = ['Applied', 'Test Phase', 'No Response', 'Rejected'];

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'Applied', label: 'Applied', description: 'Applications sent and awaiting the next step.' },
  { id: 'Test Phase', label: 'Test Phase', description: 'Assignments, exams, and screening steps in progress.' },
  { id: 'No Response', label: 'No Response', description: 'Applications that have gone quiet with no follow-up yet.' },
  { id: 'Rejected', label: 'Rejected', description: 'Closed out or declined applications.' },
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
  ...statusSurfaceStyles,
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

function TimeVisualization({ applications, timeViewMode, onTimeViewChange }: {
  applications: Application[];
  timeViewMode: TimeViewMode;
  onTimeViewChange: (mode: TimeViewMode) => void;
}) {
  const timeData = useMemo(() => {
    const grouped = new Map<string, number>();

    applications.forEach((app) => {
      const date = new Date(app.applicationDate);
      let key: string;

      if (timeViewMode === 'day') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }

      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-14);
  }, [applications, timeViewMode]);

  if (timeData.length === 0) {
    return null;
  }

  const maxCount = Math.max(...timeData.map(([, count]) => count), 1);
  const dataPoints = timeData.map(([, count]) => count);
  const labels = timeData.map(([label]) => label);

  const chartWidth = 800;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xStep = innerWidth / (dataPoints.length - 1);
  const yScale = (value: number) => innerHeight - (value / maxCount) * innerHeight;

  const points = dataPoints.map((value, index) => {
    const x = padding.left + index * xStep;
    const y = padding.top + yScale(value);
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `${padding.left},${padding.top + innerHeight} ${points} ${padding.left + (dataPoints.length - 1) * xStep},${padding.top + innerHeight}`;

  return (
    <div className="mt-8 rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--theme-text)]">Applications over time</h3>
          <p className="mt-1 text-sm text-[color:var(--theme-text-muted)]">Track your application activity</p>
        </div>
        <div className="flex h-10 items-center justify-center gap-1 rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] p-1">
          <button
            type="button"
            onClick={() => onTimeViewChange('day')}
            className={`h-full rounded-lg px-4 py-1.5 text-sm font-medium transition ${timeViewMode === 'day' ? 'bg-[color:var(--theme-text)] text-[color:var(--theme-surface-0)]' : 'text-[color:var(--theme-text-muted)] hover:text-[color:var(--theme-text)]'}`}
          >
            Day
          </button>
          <button
            type="button"
            onClick={() => onTimeViewChange('week')}
            className={`h-full rounded-lg px-4 py-1.5 text-sm font-medium transition ${timeViewMode === 'week' ? 'bg-[color:var(--theme-text)] text-[color:var(--theme-surface-0)]' : 'text-[color:var(--theme-text-muted)] hover:text-[color:var(--theme-text)]'}`}
          >
            Week
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <polygon
            points={areaPath}
            fill="url(#areaGradient)"
          />

          <polyline
            points={points}
            fill="none"
            stroke="var(--theme-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {dataPoints.map((value, index) => {
            const x = padding.left + index * xStep;
            const y = padding.top + yScale(value);

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="var(--theme-surface-0)"
                  stroke="var(--theme-accent)"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  style={{ fill: 'var(--theme-text)' }}
                >
                  {value}
                </text>
                <text
                  x={x}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  className="text-xs"
                  style={{ fill: 'var(--theme-text-muted)' }}
                >
                  {labels[index].split(' ').slice(-2).join(' ')}
                </text>
              </g>
            );
          })}

          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="var(--theme-border)"
            strokeWidth="1"
          />

          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="var(--theme-border)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}

function ColumnDropZone({ id, children }: { id: ApplicationStatus; children: ReactNode }) {
  const { isDropTarget, ref } = useDroppable({ id });

  return (
    <div
      ref={ref}
      className={`flex h-[400px] flex-col gap-3 rounded-3xl border px-4 py-4 overflow-y-auto transition ${isDropTarget ? 'border-[color:var(--theme-focus)] bg-[color:var(--theme-accent-soft)]' : 'border-[color:var(--theme-border)] bg-[color:var(--theme-surface-1)]'}`}
    >
      {children}
    </div>
  );
}

function isOlderThan30Days(dateString: string): boolean {
  const applicationDate = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - applicationDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 30;
}

function DraggableCard({ application, onStar, onDetails, onDelete }: {
  application: Application;
  onStar: (id: number) => void;
  onDetails: () => void;
  onDelete: () => void;
}) {
  const { ref, isDragging } = useDraggable({ id: application.id, data: { status: application.status } });
  const isOld = isOlderThan30Days(application.applicationDate);

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] p-4 shadow-soft transition ${isDragging ? 'opacity-40' : 'opacity-100'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-[color:var(--theme-text)]">{application.company}</div>
            {isOld && (
              <span title="Over 30 days" className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs dark:bg-amber-900">
                ⏱
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-[color:var(--theme-text-muted)]">{application.program}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={application.status} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStar(application.id)}
            aria-label={application.starred ? 'Unstar application' : 'Star application'}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs transition ${application.starred ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900' : 'border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-1)] hover:text-amber-400'}`}
          >
            {application.starred ? '★' : '☆'}
          </button>
          <button
            type="button"
            onClick={onDetails}
            className="rounded-full border border-[color:var(--theme-border)] px-3 py-1 text-xs text-[color:var(--theme-text)] transition hover:bg-[color:var(--theme-surface-1)]"
          >
            Details
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-950"
          >
            Delete
          </button>
        </div>
      </div>
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
  const [isWorkFilterOpen, setIsWorkFilterOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeDetailField, setActiveDetailField] = useState<DetailField | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [statusSortDirection, setStatusSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [timeViewMode, setTimeViewMode] = useState<TimeViewMode>('day');
  const [hasLoadedViewMode, setHasLoadedViewMode] = useState(false);
  const [timeViewLoaded, setTimeViewLoaded] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const workFilterRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const handleViewChange = (newMode: ViewMode) => {
    if (newMode === viewMode || isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setViewMode(newMode);
      setIsTransitioning(false);
    }, 200);
  };

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

  useEffect(() => {
    if (!isWorkFilterOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!workFilterRef.current?.contains(event.target as Node)) {
        setIsWorkFilterOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsWorkFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isWorkFilterOpen]);

  useEffect(() => {
    setViewMode(getStoredViewMode());
    setTimeViewMode(getStoredTimeViewMode());
    setHasLoadedViewMode(true);
    setTimeViewLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedViewMode) return;
    window.localStorage.setItem('job-tracker-view-mode', viewMode);
  }, [hasLoadedViewMode, viewMode]);

  useEffect(() => {
    if (!timeViewLoaded) return;
    window.localStorage.setItem('job-tracker-time-view-mode', timeViewMode);
  }, [timeViewLoaded, timeViewMode]);

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
      applied: count('Applied'),
      testPhase: count('Test Phase'),
      noResponse: count('No Response'),
      rejected: count('Rejected'),
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

  const boardColumns = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matchesQuery = (item: Application) => !query
      || item.company.toLowerCase().includes(query)
      || item.program.toLowerCase().includes(query);

    return KANBAN_COLUMNS.map((column) => {
      const items = applications
        .filter((item) => item.status === column.id)
        .filter((item) => matchesQuery(item))
        .filter((item) => statusFilters.length === 0 || statusFilters.includes(item.status))
        .filter((item) => workFilter === 'All' || item.workType === workFilter)
        .sort((a, b) => {
          const starredDiff = Number(b.starred) - Number(a.starred);
          if (starredDiff !== 0) return starredDiff;
          return a.company.localeCompare(b.company);
        });

      return {
        ...column,
        items,
      };
    });
  }, [applications, search, statusFilters, workFilter]);

  const moveApplication = (id: number, newStatus: ApplicationStatus) => {
    const app = applications.find((item) => item.id === id);
    const isGoingToTestPhase = app?.status === 'Applied' && newStatus === 'Test Phase';

    if (isGoingToTestPhase) {
      const companyName = app.company;
      showToast(`Moved to Test Phase: ${companyName}`, 'luck');
    }

    setApplications((current) => {
      const nextApplications = current.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
      persistState(nextApplications, deletedApplications);
      return nextApplications;
    });
  };

  const draggedApplication = draggedId ? applications.find((item) => item.id === draggedId) ?? null : null;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--theme-border)] bg-[color:var(--theme-card)] p-5 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[color:var(--theme-accent)]">Job tracker</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--theme-text)] sm:text-4xl">Track every application in one polished workspace.</h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--theme-text-muted)]">
              A dashboard for scanning, filtering, editing, and managing your job search with minimal friction.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/deleted" className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-5 py-3 text-sm font-medium text-[color:var(--theme-text)] transition hover:bg-[color:var(--theme-surface-1)]">
              Deleted ({deletedApplications.length})
            </Link>
            <button onClick={openCreate} className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--theme-text)] px-5 py-3 text-sm font-medium text-[color:var(--theme-surface-0)] shadow-lg shadow-slate-950/15 transition hover:bg-[color:var(--theme-accent-strong)]">
              Add application
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total applications" value={summary.total} />
          <StatCard label="Applied" value={summary.applied} />
          <StatCard label="Test Phase" value={summary.testPhase} />
          <StatCard label="No Response" value={summary.noResponse} />
          <StatCard label="Rejected" value={summary.rejected} />
        </div>

        <div className="mt-6 grid gap-3 rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-1)] p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or program"
            className="h-12 w-full rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-4 text-sm text-[color:var(--theme-text)] outline-none focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
          />

          {viewMode !== 'board' && (
            <div ref={statusFilterRef} className="relative">
              <button
                type="button"
                onClick={() => setIsStatusFilterOpen((current) => !current)}
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-4 text-left text-sm text-[color:var(--theme-text)] outline-none transition hover:bg-[color:var(--theme-surface-1)] focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
                aria-haspopup="listbox"
                aria-expanded={isStatusFilterOpen}
              >
                <span>{statusFilterLabel}</span>
                <span className="text-[color:var(--theme-text-muted)]" aria-hidden="true">{isStatusFilterOpen ? '↑' : '↓'}</span>
              </button>

              {isStatusFilterOpen ? (
                <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] p-2 shadow-xl shadow-slate-900/10">
                  <button
                    type="button"
                    onClick={() => setStatusFilters([])}
                    className="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-[color:var(--theme-text)] transition hover:bg-[color:var(--theme-surface-1)]"
                  >
                    <span>All statuses</span>
                    {statusFilters.length === 0 ? <span className="text-xs text-[color:var(--theme-accent)]">Selected</span> : null}
                  </button>

                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = statusFilters.includes(option);

                    return (
                      <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-[color:var(--theme-text)] transition hover:bg-[color:var(--theme-surface-1)]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStatusFilter(option)}
                          className="h-4 w-4 rounded border-slate-300 text-[color:var(--theme-accent)] focus:ring-[color:var(--theme-focus)]"
                        />
                        <span className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${statusDotStyles[option]}`} aria-hidden="true" />
                          <span>{option}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          <div ref={workFilterRef} className="relative">
            <button
              type="button"
              onClick={() => setIsWorkFilterOpen((current) => !current)}
              className="flex h-12 w-full items-center justify-between rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-4 text-left text-sm text-[color:var(--theme-text)] outline-none transition hover:bg-[color:var(--theme-surface-1)] focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
              aria-haspopup="listbox"
              aria-expanded={isWorkFilterOpen}
            >
              <span>{workFilter === 'All' ? 'All work types' : workFilter}</span>
              <span className="text-[color:var(--theme-text-muted)]" aria-hidden="true">{isWorkFilterOpen ? '↑' : '↓'}</span>
            </button>

            {isWorkFilterOpen ? (
              <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] p-2 shadow-xl shadow-slate-900/10">
                <button
                  type="button"
                  onClick={() => { setWorkFilter('All'); setIsWorkFilterOpen(false); }}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[color:var(--theme-text)] transition hover:bg-[color:var(--theme-surface-1)] ${workFilter === 'All' ? 'bg-[color:var(--theme-accent-soft)]' : ''}`}
                >
                  <span>All work types</span>
                  {workFilter === 'All' ? <span className="ml-auto text-xs text-[color:var(--theme-accent)]">Selected</span> : null}
                </button>

                {WORK_TYPE_DETAILS.map((detail) => {
                  const isSelected = workFilter === detail.type;

                  return (
                    <button
                      key={detail.type}
                      type="button"
                      onClick={() => { setWorkFilter(detail.type); setIsWorkFilterOpen(false); }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[color:var(--theme-text)] transition hover:bg-[color:var(--theme-surface-1)] ${isSelected ? 'bg-[color:var(--theme-accent-soft)]' : ''}`}
                    >
                      <div className="flex-1 font-medium">{detail.type}</div>
                      {isSelected ? <span className="text-xs text-[color:var(--theme-accent)]">Selected</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex h-12 items-center justify-between gap-2 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] p-1">
            <button
              type="button"
              onClick={() => handleViewChange('board')}
              disabled={isTransitioning}
              className={`h-full flex-1 rounded-xl px-4 text-sm font-medium transition ${viewMode === 'board' ? 'bg-[color:var(--theme-text)] text-[color:var(--theme-surface-0)]' : 'text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-1)]'} ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              Kanban
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('list')}
              disabled={isTransitioning}
              className={`h-full flex-1 rounded-xl px-4 text-sm font-medium transition ${viewMode === 'list' ? 'bg-[color:var(--theme-text)] text-[color:var(--theme-surface-0)]' : 'text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-1)]'} ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              List
            </button>
          </div>
        </div>

        <div className={`mt-6 ${isTransitioning ? 'animate-fade-out' : 'animate-fade-in'}`}>
          {viewMode === 'board' ? (
          <DragDropProvider
            onDragStart={({ operation }) => {
              const sourceId = operation?.source?.id;
              if (typeof sourceId === 'number') {
                setDraggedId(sourceId);
              }
            }}
            onDragEnd={({ operation }) => {
              const sourceId = operation?.source?.id;
              const targetId = operation?.target?.id;

              setDraggedId(null);

              if (!sourceId || !targetId || sourceId === targetId) {
                return;
              }

              if (typeof sourceId === 'number' && typeof targetId === 'string') {
                moveApplication(sourceId, targetId as ApplicationStatus);
              }
            }}
          >
            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {boardColumns.map((column) => (
                <div key={column.id} className="flex flex-col gap-3">
                  <div className={`h-20 rounded-3xl border px-4 py-4 ${statusSurfaceStyles[column.id]}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{column.label}</div>
                        <div className="mt-1 text-xs opacity-75">{column.description}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadgeStyles[column.id]}`}>
                        {column.items.length}
                      </span>
                    </div>
                  </div>
                  <ColumnDropZone id={column.id}>
                    {column.items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[color:var(--theme-border)] px-4 py-6 text-center text-xs text-[color:var(--theme-text-muted)]">
                        Drag applications here.
                      </div>
                    ) : column.items.map((item) => (
                      <DraggableCard
                        key={item.id}
                        application={item}
                        onStar={toggleStar}
                        onDetails={() => { setSelectedApplication(item); setActiveDetailField(null); }}
                        onDelete={() => removeApplication(item.id)}
                      />
                    ))}
                  </ColumnDropZone>
                </div>
              ))}
            </div>
            <DragOverlay>
              {draggedApplication ? (
                <div className="rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] p-4 shadow-2xl">
                  <div className="text-sm font-semibold text-[color:var(--theme-text)]">{draggedApplication.company}</div>
                  <div className="mt-1 text-xs text-[color:var(--theme-text-muted)]">{draggedApplication.program}</div>
                </div>
              ) : null}
            </DragOverlay>
          </DragDropProvider>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)]">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-14" />
                <col className="w-[30%]" />
                <col className="w-[38%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[color:var(--theme-border)] text-left text-xs font-semibold uppercase tracking-wide text-[color:var(--theme-text-muted)]">
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
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--theme-text-muted)] transition hover:bg-[color:var(--theme-surface-1)] hover:text-[color:var(--theme-text)]"
                    >
                      Status
                      <span aria-hidden="true">{statusSortDirection === 'asc' ? '↑' : '↓'}</span>
                    </button>
                  </th>
                  <th className="px-5 py-4 align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--theme-border)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-sm text-[color:var(--theme-text-muted)]">
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
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${item.starred ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900' : 'border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-1)] hover:text-amber-400'}`}
                      >
                        {item.starred ? '★' : '☆'}
                      </button>
                    </td>
                    <td className="px-5 py-5 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 font-medium text-[color:var(--theme-text)]">{item.company}</div>
                        {isOlderThan30Days(item.applicationDate) && (
                          <span title="Over 30 days" className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs dark:bg-amber-900">
                            ⏱
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-[color:var(--theme-text-muted)] md:hidden">{item.program}</div>
                    </td>
                    <td className="px-5 py-5 align-middle">
                      <div className="min-w-0 text-sm text-[color:var(--theme-text-muted)]">{item.program}</div>
                    </td>
                    <td className="px-5 py-5 align-middle">
                      <div className="inline-flex items-center"><StatusBadge status={item.status} /></div>
                    </td>
                    <td className="px-5 py-5 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedApplication(item); setActiveDetailField(null); }} className="rounded-xl border border-[color:var(--theme-border)] px-3 py-2 text-sm font-medium text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-1)]">
                          Details
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Open actions menu"
                            aria-expanded={openMenuId === item.id}
                            onClick={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--theme-border)] text-lg font-semibold text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-1)]"
                          >
                            ⋯
                          </button>
                          {openMenuId === item.id ? (
                            <div className="absolute bottom-full right-0 z-10 mb-2 w-36 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] p-2 shadow-lg">
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
          )}
        </div>

        <TimeVisualization
          applications={applications}
          timeViewMode={timeViewMode}
          onTimeViewChange={setTimeViewMode}
        />
      </section>

      <ApplicationForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
        }}
        onSave={saveApplication}
      />

      {selectedApplication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--theme-overlay)] px-4 py-6 backdrop-blur-sm" onClick={closeDetails}>
          <div className="w-full max-w-xl rounded-3xl bg-[color:var(--theme-card-strong)] p-5 shadow-2xl shadow-slate-900/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--theme-text)]">{selectedApplication.company}</h2>
                <p className="mt-1 text-sm text-[color:var(--theme-text-muted)]">{selectedApplication.program}</p>
              </div>
              <button onClick={closeDetails} className="rounded-full px-3 py-1.5 text-sm text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-1)]">
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
                    className={`rounded-2xl border p-4 transition ${isActive ? 'border-[color:var(--theme-focus)] bg-[color:var(--theme-accent-soft)] ring-4 ring-[color:var(--theme-accent-soft)]' : 'border-[color:var(--theme-border)] bg-[color:var(--theme-surface-1)] hover:bg-[color:var(--theme-surface-2)]'}`}
                    onClick={() => setActiveDetailField(field.key)}
                  >
                    <div className="mb-2 text-xs uppercase tracking-wide text-[color:var(--theme-text-muted)]">{field.label}</div>

                    {field.type === 'text' && isActive ? (
                      <input
                        autoFocus
                        value={String(value)}
                        onChange={(e) => updateSelectedApplication({ [field.key]: e.target.value } as Partial<Application>)}
                        className="w-full rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-3 py-2 text-sm text-[color:var(--theme-text)] outline-none focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
                      />
                    ) : null}

                    {field.type === 'select' && isActive && field.key === 'status' ? (
                      <select
                        autoFocus
                        value={selectedApplication.status}
                        onChange={(e) => updateSelectedApplication({ status: e.target.value as ApplicationStatus })}
                        className="w-full rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-3 py-2 text-sm text-[color:var(--theme-text)] outline-none focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
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
                        className="w-full rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-3 py-2 text-sm text-[color:var(--theme-text)] outline-none focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
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
                        className="w-full rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-3 py-2 text-sm text-[color:var(--theme-text)] outline-none focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
                      />
                    ) : null}

                    {field.type === 'textarea' && isActive ? (
                      <textarea
                        autoFocus
                        rows={4}
                        value={selectedApplication.notes}
                        onChange={(e) => updateSelectedApplication({ notes: e.target.value })}
                        className="w-full rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] px-3 py-2 text-sm text-[color:var(--theme-text)] outline-none focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
                      />
                    ) : null}

                    {!isActive ? (
                      <div className="text-sm font-medium text-[color:var(--theme-text)]">
                        {field.key === 'status' ? <StatusBadge status={selectedApplication.status} /> : null}
                        {field.key !== 'status' && field.key !== 'notes' ? String(value) : null}
                        {field.key === 'notes' ? <div className="whitespace-pre-wrap leading-6 text-[color:var(--theme-text-muted)]">{String(value || 'No notes yet.')}</div> : null}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-[color:var(--theme-accent)]">Editing</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={closeDetails} className="rounded-xl border border-[color:var(--theme-border)] px-4 py-2 text-sm font-medium text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-1)]">
                Close
              </button>
              <button onClick={saveDetails} className="rounded-xl bg-[color:var(--theme-text)] px-4 py-2 text-sm font-medium text-[color:var(--theme-surface-0)] hover:bg-[color:var(--theme-accent-strong)]">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
