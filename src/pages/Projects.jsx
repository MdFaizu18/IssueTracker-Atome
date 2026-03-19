import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Modal } from '../components/shared/Modal';
import { ProjectForm } from '../components/projects/ProjectForm';
import {
  createProject,
  deleteProject,
  getAllUsers,
  getIssuesInProject,
  getProjectsByOwner,
  mapBackendIssueToUiIssue,
  mapBackendProjectToUiProject,
  mapBackendUserToUiUser,
  updateProject,
} from '../lib/api';

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

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [users, setUsers] = useState([]);
  const [projectStatsById, setProjectStatsById] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name?.toLowerCase().includes(q) ||
        project.description?.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const refresh = async () => {
    const userId = getUserIdFromLocalStorage();
    if (!userId) return;

    setIsLoading(true);
    setError('');
    try {
      const [backendUsers, backendProjects] = await Promise.all([getAllUsers(), getProjectsByOwner(userId)]);
      const mappedUsers = Array.isArray(backendUsers) ? backendUsers.map(mapBackendUserToUiUser) : [];
      const mappedProjects = Array.isArray(backendProjects)
        ? backendProjects.map(mapBackendProjectToUiProject)
        : [];

      setUsers(mappedUsers);
      setProjects(mappedProjects);

      const statsResults = await Promise.all(
        mappedProjects.map(async (p) => {
          const backendIssues = await getIssuesInProject(p.projectId ?? p.id);
          const uiIssues = Array.isArray(backendIssues) ? backendIssues.map(mapBackendIssueToUiIssue) : [];
          const issuesCount = uiIssues.length;
          const completedCount = uiIssues.filter((i) => i.status === 'DONE').length;
          const progress = issuesCount > 0 ? Math.round((completedCount / issuesCount) * 100) : 0;
          return { projectId: p.projectId ?? p.id, issuesCount, progress };
        })
      );

      const statsMap = {};
      for (const s of statsResults) {
        statsMap[String(s.projectId)] = { issuesCount: s.issuesCount, progress: s.progress };
      }
      setProjectStatsById(statsMap);
    } catch (e) {
      setError(e?.message || 'Failed to load projects');
      setProjects([]);
      setUsers([]);
      setProjectStatsById({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateProject = async (data) => {
    const userId = getUserIdFromLocalStorage();
    if (!userId) return;

    setIsLoading(true);
    setError('');
    try {
      const backend = await createProject({
        projectOwner: userId,
        projectName: data.projectName,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      const created = mapBackendProjectToUiProject(backend);
      setProjects((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      await refresh();
    } catch (e) {
      setError(e?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = async (data) => {
    if (!editingProject) return;
    setIsLoading(true);
    setError('');
    try {
      const backend = await updateProject(editingProject.projectId ?? editingProject.id, {
        projectName: data.projectName,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      const updated = mapBackendProjectToUiProject(backend);
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditingProject(null);
      setIsLoading(false);
      await refresh();
    } catch (e) {
      setError(e?.message || 'Failed to update project');
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setIsLoading(true);
    setError('');
    try {
      await deleteProject(projectId);
      setActiveDropdown(null);
      await refresh();
    } catch (e) {
      setError(e?.message || 'Failed to delete project');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track all your projects
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm transition-all"
        />
      </div>

      {/* Projects Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Project Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Start Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">End Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Owner</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Issues</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Loading projects...
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                const owner = users.find((u) => String(u.userId) === String(project.ownerId));
                const stats = projectStatsById[String(project.projectId ?? project.id)] || {
                  issuesCount: 0,
                  progress: 0,
                };

                return (
                  <tr key={project.id} className="hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/projects/${project.id}`} className="font-medium text-foreground hover:text-primary">
                        {project.name}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {project.description}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {owner ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-muted">
                            <img src={owner.profileImage} alt={owner.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm text-foreground">{owner.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unknown</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-foreground">{stats.issuesCount}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${stats.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{stats.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === project.id ? null : project.id)}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {activeDropdown === project.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setActiveDropdown(null)} 
                            />
                            <div className="absolute right-0 mt-1 w-40 rounded-lg bg-popover border border-border shadow-lg z-50">
                              <div className="p-1">
                                <Link
                                  to={`/projects/${project.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md hover:bg-accent transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Link>
                                <button
                                  onClick={() => {
                                    setEditingProject(project);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md hover:bg-accent transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredProjects.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No projects found
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        size="lg"
      >
        <ProjectForm onSubmit={handleCreateProject} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        size="lg"
      >
        {editingProject && (
          <ProjectForm 
            project={editingProject} 
            onSubmit={handleEditProject} 
            onCancel={() => setEditingProject(null)} 
          />
        )}
      </Modal>
    </div>
  );
}
