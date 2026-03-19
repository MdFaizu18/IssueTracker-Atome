import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { mockProjects, mockIssues, getUserById } from '../data/mockData';
import { Modal } from '../components/shared/Modal';
import { ProjectForm } from '../components/projects/ProjectForm';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projects, setProjects] = useState(mockProjects);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = (data) => {
    const newProject = {
      id: String(projects.length + 1),
      name: data.name || '',
      description: data.description || '',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '',
      ownerId: data.ownerId || '1',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects([...projects, newProject]);
    setIsCreateModalOpen(false);
  };

  const handleEditProject = (data) => {
    if (editingProject) {
      setProjects(projects.map(p => 
        p.id === editingProject.id ? { ...p, ...data } : p
      ));
      setEditingProject(null);
    }
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
    setActiveDropdown(null);
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
              {filteredProjects.map((project) => {
                const owner = getUserById(project.ownerId);
                const projectIssues = mockIssues.filter(i => i.projectId === project.id);
                const completedIssues = projectIssues.filter(i => i.status === 'DONE');
                const progress = projectIssues.length > 0 
                  ? Math.round((completedIssues.length / projectIssues.length) * 100) 
                  : 0;

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
                      {owner && (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-muted">
                            <img
                              src={owner.profileImage}
                              alt={owner.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm text-foreground">{owner.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-foreground">{projectIssues.length}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
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
              })}
            </tbody>
          </table>
        </div>
        {filteredProjects.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No projects found
          </div>
        )}
      </div>

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
