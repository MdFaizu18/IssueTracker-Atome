import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Plus, Pencil } from 'lucide-react';
import {
  getAllUsers,
  getIssuesInProject,
  getProjectById,
  mapBackendIssueToUiIssue,
  mapBackendProjectToUiProject,
  mapBackendUserToUiUser,
  updateProject,
} from '../lib/api';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/shared/Badges';
import { Modal } from '../components/shared/Modal';
import { ProjectForm } from '../components/projects/ProjectForm';

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const owner = useMemo(() => {
    if (!project) return null;
    return users.find((u) => String(u.userId) === String(project.ownerId)) ?? null;
  }, [project, users]);

  const completedIssues = useMemo(
    () => issues.filter((i) => i.status === 'DONE'),
    [issues]
  );
  const progress = useMemo(() => {
    if (!issues.length) return 0;
    return Math.round((completedIssues.length / issues.length) * 100);
  }, [issues.length, completedIssues.length]);

  const statusCounts = useMemo(
    () => ({
      BACKLOG: issues.filter((i) => i.status === 'BACKLOG').length,
      TODO: issues.filter((i) => i.status === 'TODO').length,
      IN_PROGRESS: issues.filter((i) => i.status === 'IN_PROGRESS').length,
      IN_REVIEW: issues.filter((i) => i.status === 'IN_REVIEW').length,
      DONE: issues.filter((i) => i.status === 'DONE').length,
    }),
    [issues]
  );

  const refresh = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [backendUsers, backendProject, backendIssues] = await Promise.all([
        getAllUsers(),
        getProjectById(id),
        getIssuesInProject(id),
      ]);

      setUsers(Array.isArray(backendUsers) ? backendUsers.map(mapBackendUserToUiUser) : []);
      setProject(mapBackendProjectToUiProject(backendProject));
      setIssues(Array.isArray(backendIssues) ? backendIssues.map(mapBackendIssueToUiIssue) : []);
    } catch (e) {
      setError(e?.message || 'Failed to load project');
      setProject(null);
      setIssues([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEditProject = async (data) => {
    if (!project) return;
    setIsLoading(true);
    setError('');
    try {
      const backend = await updateProject(project.projectId ?? project.id, {
        projectName: data.projectName,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      setProject(mapBackendProjectToUiProject(backend));
      setIsEditModalOpen(false);
      await refresh();
    } catch (e) {
      setError(e?.message || 'Failed to update project');
      setIsLoading(false);
    }
  };

  if (isLoading && !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
        <Link to="/projects" className="mt-4 text-primary hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Link to="/projects" className="mt-4 text-primary hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground max-w-2xl">{project.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <Link
            to={`/issues?project=${project.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Issue
          </Link>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium text-foreground">{new Date(project.startDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium text-foreground">{new Date(project.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              {/* Owner name is resolved by matching projectOwner(userId) with users.userId */}
              <p className="font-medium text-foreground">{owner?.name || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold text-foreground mt-1">{progress}%</p>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="rounded-xl bg-card border border-border p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <StatusBadge status={status} className="mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="rounded-xl bg-card border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Project Issues</h2>
          <span className="text-sm text-muted-foreground">{issues.length} issues</span>
        </div>
        <div className="divide-y divide-border">
          {issues.length > 0 ? (
            issues.map((issue) => {
              const assignee = users.find((u) => String(u.userId) === String(issue.assigneeId)) ?? null;

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
                    </div>
                    <p className="mt-1 font-medium text-foreground truncate">{issue.summary}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{issue.sprint}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
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
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">No issues found for this project</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
        size="lg"
      >
        <ProjectForm project={project} onSubmit={handleEditProject} onCancel={() => setIsEditModalOpen(false)} />
      </Modal>
    </div>
  );
}

