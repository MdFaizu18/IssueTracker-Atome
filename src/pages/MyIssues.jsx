import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CircleDot, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/shared/Badges';
import { StatCard } from '../components/shared/StatCard';
import { cn } from '../utils/cn';
import { getIssuesAssignedToAssignee, mapBackendIssueToUiIssue } from '../lib/api';

const statusFilters = ['ALL', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const statusLabels = {
  ALL: 'All',
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

const AUTH_STORAGE_KEY = 'auth_user';

function getUserIdFromLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId ?? null;
  } catch {
    return null;
  }
}

export default function MyIssuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [myIssues, setMyIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = getUserIdFromLocalStorage();
    if (!userId) return;

    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError('');
        const backendIssues = await getIssuesAssignedToAssignee(userId);
        if (cancelled) return;
        setMyIssues(Array.isArray(backendIssues) ? backendIssues.map(mapBackendIssueToUiIssue) : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load your issues');
        setMyIssues([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredIssues = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return myIssues.filter((issue) => {
      const matchesSearch =
        issue.summary?.toLowerCase().includes(q) || issue.description?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myIssues, searchQuery, statusFilter]);

  const completedCount = useMemo(() => myIssues.filter((i) => i.status === 'DONE').length, [myIssues]);
  const inProgressCount = useMemo(
    () => myIssues.filter((i) => i.status === 'IN_PROGRESS').length,
    [myIssues]
  );
  const pendingCount = useMemo(
    () => myIssues.filter((i) => i.status === 'TODO' || i.status === 'BACKLOG').length,
    [myIssues]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Issues</h1>
        <p className="mt-1 text-muted-foreground">
          Issues assigned to you across all projects
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={CircleDot}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your issues..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="rounded-xl bg-card border border-border">
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading issues...</div>
          ) : filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => {
              return (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">#{issue.id}</span>
                      <TypeBadge type={issue.type} />
                      {issue.projectId ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">
                          Project {issue.projectId}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-medium text-foreground">{issue.summary}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {issue.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{issue.sprint}</span>
                      <span>{issue.storyPoints} points</span>
                      <span>Updated {new Date(issue.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {myIssues.length === 0 
                ? 'No issues assigned to you' 
                : 'No issues match your filters'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
