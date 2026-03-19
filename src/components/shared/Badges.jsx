import { cn } from '../../utils/cn';

const statusConfig = {
  BACKLOG: { label: 'Backlog', className: 'bg-muted text-muted-foreground' },
  TODO: { label: 'To Do', className: 'bg-info/20 text-info' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-warning/20 text-warning' },
  IN_REVIEW: { label: 'In Review', className: 'bg-chart-5/20 text-chart-5' },
  DONE: { label: 'Done', className: 'bg-success/20 text-success' },
};

export function StatusBadge({ status, className }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}

const priorityConfig = {
  LOW: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  MEDIUM: { label: 'Medium', className: 'bg-info/20 text-info' },
  HIGH: { label: 'High', className: 'bg-warning/20 text-warning' },
  URGENT: { label: 'Urgent', className: 'bg-destructive/20 text-destructive' },
};

export function PriorityBadge({ priority, className }) {
  const config = priorityConfig[priority];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}

const typeConfig = {
  BUG: { label: 'Bug', className: 'bg-destructive/20 text-destructive' },
  FEATURE: { label: 'Feature', className: 'bg-success/20 text-success' },
  TASK: { label: 'Task', className: 'bg-info/20 text-info' },
  STORY: { label: 'Story', className: 'bg-chart-5/20 text-chart-5' },
  EPIC: { label: 'Epic', className: 'bg-warning/20 text-warning' },
};

export function TypeBadge({ type, className }) {
  const config = typeConfig[type];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}

export function RoleBadge({ role, className }) {
  const isOwner = role === 'PROJECT_OWNER';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isOwner ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {isOwner ? 'Project Owner' : 'Assignee'}
    </span>
  );
}

export function TagBadge({ tag, className }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent text-accent-foreground', className)}>
      {tag}
    </span>
  );
}
