import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, List, Columns, Filter } from 'lucide-react';
import { StatusBadge, PriorityBadge, TypeBadge, TagBadge } from '../components/shared/Badges';
import { Modal } from '../components/shared/Modal';
import { IssueForm } from '../components/issues/IssueForm';
import { cn } from '../utils/cn';
import {
  createIssue,
  getAllIssues8082,
  getAllUsers,
  getProjectsByOwner,
  mapBackendIssueToUiIssue,
  mapBackendProjectToUiProject,
  mapBackendUserToUiUser,
  updateIssueStatus,
} from '../lib/api';

const statusColumns = ['TODO', 'TESTING', 'DEVELOPMENT', 'COMPLETED'];

const statusLabels = {
  TODO: 'To Do',
  DEVELOPMENT: 'Development',
  TESTING: 'Testing',
  COMPLETED: 'Completed',
};

const AUTH_STORAGE_KEY = 'auth_user';

function getUserIdFromSessionStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId ?? null;
  } catch {
    return null;
  }
}

function normalizeTagsForBackend(tags) {
  if (!tags) return '';
  if (Array.isArray(tags)) return tags.join(',');
  return String(tags);
}

export default function IssuesPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban');

  // In this page, we filter by user's project list.
  const [filterProject, setFilterProject] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userId = useMemo(() => getUserIdFromSessionStorage(), []);

  const assignees = useMemo(() => users.filter((u) => u.role === 'ASSIGNEE'), [users]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId) return;
      setIsLoading(true);
      setError('');
      try {
        const [backendProjects, backendUsers, backendIssues] = await Promise.all([
          getProjectsByOwner(userId),
          getAllUsers(),
          getAllIssues8082(),
        ]);

        if (cancelled) return;

        const mappedProjects = Array.isArray(backendProjects)
          ? backendProjects.map(mapBackendProjectToUiProject)
          : [];
        const mappedUsers = Array.isArray(backendUsers) ? backendUsers.map(mapBackendUserToUiUser) : [];
        const mappedIssues = Array.isArray(backendIssues) ? backendIssues.map(mapBackendIssueToUiIssue) : [];

        const projectIds = new Set(mappedProjects.map((p) => String(p.projectId ?? p.id)));

        // Only show issues related to projects the user created + issues created by the user.
        const relevantIssues = mappedIssues.filter((i) => {
          const projectMatch = projectIds.has(String(i.projectId));
          const ownerMatch = String(i.createdBy) === String(userId);
          return projectMatch || ownerMatch;
        });

        setProjects(mappedProjects);
        setUsers(mappedUsers);
        setIssues(relevantIssues);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load issues');
        setProjects([]);
        setUsers([]);
        setIssues([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const filteredIssues = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return issues.filter((issue) => {
      const matchesSearch =
        issue.summary?.toLowerCase().includes(q) || issue.description?.toLowerCase().includes(q);
      const matchesProject = !filterProject || String(issue.projectId) === String(filterProject);
      return matchesSearch && matchesProject;
    });
  }, [issues, searchQuery, filterProject]);

  const defaultProjectId = projects?.[0]?.projectId ?? projects?.[0]?.id ?? '';

  const handleCreateIssue = async (formData) => {
    if (!userId) return;

    const payload = {
      assignee: formData.assigneeId ? Number(formData.assigneeId) : null,
      createdBy: userId,
      projectId: formData.projectId ? Number(formData.projectId) : null,
      summary: formData.summary,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      type: formData.type,
      sprint: formData.sprint,
      storyPoint: Number(formData.storyPoints),
      tags: normalizeTagsForBackend(formData.tags),
    };

    setIsLoading(true);
    setError('');
    try {
      const backendIssue = await createIssue(payload);
      const uiIssue = mapBackendIssueToUiIssue(backendIssue);
      setIssues((prev) => [uiIssue, ...prev]);
      setIsCreateModalOpen(false);
    } catch (e) {
      setError(e?.message || 'Failed to create issue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e, issueId) => {
    e.dataTransfer.setData('issueId', String(issueId));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('issueId');
    const existing = issues.find((i) => String(i.id) === String(issueId));
    if (!existing) return;

    // Role gating: ASSIGNEE can only change status on issues assigned to them
    const userRole = (() => {
      try {
        const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw)?.role ?? null;
      } catch {
        return null;
      }
    })();

    const canEditStatus =
      userRole !== 'ASSIGNEE' || String(existing.assigneeId) === String(userId);

    if (!canEditStatus) {
      setError('You can only move your own assigned issues.');
      return;
    }

    const previousStatus = existing.status;

    // Optimistic UI update
    setIssues((prev) =>
      prev.map((i) => (String(i.id) === String(issueId) ? { ...i, status: newStatus } : i))
    );

    try {
      await updateIssueStatus(issueId, newStatus);

      // If backend accepted, we re-sync that issue status by re-fetching the list.
      // This avoids cases where backend normalizes/overwrites status values.
      setError('');
      const backendIssues = await getAllIssues8082();
      const mappedIssues = Array.isArray(backendIssues) ? backendIssues.map(mapBackendIssueToUiIssue) : [];

      const projectIds = new Set(projects.map((p) => String(p.projectId ?? p.id)));
      const relevantIssues = mappedIssues.filter((i) => {
        const projectMatch = projectIds.has(String(i.projectId));
        const ownerMatch = String(i.createdBy) === String(userId);
        return projectMatch || ownerMatch;
      });
      setIssues(relevantIssues);
    } catch (err) {
      const msg = err?.message || 'Failed to update issue status';
      setError(msg);
      // Rollback optimistic change
      setIssues((prev) => prev.map((i) => (String(i.id) === String(issueId) ? { ...i, status: previousStatus } : i)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issues</h1>
          <p className="mt-1 text-muted-foreground">Track and manage your issues</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Issue
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={String(project.projectId ?? project.id)} value={project.projectId ?? project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'kanban'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Columns className="w-4 h-4" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Issue</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Assignee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredIssues.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      {isLoading ? 'Loading issues...' : 'No issues found'}
                    </td>
                  </tr>
                )}
                {filteredIssues.map((issue) => {
                  const assignee = users.find((u) => String(u.userId) === String(issue.assigneeId));
                  const project = projects.find((p) => String(p.projectId ?? p.id) === String(issue.projectId));

                  return (
                    <tr key={issue.id} className="hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/issues/${issue.id}`} className="block">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">#{issue.id}</span>
                            <span className="text-xs text-muted-foreground">{project?.name}</span>
                          </div>
                          <p className="font-medium text-foreground hover:text-primary transition-colors">
                            {issue.summary}
                          </p>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <TypeBadge type={issue.type} />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={issue.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="py-3 px-4">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
                              <img
                                src={assignee.profileImage}
                                alt={assignee.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-foreground">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {issue.sprint || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((status) => {
            const columnIssues = filteredIssues.filter((i) => i.status === status);
            return (
              <div
                key={status}
                className="flex-shrink-0 w-72"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{statusLabels[status]}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {columnIssues.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px] p-2 rounded-lg bg-muted/30">
                  {columnIssues.map((issue) => {
                    const assignee = users.find((u) => String(u.userId) === String(issue.assigneeId));
                    return (
                      <Link
                        key={issue.id}
                        to={`/issues/${issue.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue.id)}
                        className="block p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TypeBadge type={issue.type} />
                          <span className="text-xs font-mono text-muted-foreground">#{issue.id}</span>
                        </div>
                        <p className="font-medium text-sm text-foreground mb-2 line-clamp-2">
                          {issue.summary}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {issue.tags.slice(0, 2).map((tag) => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                          {issue.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{issue.tags.length - 2}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <PriorityBadge priority={issue.priority} />
                          {assignee && (
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
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
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Issue"
        size="lg"
      >
        <IssueForm
          onSubmit={handleCreateIssue}
          onCancel={() => setIsCreateModalOpen(false)}
          defaultProjectId={defaultProjectId}
          projects={projects}
          assignees={assignees}
        />
      </Modal>
    </div>
  );
}

