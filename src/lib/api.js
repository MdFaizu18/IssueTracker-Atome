const API_BASE_URL = 'http://localhost:8080/api';
const PROJECTS_API_BASE_URL = 'http://localhost:8081/api';

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function apiRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  const data = contentType.includes('application/json') ? safeJsonParse(text) : text;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (typeof data === 'string' ? data : null) ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function apiRequestFrom(baseUrl, path, { method = 'GET', body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  const data = contentType.includes('application/json') ? safeJsonParse(text) : text;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (typeof data === 'string' ? data : null) ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function registerUser({ name, email, password, role, profile }) {
  return apiRequest('/users', {
    method: 'POST',
    body: { name, email, password, role, profile },
  });
}

export async function loginUser({ email, password }) {
  return apiRequest('/users/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function getAllUsers() {
  return apiRequest('/users', { method: 'GET' });
}

export async function getUserById(userId) {
  return apiRequest(`/users/${userId}`, { method: 'GET' });
}

export async function getIssuesAssignedToAssignee(assigneeId) {
  return apiRequest(`/users/${assigneeId}/issues`, { method: 'GET' });
}

// Projects microservice (8081)
export async function createProject({ projectOwner, projectName, startDate, endDate }) {
  return apiRequestFrom(PROJECTS_API_BASE_URL, '/projects', {
    method: 'POST',
    body: { projectOwner, projectName, startDate, endDate },
  });
}

export async function updateProject(projectId, { projectName, startDate, endDate }) {
  return apiRequestFrom(PROJECTS_API_BASE_URL, `/projects/${projectId}`, {
    method: 'PUT',
    body: { projectName, startDate, endDate },
  });
}

export async function getProjectsByOwner(userId) {
  return apiRequestFrom(PROJECTS_API_BASE_URL, `/projects/owner/${userId}`, { method: 'GET' });
}

export async function getProjectById(projectId) {
  return apiRequestFrom(PROJECTS_API_BASE_URL, `/projects/${projectId}`, { method: 'GET' });
}

export async function deleteProject(projectId) {
  return apiRequestFrom(PROJECTS_API_BASE_URL, `/projects/${projectId}`, { method: 'DELETE' });
}

export async function getIssuesInProject(projectId) {
  return apiRequestFrom(PROJECTS_API_BASE_URL, `/projects/${projectId}/issues`, { method: 'GET' });
}

export function mapBackendUserToUiUser(backendUser) {
  if (!backendUser) return null;

  return {
    // UI expects `id` (string) but backend returns `userId` (number)
    id: String(backendUser.userId ?? backendUser.id ?? ''),
    userId: backendUser.userId ?? backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    // Keeping password to match your requirement (backend response includes it).
    password: backendUser.password,
    role: backendUser.role,
    profileImage: backendUser.profile ?? backendUser.profileImage,
    profile: backendUser.profile ?? backendUser.profileImage,
    createdAt: backendUser.createdAt,
  };
}

function coerceTagsToArray(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === 'string') {
    // Accept either "a,b,c" or "a"
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export function mapBackendIssueToUiIssue(backendIssue) {
  if (!backendIssue) return null;

  return {
    id: String(backendIssue.issueId ?? backendIssue.id ?? ''),
    issueId: backendIssue.issueId ?? backendIssue.id,
    summary: backendIssue.summary,
    description: backendIssue.description ?? '',
    priority: backendIssue.priority,
    status: backendIssue.status,
    type: backendIssue.type,
    sprint: backendIssue.sprint,
    storyPoints: backendIssue.storyPoint ?? backendIssue.storyPoints,
    tags: coerceTagsToArray(backendIssue.tags),
    assigneeId: backendIssue.assignee,
    createdBy: backendIssue.createdBy,
    projectId: backendIssue.projectId,
    createdAt: backendIssue.createdOn ?? backendIssue.createdAt,
    updatedAt: backendIssue.lastUpdated ?? backendIssue.updatedAt,
  };
}

export function mapBackendProjectToUiProject(backendProject) {
  if (!backendProject) return null;

  return {
    id: String(backendProject.projectId ?? backendProject.id ?? ''),
    projectId: backendProject.projectId ?? backendProject.id,
    ownerId: backendProject.projectOwner ?? backendProject.ownerId ?? '',
    name: backendProject.projectName ?? backendProject.name ?? '',
    startDate: backendProject.startDate ?? '',
    endDate: backendProject.endDate ?? '',
    description: backendProject.description ?? '',
  };
}

