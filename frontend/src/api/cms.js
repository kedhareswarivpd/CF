import { apiRequest, toQueryString } from './client.js';

export function fetchIndustries(params = {}) {
  return apiRequest(`/industries${toQueryString({ is_published: true, ...params })}`);
}

export function fetchTechnologies(params = {}) {
  return apiRequest(`/technologies${toQueryString({ limit: 100, ...params })}`);
}

export function fetchProducts(params = {}) {
  return apiRequest(`/products${toQueryString({ is_published: true, ...params })}`);
}

export function fetchAwards(params = {}) {
  return apiRequest(`/awards${toQueryString({ is_published: true, ...params })}`);
}

export function fetchFaqs(params = {}) {
  return apiRequest(`/faqs${toQueryString({ is_published: true, ...params })}`);
}

export function fetchGallery(params = {}) {
  return apiRequest(`/gallery${toQueryString({ is_published: true, limit: 100, ...params })}`);
}

export function fetchPortfolio(params = {}) {
  return apiRequest(`/portfolio${toQueryString({ limit: 100, ...params })}`);
}

export function fetchResources(params = {}) {
  return apiRequest(`/resources${toQueryString({ is_published: true, limit: 100, ...params })}`);
}

export function fetchSolutions(params = {}) {
  return apiRequest(`/solutions${toQueryString({ is_published: true, ...params })}`);
}

export function fetchCaseStudies(params = {}) {
  return apiRequest(`/case-studies${toQueryString({ is_published: true, ...params })}`);
}

export function fetchDownloads(params = {}) {
  return apiRequest(`/downloads${toQueryString({ is_published: true, ...params })}`);
}

export function fetchCategories(params = {}) {
  return apiRequest(`/categories${toQueryString({ ...params })}`);
}

export function fetchTestimonials(params = {}) {
  return apiRequest(`/testimonials${toQueryString({ ...params })}`);
}

export function fetchPartners(params = {}) {
  return apiRequest(`/partners${toQueryString({ is_published: true, ...params })}`);
}

const crudApi = (endpoint) => ({
  list: (params = {}) => apiRequest(`${endpoint}${toQueryString({ limit: 100, ...params })}`),
  create: (body) => apiRequest(endpoint, { method: 'POST', body }),
  update: (id, body) => apiRequest(`${endpoint}/${id}`, { method: 'PUT', body }),
  remove: (id) => apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }),
});

export const servicesApi = crudApi('/services');
export const eventsApi = crudApi('/events');
export const blogsApi = crudApi('/blogs');
export const solutionsApi = crudApi('/solutions');
export const caseStudiesApi = crudApi('/case-studies');
export const downloadsApi = crudApi('/downloads');
export const industriesApi = crudApi('/industries');
export const technologiesApi = crudApi('/technologies');
export const productsApi = crudApi('/products');
export const awardsApi = crudApi('/awards');
export const faqsApi = crudApi('/faqs');
export const galleryApi = crudApi('/gallery');
export const portfolioApi = crudApi('/portfolio');
export const resourcesApi = crudApi('/resources');
export const categoriesApi = crudApi('/categories');
export const testimonialsApi = crudApi('/testimonials');
export const partnersApi = crudApi('/partners');
export const seoApi = crudApi('/seo');
export const pageContentApi = crudApi('/page-content');
export const careersApi = crudApi('/careers');

// Blog comments — public read (approved only, scoped to one post) and
// public create (rate-limited 5/min server-side); moderation itself is
// admin-only and lives in api/admin.js.
export function fetchBlogComments(blogId) {
  return apiRequest(`/comments${toQueryString({ blog_id: blogId, limit: 100 })}`);
}
export function submitComment(body) {
  return apiRequest('/comments', { method: 'POST', body });
}

// Newsletter — public subscribe/unsubscribe (rate-limited 5/min server-side).
export function subscribeNewsletter(body) {
  return apiRequest('/newsletter/subscribe', { method: 'POST', body });
}
