import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Calendar, User, FolderKanban, Hash, Clock, Zap } from 'lucide-react';
import {
  getAllUsers,
  getIssueById8082,
  getProjectsByOwner,
  mapBackendIssueToUiIssue,
  mapBackendProjectToUiProject,
  mapBackendUserToUiUser,
  updateIssue,
} from '../lib/api';
import { StatusBadge, PriorityBadge, TypeBadge, TagBadge } from '../components/shared/Badges';
import { Modal } from '../components/shared/Modal';
import { IssueForm } from '../components/issues/IssueForm';

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

function normalizeTagsForBackend(tags) {
  if (!tags) return '';
  if (Array.isArray(tags)) return tags.join(',');
  return String(tags);
}

export default function IssueDetailsPage() {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = useMemo(() => getUserIdFromLocalStorage(), []);
  const assignees = useMemo(() => users.filter((u) => u.role === 'ASSIGNEE'), [users]);

  const ownerProject = useMemo(() => {
    if (!issue) return null;
    return projects.find((p) => String(p.projectId ?? p.id) === String(issue.projectId)) ?? null;
  }, [issue, projects]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const [backendIssue, backendProjects, backendUsers] = await Promise.all([
          getIssueById8082(id),
          getProjectsByOwner(userId),
          getAllUsers(),
        ]);

        if (cancelled) return;
        setIssue(mapBackendIssueToUiIssue(backendIssue));
        setProjects(Array.isArray(backendProjects) ? backendProjects.map(mapBackendProjectToUiProject) : []);
        setUsers(Array.isArray(backendUsers) ? backendUsers.map(mapBackendUserToUiUser) : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load issue');
        setIssue(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (!id) return;
    if (!userId) return;
    load();

    return () => {
      cancelled = true;
    };
  }, [id, userId]);

  const assignee = useMemo(() => {
    if (!issue) return null;
    return users.find((u) => String(u.userId) === String(issue.assigneeId)) ?? null;
  }, [issue, users]);

  const handleEditIssue = async (formData) => {
    if (!issue) return;
    if (!userId) return;

    const payload = {
      assignee: formData.assigneeId ? Number(formData.assigneeId) : null,
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
      const backend = await updateIssue(issue.id, payload);
      const updated = mapBackendIssueToUiIssue(backend);
      setIssue(updated);
      setIsEditModalOpen(false);
    } catch (e) {
      setError(e?.message || 'Failed to update issue');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !issue) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Loading issue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
        <Link to="/issues" className="mt-4 text-primary hover:underline">
          Back to Issues
        </Link>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Issue not found</p>
        <Link to="/issues" className="mt-4 text-primary hover:underline">
          Back to Issues
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/issues"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Issues
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-muted-foreground">#{issue.id}</span>
            <TypeBadge type={issue.type} />
            <PriorityBadge priority={issue.priority} />
            <StatusBadge status={issue.status} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{issue.summary}</h1>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit Issue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-card border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{issue.description}</p>
          </div>

          {issue.tags.length > 0 && (
            <div className="rounded-xl bg-card border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {issue.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-card border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Issue created</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(issue.createdAt).toLocaleDateString()} at{' '}
                    {new Date(issue.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Last updated</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(issue.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(issue.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <User className="w-4 h-4" />
              Assignee
            </div>
            {assignee ? (
              <Link
                to={`/users/${assignee.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <img src={assignee.profileImage} alt={assignee.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{assignee.name}</p>
                  <p className="text-sm text-muted-foreground">{assignee.email}</p>
                </div>
              </Link>
            ) : (
              <p className="text-muted-foreground">Unassigned</p>
            )}
          </div>

          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <FolderKanban className="w-4 h-4" />
              Project
            </div>
            {ownerProject ? (
              <Link
                to={`/projects/${ownerProject.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{ownerProject.name}</p>
                </div>
              </Link>
            ) : (
              <p className="text-muted-foreground">No project</p>
            )}
          </div>

          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Hash className="w-4 h-4" />
              Sprint
            </div>
            <p className="font-medium text-foreground">{issue.sprint || 'Not assigned'}</p>
          </div>

          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Zap className="w-4 h-4" />
              Story Points
            </div>
            <p className="text-2xl font-bold text-foreground">{issue.storyPoints}</p>
          </div>

          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="w-4 h-4" />
              Dates
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span className="text-foreground">{new Date(issue.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Issue"
        size="lg"
      >
        <IssueForm
          issue={issue}
          onSubmit={handleEditIssue}
          onCancel={() => setIsEditModalOpen(false)}
          defaultProjectId={issue.projectId}
          projects={projects}
          assignees={assignees}
        />
      </Modal>
    </div>
  );
}

