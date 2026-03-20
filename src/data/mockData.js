export const mockUsers = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@company.com',
    role: 'PROJECT_OWNER',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'ASSIGNEE',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'Mike Williams',
    email: 'mike@company.com',
    role: 'ASSIGNEE',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-02-10',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@company.com',
    role: 'PROJECT_OWNER',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-03-01',
  },
  {
    id: '5',
    name: 'James Brown',
    email: 'james@company.com',
    role: 'ASSIGNEE',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-03-15',
  },
];

export const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design and improved UX',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    ownerId: '1',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    startDate: '2024-02-15',
    endDate: '2024-09-30',
    ownerId: '4',
    createdAt: '2024-02-15',
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Third-party API integrations for payment and analytics',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    ownerId: '1',
    createdAt: '2024-03-01',
  },
  {
    id: '4',
    name: 'Database Migration',
    description: 'Migration from legacy database to cloud-based solution',
    startDate: '2024-04-01',
    endDate: '2024-07-31',
    ownerId: '4',
    createdAt: '2024-04-01',
  },
];

export const mockIssues = [
  {
    id: '1',
    summary: 'Fix navigation menu responsiveness',
    description: 'The navigation menu does not collapse properly on mobile devices. Need to implement a hamburger menu for screens smaller than 768px.',
    priority: 'HIGH',
    status: 'DEVELOPMENT',
    type: 'BUG',
    sprint: 'Sprint 5',
    storyPoints: 3,
    tags: ['frontend', 'responsive', 'urgent'],
    assigneeId: '2',
    projectId: '1',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-18',
  },
  {
    id: '2',
    summary: 'Implement user authentication',
    description: 'Add OAuth2 authentication with Google and GitHub providers. Include session management and secure token handling.',
    priority: 'URGENT',
    status: 'TODO',
    type: 'FEATURE',
    sprint: 'Sprint 5',
    storyPoints: 8,
    tags: ['backend', 'security', 'auth'],
    assigneeId: '3',
    projectId: '2',
    createdAt: '2024-03-14',
    updatedAt: '2024-03-14',
  },
  {
    id: '3',
    summary: 'Create dashboard analytics component',
    description: 'Build reusable analytics dashboard with charts for user metrics, page views, and conversion rates.',
    priority: 'MEDIUM',
    status: 'TESTING',
    type: 'FEATURE',
    sprint: 'Sprint 4',
    storyPoints: 5,
    tags: ['frontend', 'charts', 'analytics'],
    assigneeId: '2',
    projectId: '1',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-17',
  },
  {
    id: '4',
    summary: 'Optimize database queries',
    description: 'Review and optimize slow database queries identified in performance monitoring. Focus on N+1 query issues.',
    priority: 'HIGH',
    status: 'TODO',
    type: 'TASK',
    sprint: 'Sprint 6',
    storyPoints: 5,
    tags: ['backend', 'performance', 'database'],
    assigneeId: '5',
    projectId: '3',
    createdAt: '2024-03-12',
    updatedAt: '2024-03-12',
  },
  {
    id: '5',
    summary: 'Write API documentation',
    description: 'Document all REST API endpoints using OpenAPI specification. Include request/response examples.',
    priority: 'LOW',
    status: 'TODO',
    type: 'TASK',
    sprint: 'Sprint 5',
    storyPoints: 3,
    tags: ['documentation', 'api'],
    assigneeId: '3',
    projectId: '3',
    createdAt: '2024-03-13',
    updatedAt: '2024-03-13',
  },
  {
    id: '6',
    summary: 'User profile page redesign',
    description: 'Redesign the user profile page with new layout and add ability to edit profile information.',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    type: 'STORY',
    sprint: 'Sprint 4',
    storyPoints: 5,
    tags: ['frontend', 'ui', 'user-profile'],
    assigneeId: '2',
    projectId: '1',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-16',
  },
  {
    id: '7',
    summary: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment to staging and production environments.',
    priority: 'HIGH',
    status: 'DEVELOPMENT',
    type: 'TASK',
    sprint: 'Sprint 5',
    storyPoints: 8,
    tags: ['devops', 'ci-cd', 'automation'],
    assigneeId: '5',
    projectId: '2',
    createdAt: '2024-03-11',
    updatedAt: '2024-03-18',
  },
  {
    id: '8',
    summary: 'Implement payment gateway',
    description: 'Integrate Stripe payment gateway for subscription management and one-time purchases.',
    priority: 'URGENT',
    status: 'DEVELOPMENT',
    type: 'FEATURE',
    sprint: 'Sprint 5',
    storyPoints: 13,
    tags: ['backend', 'payments', 'stripe'],
    assigneeId: '3',
    projectId: '3',
    createdAt: '2024-03-08',
    updatedAt: '2024-03-18',
  },
  {
    id: '9',
    summary: 'Add email notification system',
    description: 'Build email notification service for user activities, password resets, and promotional campaigns.',
    priority: 'MEDIUM',
    status: 'TODO',
    type: 'FEATURE',
    sprint: 'Sprint 6',
    storyPoints: 8,
    tags: ['backend', 'email', 'notifications'],
    assigneeId: '5',
    projectId: '2',
    createdAt: '2024-03-09',
    updatedAt: '2024-03-09',
  },
  {
    id: '10',
    summary: 'Fix login page memory leak',
    description: 'Investigate and fix the memory leak occurring on the login page when users repeatedly fail authentication.',
    priority: 'HIGH',
    status: 'TODO',
    type: 'BUG',
    sprint: 'Sprint 5',
    storyPoints: 3,
    tags: ['frontend', 'bug', 'memory'],
    assigneeId: '2',
    projectId: '2',
    createdAt: '2024-03-17',
    updatedAt: '2024-03-17',
  },
];

// Helper functions
export function getUserById(id) {
  return mockUsers.find(user => user.id === id);
}

export function getProjectById(id) {
  return mockProjects.find(project => project.id === id);
}

export function getIssueById(id) {
  return mockIssues.find(issue => issue.id === id);
}

export function getIssuesByProject(projectId) {
  return mockIssues.filter(issue => issue.projectId === projectId);
}

export function getIssuesByAssignee(assigneeId) {
  return mockIssues.filter(issue => issue.assigneeId === assigneeId);
}

export function getProjectWithOwner(projectId) {
  const project = getProjectById(projectId);
  if (project) {
    return {
      ...project,
      owner: getUserById(project.ownerId),
    };
  }
  return undefined;
}

export function getIssueWithDetails(issueId) {
  const issue = getIssueById(issueId);
  if (issue) {
    return {
      ...issue,
      assignee: getUserById(issue.assigneeId),
      project: getProjectById(issue.projectId),
    };
  }
  return undefined;
}
