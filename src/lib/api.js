import {
  registerUser as registerUser8080,
  loginUser as loginUser8080,
  getAllUsers as getAllUsers8080,
  getUserById as getUserById8080,
  getIssuesAssignedToAssignee as getIssuesAssignedToAssignee8080,
} from '../services/usersService';

import {
  createProject as createProject8081,
  updateProject as updateProject8081,
  getProjectsByOwner as getProjectsByOwner8081,
  getProjectById as getProjectById8081,
  deleteProject as deleteProject8081,
  getIssuesInProject as getIssuesInProject8081,
} from '../services/projectsService';

import {
  createIssue as createIssue8082,
  updateIssue as updateIssue8082,
  updateIssueStatus as updateIssueStatus8082,
  getIssueById as getIssueById8082Service,
  getAllIssues as getAllIssues8082Service,
  getIssuesByProjectId as getIssuesByProjectId8082Service,
  getIssuesByAssigneeId as getIssuesByAssigneeId8082Service,
  getIssuesByOwnerId as getIssuesByOwnerId8082Service,
} from '../services/issuesService';

function coerceTagsToArray(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function mapBackendStatusToUiStatus(status) {
  // DB statuses: TODO, DEVELOPMENT, TESTING, COMPLETED
  const map = {
    BACKLOG: 'TODO',
    TODO: 'TODO',
    IN_PROGRESS: 'DEVELOPMENT',
    DEVELOPMENT: 'DEVELOPMENT',
    IN_REVIEW: 'TESTING',
    TESTING: 'TESTING',
    DONE: 'COMPLETED',
    COMPLETED: 'COMPLETED',
    OPEN: 'TODO',
  };
  return map[status] || status;
}

// ----------------------
// 8080 - Users
// ----------------------
export async function registerUser(payload) {
  return registerUser8080(payload);
}

export async function loginUser(payload) {
  return loginUser8080(payload);
}

export async function getAllUsers() {
  return getAllUsers8080();
}

export async function getUserById(userId) {
  return getUserById8080(userId);
}

export async function getIssuesAssignedToAssignee(assigneeId) {
  return getIssuesAssignedToAssignee8080(assigneeId);
}

// ----------------------
// 8081 - Projects
// ----------------------
export async function createProject(payload) {
  return createProject8081(payload);
}

export async function updateProject(projectId, payload) {
  return updateProject8081(projectId, payload);
}

export async function getProjectsByOwner(userId) {
  return getProjectsByOwner8081(userId);
}

export async function getProjectById(projectId) {
  return getProjectById8081(projectId);
}

export async function deleteProject(projectId) {
  return deleteProject8081(projectId);
}

export async function getIssuesInProject(projectId) {
  return getIssuesInProject8081(projectId);
}

// ----------------------
// 8082 - Issues
// ----------------------
export async function createIssue(payload) {
  return createIssue8082(payload);
}

export async function updateIssue(issueId, payload) {
  return updateIssue8082(issueId, payload);
}

export async function updateIssueStatus(issueId, statusOrPayload) {
  const status = typeof statusOrPayload === 'string' ? statusOrPayload : statusOrPayload?.status;
  return updateIssueStatus8082(issueId, { status });
}

export async function getIssueById8082(issueId) {
  return getIssueById8082Service(issueId);
}

export async function getAllIssues8082() {
  return getAllIssues8082Service();
}

export async function getIssuesByProjectId8082(projectId) {
  return getIssuesByProjectId8082Service(projectId);
}

export async function getIssuesByAssigneeId8082(assigneeId) {
  return getIssuesByAssigneeId8082Service(assigneeId);
}

export async function getIssuesByOwnerId8082(userId) {
  return getIssuesByOwnerId8082Service(userId);
}

// ----------------------
// Mappers
// ----------------------
export function mapBackendUserToUiUser(backendUser) {
  if (!backendUser) return null;

  return {
    id: String(backendUser.userId ?? backendUser.id ?? ''),
    userId: backendUser.userId ?? backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    password: backendUser.password,
    role: backendUser.role,
    profileImage: backendUser.profile ?? backendUser.profileImage,
    profile: backendUser.profile ?? backendUser.profileImage,
    createdAt: backendUser.createdAt,
  };
}

export function mapBackendIssueToUiIssue(backendIssue) {
  if (!backendIssue) return null;

  return {
    id: String(backendIssue.issueId ?? backendIssue.id ?? ''),
    issueId: backendIssue.issueId ?? backendIssue.id,
    summary: backendIssue.summary,
    description: backendIssue.description ?? '',
    priority: backendIssue.priority,
    status: mapBackendStatusToUiStatus(backendIssue.status),
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

