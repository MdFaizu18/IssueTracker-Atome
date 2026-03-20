import axios from 'axios';

const usersApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function registerUser({ name, email, password, role, profile }) {
  const res = await usersApi.post('/users', { name, email, password, role, profile });
  return res.data;
}

export async function loginUser({ email, password }) {
  const res = await usersApi.post('/users/login', { email, password });
  return res.data;
}

export async function getAllUsers() {
  const res = await usersApi.get('/users');
  return res.data;
}

export async function getUserById(userId) {
  const res = await usersApi.get(`/users/${userId}`);
  return res.data;
}

// Note: current code uses issues microservice (8082) for this, but we keep 8080 here too.
export async function getIssuesAssignedToAssignee(assigneeId) {
  const res = await usersApi.get(`/users/${assigneeId}/issues`);
  return res.data;
}

