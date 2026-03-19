import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, CircleDot, CheckCircle2 } from 'lucide-react';
import { getUserById, getIssuesByAssignee, getProjectById } from '../data/mockData';
import { RoleBadge, StatusBadge, PriorityBadge, TypeBadge } from '../components/shared/Badges';
import { StatCard } from '../components/shared/StatCard';

export default function UserProfilePage() {
  const { id } = useParams();
  const user = getUserById(id);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">User not found</p>
        <Link to="/users" className="mt-4 text-primary hover:underline">
          Back to Users
        </Link>
      </div>
    );
  }

  const assignedIssues = getIssuesByAssignee(user.id);
  const completedIssues = assignedIssues.filter(i => i.status === 'DONE');
  const inProgressIssues = assignedIssues.filter(i => i.status === 'IN_PROGRESS');
  const todoIssues = assignedIssues.filter(i => i.status === 'TODO' || i.status === 'BACKLOG');

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              </div>
              <RoleBadge role={user.role} />
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Issues"
          value={assignedIssues.length}
          icon={CircleDot}
        />
        <StatCard
          title="Completed"
          value={completedIssues.length}
          icon={CheckCircle2}
        />
        <StatCard
          title="In Progress"
          value={inProgressIssues.length}
          icon={CircleDot}
        />
        <StatCard
          title="To Do"
          value={todoIssues.length}
          icon={CircleDot}
        />
      </div>

      {/* Assigned Issues */}
      <div className="rounded-xl bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Assigned Issues</h2>
          <p className="text-sm text-muted-foreground">All issues assigned to {user.name}</p>
        </div>
        <div className="divide-y divide-border">
          {assignedIssues.length > 0 ? (
            assignedIssues.map((issue) => {
              const project = getProjectById(issue.projectId);
              return (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">#{issue.id}</span>
                      <TypeBadge type={issue.type} />
                      {project && (
                        <span className="text-xs text-muted-foreground">{project.name}</span>
                      )}
                    </div>
                    <p className="mt-1 font-medium text-foreground truncate">{issue.summary}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{issue.sprint}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No issues assigned to this user
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
