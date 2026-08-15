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

const crudWithToken = (endpoint) => ({
  list: (token, params = {}) => apiRequest(`${endpoint}${toQueryString({ limit: 100, ...params })}`, { token }),
  create: (token, body) => apiRequest(endpoint, { method: 'POST', body, token }),
  update: (token, id, body) => apiRequest(`${endpoint}/${id}`, { method: 'PUT', body, token }),
  remove: (token, id) => apiRequest(`${endpoint}/${id}`, { method: 'DELETE', token }),
});

export const servicesApi = crudWithToken('/services');
export const eventsApi = crudWithToken('/events');
export const blogsApi = crudWithToken('/blogs');
export const solutionsApi = crudWithToken('/solutions');
export const caseStudiesApi = crudWithToken('/case-studies');
export const downloadsApi = crudWithToken('/downloads');
export const industriesApi = crudWithToken('/industries');
export const technologiesApi = crudWithToken('/technologies');
export const productsApi = crudWithToken('/products');
export const awardsApi = crudWithToken('/awards');
export const faqsApi = crudWithToken('/faqs');
export const galleryApi = crudWithToken('/gallery');
export const portfolioApi = crudWithToken('/portfolio');
export const resourcesApi = crudWithToken('/resources');
export const categoriesApi = crudWithToken('/categories');
export const testimonialsApi = crudWithToken('/testimonials');
export const partnersApi = crudWithToken('/partners');
