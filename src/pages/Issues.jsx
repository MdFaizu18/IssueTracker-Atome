import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, List, Columns, Filter } from 'lucide-react';
import { mockIssues, mockProjects, getUserById } from '../data/mockData';
import { StatusBadge, PriorityBadge, TypeBadge, TagBadge } from '../components/shared/Badges';
import { Modal } from '../components/shared/Modal';
import { IssueForm } from '../components/issues/IssueForm';
import { cn } from '../utils/cn';

const statusColumns = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const statusLabels = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export default function IssuesPage() {
  const [issues, setIssues] = useState(mockIssues);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterProject, setFilterProject] = useState('');

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !filterProject || issue.projectId === filterProject;
    return matchesSearch && matchesProject;
  });

  const handleCreateIssue = (data) => {
    const newIssue = {
      id: String(issues.length + 1),
      summary: data.summary || '',
      description: data.description || '',
      priority: data.priority || 'MEDIUM',
      status: data.status || 'TODO',
      type: data.type || 'TASK',
      sprint: data.sprint || '',
      storyPoints: data.storyPoints || 0,
      tags: data.tags || [],
      assigneeId: data.assigneeId || '',
      projectId: data.projectId || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setIssues([...issues, newIssue]);
    setIsCreateModalOpen(false);
  };

  const handleDragStart = (e, issueId) => {
    e.dataTransfer.setData('issueId', issueId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('issueId');
    setIssues(issues.map(issue =>
      issue.id === issueId ? { ...issue, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : issue
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issues</h1>
          <p className="mt-1 text-muted-foreground">
            Track and manage all project issues
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Issue
        </button>
      </div>

      {/* Filters and View Toggle */}
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
              {mockProjects.map(project => (
                <option key={project.id} value={project.id}>
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
                viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'kanban' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Columns className="w-4 h-4" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
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
                {filteredIssues.map((issue) => {
                  const assignee = getUserById(issue.assigneeId);
                  const project = mockProjects.find(p => p.id === issue.projectId);
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
          {filteredIssues.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No issues found
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((status) => {
            const columnIssues = filteredIssues.filter(i => i.status === status);
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
                    const assignee = getUserById(issue.assigneeId);
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
                          {issue.tags.slice(0, 2).map(tag => (
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Issue"
        size="lg"
      >
        <IssueForm onSubmit={handleCreateIssue} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
}
