import axios from 'axios';

const issuesApi = axios.create({
  baseURL: 'http://localhost:8082/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function createIssue({
  assignee,
  createdBy,
  projectId,
  summary,
  description,
  priority,
  status,
  type,
  sprint,
  storyPoint,
  tags,
}) {
  const res = await issuesApi.post('/issues', {
    assignee,
    createdBy,
    projectId,
    summary,
    description,
    priority,
    status,
    type,
    sprint,
    storyPoint,
    tags,
  });
  return res.data;
}

export async function updateIssue(issueId, { assignee, summary, description, priority, status, type, sprint, storyPoint, tags }) {
  const res = await issuesApi.put(`/issues/${issueId}`, {
    assignee,
    summary,
    description,
    priority,
    status,
    type,
    sprint,
    storyPoint,
    tags,
  });
  return res.data;
}

// Status-only update (what your kanban needs)
export async function updateIssueStatus(issueId, { status }) {
  const res = await issuesApi.put(`/issues/${issueId}`, { status });
  return res.data;
}

export async function getIssueById(issueId) {
  const res = await issuesApi.get(`/issues/${issueId}`);
  return res.data;
}

export async function getAllIssues() {
  const res = await issuesApi.get('/issues');
  return res.data;
}

export async function getIssuesByProjectId(projectId) {
  const res = await issuesApi.get(`/issues/project/${projectId}`);
  return res.data;
}

export async function getIssuesByAssigneeId(assigneeId) {
  const res = await issuesApi.get(`/issues/assignee/${assigneeId}`);
  return res.data;
}

export async function getIssuesByOwnerId(userId) {
  const res = await issuesApi.get(`/issues/owner/${userId}`);
  return res.data;
}

