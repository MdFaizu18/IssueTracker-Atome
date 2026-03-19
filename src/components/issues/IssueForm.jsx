import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const types = ['BUG', 'FEATURE', 'TASK', 'STORY', 'EPIC'];

export function IssueForm({
  issue,
  onSubmit,
  onCancel,
  defaultProjectId,
  projects = [],
  assignees = [],
}) {
  const initialProjectId =
    issue?.projectId ??
    defaultProjectId ??
    projects?.[0]?.projectId ??
    projects?.[0]?.id ??
    '';

  const initialAssigneeId = issue?.assigneeId ?? assignees?.[0]?.userId ?? assignees?.[0]?.id ?? '';

  const [formData, setFormData] = useState({
    summary: issue?.summary || '',
    description: issue?.description || '',
    priority: issue?.priority || 'MEDIUM',
    status: issue?.status || 'TODO',
    type: issue?.type || 'TASK',
    sprint: issue?.sprint || '',
    storyPoints: issue?.storyPoints || 0,
    tags: issue?.tags || [],
    assigneeId: issue?.assigneeId ?? initialAssigneeId,
    projectId: initialProjectId,
  });
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  useEffect(() => {
    // When editing different issues, keep the form in sync.
    if (!issue) return;
    setFormData({
      summary: issue?.summary || '',
      description: issue?.description || '',
      priority: issue?.priority || 'MEDIUM',
      status: issue?.status || 'TODO',
      type: issue?.type || 'TASK',
      sprint: issue?.sprint || '',
      storyPoints: issue?.storyPoints || 0,
      tags: issue?.tags || [],
      assigneeId: issue?.assigneeId ?? '',
      projectId: issue?.projectId ?? initialProjectId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue?.id]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="summary" className="text-sm font-medium text-foreground">
          Summary
        </label>
        <input
          id="summary"
          name="summary"
          type="text"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Issue summary"
          className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the issue in detail"
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-foreground">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium text-foreground">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority.charAt(0) + priority.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="projectId" className="text-sm font-medium text-foreground">
            Project
          </label>
          <select
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            required
          >
            {projects.length === 0 ? (
              <option value="">No projects available</option>
            ) : (
              projects.map((project) => {
                const projectBackendId = project.projectId ?? project.id;
                return (
                  <option key={String(projectBackendId)} value={projectBackendId}>
                    {project.name}
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="sprint" className="text-sm font-medium text-foreground">
            Sprint
          </label>
          <input
            id="sprint"
            name="sprint"
            type="text"
            value={formData.sprint}
            onChange={handleChange}
            placeholder="e.g., Sprint 5"
            className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="storyPoints" className="text-sm font-medium text-foreground">
            Story Points
          </label>
          <input
            id="storyPoints"
            name="storyPoints"
            type="number"
            min="0"
            max="21"
            value={formData.storyPoints}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="assigneeId" className="text-sm font-medium text-foreground">
          Assignee
        </label>
        <select
          id="assigneeId"
          name="assigneeId"
          value={formData.assigneeId}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        >
            {assignees.length === 0 ? (
              <option value="">No assignees available</option>
            ) : (
              assignees.map((assignee) => {
                const userBackendId = assignee.userId ?? assignee.id;
                return (
                  <option key={String(userBackendId)} value={userBackendId}>
                    {assignee.name}
                  </option>
                );
              })
            )}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-medium text-foreground">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type and press Enter to add tags"
          className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-accent text-accent-foreground"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {issue ? 'Save Changes' : 'Create Issue'}
        </button>
      </div>
    </form>
  );
}
