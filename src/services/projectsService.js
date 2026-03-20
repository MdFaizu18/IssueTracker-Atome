import axios from 'axios';

const projectsApi = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function createProject({ projectOwner, projectName, startDate, endDate }) {
  const res = await projectsApi.post('/projects', {
    projectOwner,
    projectName,
    startDate,
    endDate,
  });
  return res.data;
}

export async function updateProject(projectId, { projectName, startDate, endDate }) {
  const res = await projectsApi.put(`/projects/${projectId}`, {
    projectName,
    startDate,
    endDate,
  });
  return res.data;
}

export async function getProjectsByOwner(userId) {
  const res = await projectsApi.get(`/projects/owner/${userId}`);
  return res.data;
}

export async function getProjectById(projectId) {
  const res = await projectsApi.get(`/projects/${projectId}`);
  return res.data;
}

export async function deleteProject(projectId) {
  const res = await projectsApi.delete(`/projects/${projectId}`);
  return res.data;
}

export async function getIssuesInProject(projectId) {
  const res = await projectsApi.get(`/projects/${projectId}/issues`);
  return res.data;
}

