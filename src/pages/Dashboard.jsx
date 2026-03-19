import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CircleDot, ClipboardList, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockProjects, mockIssues, getUserById } from '../data/mockData';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/shared/Badges';
import { getIssuesAssignedToAssignee, mapBackendIssueToUiIssue } from '../lib/api';

export default function DashboardPage() {
  const { user } = useAuth();

  const [assignedIssues, setAssignedIssues] = useState([]);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const storedRaw =
        typeof window !== 'undefined' ? window.localStorage.getItem('auth_user') : null;
      const storedUser = storedRaw ? JSON.parse(storedRaw) : null;
      const userId = storedUser?.userId ?? user?.userId ?? user?.id;
      if (!userId) return;

      try {
        setIsLoadingAssigned(true);
        const backendIssues = await getIssuesAssignedToAssignee(userId);
        if (cancelled) return;
        setAssignedIssues(
          Array.isArray(backendIssues) ? backendIssues.map(mapBackendIssueToUiIssue) : []
        );
      } finally {
        if (!cancelled) setIsLoadingAssigned(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.userId]);

  const completedIssues = useMemo(
    () => assignedIssues.filter((issue) => issue.status === 'DONE'),
    [assignedIssues]
  );
  const recentIssues = [...mockIssues]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const stats = [
    { title: 'Total Projects', value: mockProjects.length, icon: FolderKanban, trend: { value: 12, isPositive: true } },
    { title: 'Total Issues', value: mockIssues.length, icon: CircleDot, trend: { value: 8, isPositive: true } },
    { title: 'Assigned to Me', value: assignedIssues.length, icon: ClipboardList, trend: { value: 5, isPositive: false } },
    { title: 'Completed', value: completedIssues.length, icon: CheckCircle2, trend: { value: 24, isPositive: true } },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {"Here's what's happening with your projects today."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Issues */}
      <div className="rounded-xl bg-card border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Recent Issues</h2>
            <p className="text-sm text-muted-foreground">Latest updates across all projects</p>
          </div>
          <Link 
            to="/issues" 
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentIssues.map((issue) => {
            const assignee = getUserById(issue.assigneeId);
            return (
              <Link
                key={issue.id}
                to={`/issues/${issue.id}`}
                className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{issue.id}
                    </span>
                    <TypeBadge type={issue.type} />
                  </div>
                  <p className="mt-1 font-medium text-card-foreground truncate">
                    {issue.summary}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(issue.updatedAt).toLocaleDateString()}
                    </span>
                    <span>{issue.sprint}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                  {assignee && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                      <img
                        src={assignee.profileImage}
                        alt={assignee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions + Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="rounded-xl bg-card border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Active Projects</h2>
            <Link 
              to="/projects" 
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {mockProjects.slice(0, 4).map((project) => {
              const owner = getUserById(project.ownerId);
              const projectIssues = mockIssues.filter(i => i.projectId === project.id);
              const progress = Math.round(
                (projectIssues.filter(i => i.status === 'DONE').length / projectIssues.length) * 100
              ) || 0;
              
              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground">{project.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {projectIssues.length} issues - {owner?.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium text-card-foreground">{progress}%</span>
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* My Assigned Issues */}
        <div className="rounded-xl bg-card border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">My Assigned Issues</h2>
            <Link 
              to="/my-issues" 
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {isLoadingAssigned ? (
              <div className="p-8 text-center text-muted-foreground">Loading assigned issues...</div>
            ) : assignedIssues.length > 0 ? (
              assignedIssues.slice(0, 4).map((issue) => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={issue.type} />
                      <PriorityBadge priority={issue.priority} />
                    </div>
                    <p className="mt-1 font-medium text-card-foreground truncate">
                      {issue.summary}
                    </p>
                  </div>
                  <StatusBadge status={issue.status} />
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No issues assigned to you
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
