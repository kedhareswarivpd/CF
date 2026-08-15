import { apiRequest } from './client.js';

export function fetchMyProfile(token) {
  return apiRequest('/employees/me/profile', { token });
}

export function checkIn(token) {
  return apiRequest('/employees/me/attendance/check-in', { method: 'POST', token });
}

export function checkOut(token) {
  return apiRequest('/employees/me/attendance/check-out', { method: 'POST', token });
}

export function applyLeave(token, payload) {
  return apiRequest('/employees/me/leaves', { method: 'POST', token, body: payload });
}

export function submitTimesheet(token, payload) {
  return apiRequest('/employees/me/timesheets', { method: 'POST', token, body: payload });
}

export function fetchMyPayslips(token) {
  return apiRequest('/employees/me/payslips', { token });
}

export function fetchMyDocuments(token) {
  return apiRequest('/employees/me/documents', { token });
}

export function fetchMyPerformanceReviews(token) {
  return apiRequest('/employees/me/performance-reviews', { token });
}

export function fetchMyTrainingEnrollments(token) {
  return apiRequest('/trainings/my-enrollments', { token });
}

export function fetchTrainingCatalog(token) {
  return apiRequest('/trainings/courses?limit=50', { token });
}

export function enrollInCourse(token, courseId) {
  return apiRequest(`/trainings/enroll?course_id=${courseId}`, { method: 'POST', token });
}
