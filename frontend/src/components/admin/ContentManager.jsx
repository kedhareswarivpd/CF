import { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import {
  servicesApi, eventsApi, blogsApi, solutionsApi, caseStudiesApi, downloadsApi,
  industriesApi, technologiesApi, productsApi, awardsApi, faqsApi, galleryApi,
  portfolioApi, resourcesApi, testimonialsApi, categoriesApi, partnersApi,
} from '../../api/cms.js';

import { FORM_INPUT_CLASS as BASE_INPUT_CLASS } from '../ui/formClasses.js';

const FORM_INPUT_CLASS = `${BASE_INPUT_CLASS} w-full`;

const TEXT = { kind: 'text' };
const TEXTAREA = { kind: 'textarea' };
const NUMBER = { kind: 'number' };
const PUBLISHED = { name: 'is_published', label: 'Published', kind: 'checkbox' };

const RESOURCES = [
  {
    key: 'services', label: 'Services', icon: 'settings', api: servicesApi,
    title: (i) => i.name, fields: [
      { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'icon', label: 'Icon', ...TEXT }, { name: 'overview', label: 'Overview', ...TEXTAREA },
      { name: 'features', label: 'Features (one per line)', kind: 'list' },
      { name: 'benefits', label: 'Benefits (one per line)', kind: 'list' }, PUBLISHED,
    ],
  },
  {
    key: 'solutions', label: 'Solutions', icon: 'cloud', api: solutionsApi,
    title: (i) => i.name, fields: [
      { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'icon', label: 'Icon', ...TEXT }, { name: 'overview', label: 'Overview', ...TEXTAREA },
      { name: 'approach', label: 'Approach (one per line)', kind: 'list' },
      { name: 'related_industries', label: 'Related industries (comma-separated)', kind: 'list' }, PUBLISHED,
    ],
  },
  {
    key: 'caseStudies', label: 'Case Studies', icon: 'description', api: caseStudiesApi,
    title: (i) => i.title, fields: [
      { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'client_name', label: 'Client name', ...TEXT }, { name: 'industry', label: 'Industry', ...TEXT },
      { name: 'problem', label: 'Problem', ...TEXTAREA }, { name: 'solution', label: 'Solution', ...TEXTAREA },
      { name: 'result', label: 'Result', ...TEXTAREA }, { name: 'roi', label: 'ROI', ...TEXTAREA }, PUBLISHED,
    ],
  },
  {
    key: 'blogs', label: 'Blog Posts', icon: 'article', api: blogsApi,
    title: (i) => i.title, fields: [
      { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'excerpt', label: 'Excerpt', ...TEXTAREA }, { name: 'content', label: 'Content', ...TEXTAREA },
      { name: 'tags', label: 'Tags (one per line)', kind: 'list' },
      { name: 'status', label: 'Status', kind: 'select', options: ['draft', 'published', 'archived'] },
    ],
  },
  {
    key: 'events', label: 'Events', icon: 'event', api: eventsApi,
    title: (i) => i.title, fields: [
      { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'description', label: 'Description', ...TEXTAREA }, { name: 'location', label: 'Location', ...TEXT },
      { name: 'start_date', label: 'Start date', kind: 'datetime' }, { name: 'end_date', label: 'End date', kind: 'datetime' },
      { name: 'is_virtual', label: 'Virtual event', kind: 'checkbox' }, PUBLISHED,
    ],
  },
  {
    key: 'downloads', label: 'Downloads', icon: 'download', api: downloadsApi,
    title: (i) => i.title, fields: [
      { name: 'title', label: 'Title', ...TEXT }, { name: 'description', label: 'Description', ...TEXTAREA },
      { name: 'file_url', label: 'File URL', ...TEXT }, { name: 'file_type', label: 'File type (e.g. PDF)', ...TEXT },
      { name: 'category', label: 'Category', ...TEXT }, { name: 'requires_lead', label: 'Requires lead capture', kind: 'checkbox' }, PUBLISHED,
    ],
  },
  {
    key: 'industries', label: 'Industries', icon: 'business', api: industriesApi,
    title: (i) => i.name, fields: [
      { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'icon', label: 'Icon', ...TEXT }, { name: 'description', label: 'Description', ...TEXTAREA }, PUBLISHED,
    ],
  },
  {
    key: 'technologies', label: 'Technologies', icon: 'code', api: technologiesApi,
    title: (i) => i.name, fields: [
      { name: 'name', label: 'Name', ...TEXT },
      { name: 'category', label: 'Category', kind: 'select', options: ['frontend', 'backend', 'database', 'cloud', 'devops', 'ai_ml', 'mobile', 'other'] },
      { name: 'logo', label: 'Logo URL', ...TEXT }, { name: 'description', label: 'Description', ...TEXTAREA },
    ],
  },
  {
    key: 'products', label: 'Products', icon: 'inventory_2', api: productsApi,
    title: (i) => i.name, fields: [
      { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'tagline', label: 'Tagline', ...TEXT }, { name: 'icon', label: 'Icon', ...TEXT },
      { name: 'description', label: 'Description', ...TEXTAREA },
      { name: 'features', label: 'Features (one per line)', kind: 'list' }, PUBLISHED,
    ],
  },
  {
    key: 'awards', label: 'Awards', icon: 'trophy', api: awardsApi,
    title: (i) => i.title, fields: [
      { name: 'title', label: 'Title', ...TEXT }, { name: 'issued_by', label: 'Issued by', ...TEXT },
      { name: 'year', label: 'Year', ...NUMBER }, { name: 'description', label: 'Description', ...TEXTAREA }, PUBLISHED,
    ],
  },
  {
    key: 'faqs', label: 'FAQ', icon: 'help_outline', api: faqsApi,
    title: (i) => i.question, fields: [
      { name: 'question', label: 'Question', ...TEXT }, { name: 'answer', label: 'Answer', ...TEXTAREA },
      { name: 'category', label: 'Category', ...TEXT }, { name: 'order', label: 'Order', ...NUMBER }, PUBLISHED,
    ],
  },
  {
    key: 'gallery', label: 'Gallery', icon: 'photo_library', api: galleryApi,
    title: (i) => i.title || i.image_url, fields: [
      { name: 'title', label: 'Caption', ...TEXT }, { name: 'image_url', label: 'Image URL', ...TEXT },
      { name: 'album_name', label: 'Album name', ...TEXT },
      { name: 'type', label: 'Type', kind: 'select', options: ['image', 'video'] }, PUBLISHED,
    ],
  },
  {
    key: 'portfolio', label: 'Portfolio', icon: 'folder', api: portfolioApi,
    title: (i) => i.title, fields: [
      { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'category', label: 'Category', ...TEXT }, { name: 'thumbnail', label: 'Thumbnail URL', ...TEXT },
      { name: 'description', label: 'Description', ...TEXTAREA },
      { name: 'is_featured', label: 'Featured', kind: 'checkbox' }, { name: 'order', label: 'Order', ...NUMBER },
    ],
  },
  {
    key: 'resources', label: 'Resources', icon: 'menu_book', api: resourcesApi,
    title: (i) => i.title, fields: [
      { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'resource_type', label: 'Type', ...TEXT }, { name: 'description', label: 'Description', ...TEXTAREA },
      { name: 'file_url', label: 'File URL', ...TEXT }, PUBLISHED,
    ],
  },
  {
    key: 'testimonials', label: 'Testimonials', icon: 'rate_review', api: testimonialsApi,
    title: (i) => i.author_name, fields: [
      { name: 'author_name', label: 'Author', ...TEXT }, { name: 'author_title', label: 'Title', ...TEXT },
      { name: 'company_name', label: 'Company', ...TEXT }, { name: 'content', label: 'Content', ...TEXTAREA },
      { name: 'rating', label: 'Rating (1-5)', ...NUMBER }, PUBLISHED,
    ],
  },
  {
    key: 'categories', label: 'Categories', icon: 'label', api: categoriesApi,
    title: (i) => i.name, fields: [
      { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
      { name: 'type', label: 'Type', kind: 'select', options: ['blog', 'gallery', 'download', 'event'] },
    ],
  },
  {
    key: 'partners', label: 'Partners', icon: 'handshake', api: partnersApi,
    title: (i) => i.name, fields: [
      { name: 'name', label: 'Name', ...TEXT }, { name: 'logo', label: 'Logo URL', ...TEXT },
      { name: 'website', label: 'Website', ...TEXT },
      { name: 'type', label: 'Type', kind: 'select', options: ['technology_partner', 'business_partner', 'reseller'] }, PUBLISHED,
    ],
  },
];

function splitList(value) {
  return String(value ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinList(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function toForm(item, fields) {
  const form = {};
  fields.forEach((f) => {
    const raw = item?.[f.name];
    if (f.kind === 'list') form[f.name] = joinList(raw);
    else if (f.kind === 'checkbox') form[f.name] = !!raw;
    else form[f.name] = raw ?? '';
  });
  return form;
}

function toPayload(form, fields) {
  const payload = {};
  fields.forEach((f) => {
    let value = form[f.name];
    if (f.kind === 'list') value = splitList(value);
    else if (f.kind === 'number') value = value === '' ? null : Number(value);
    else if (f.kind === 'checkbox') value = !!value;
    else if (f.kind === 'text' && value === '') value = null;
    if (f.name !== 'is_published' || value !== undefined) payload[f.name] = value;
  });
  return payload;
}

function Field({ field, value, onChange }) {
  if (field.kind === 'textarea') {
    return <textarea rows={3} placeholder={field.label} value={value} onChange={(e) => onChange(field.name, e.target.value)} className={FORM_INPUT_CLASS} />;
  }
  if (field.kind === 'list') {
    return <textarea rows={3} placeholder={`${field.label} (one per line)`} value={value} onChange={(e) => onChange(field.name, e.target.value)} className={FORM_INPUT_CLASS} />;
  }
  if (field.kind === 'select') {
    return (
      <select value={value} onChange={(e) => onChange(field.name, e.target.value)} className={FORM_INPUT_CLASS}>
        {field.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
      </select>
    );
  }
  if (field.kind === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
        <input type="checkbox" checked={value} onChange={(e) => onChange(field.name, e.target.checked)} />{field.label}
      </label>
    );
  }
  return <input type={field.kind === 'datetime' ? 'datetime-local' : field.kind === 'number' ? 'number' : 'text'} placeholder={field.label} value={value} onChange={(e) => onChange(field.name, e.target.value)} className={FORM_INPUT_CLASS} />;
}

export default function ContentManager({ accessToken }) {
  const [activeKey, setActiveKey] = useState('services');
  const resource = useMemo(() => RESOURCES.find((r) => r.key === activeKey), [activeKey]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    resource.api.list(accessToken)
      .then((res) => setItems(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [resource, accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setForm(toForm({}, resource.fields));
    setEditing(null);
    setError('');
    setShowForm(true);
  };

  const startEdit = (item) => {
    setForm(toForm(item, resource.fields));
    setEditing(item);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = toPayload(form, resource.fields);
      if (editing) {
        await resource.api.update(accessToken, editing.id, payload);
      } else {
        await resource.api.create(accessToken, payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message || 'Could not save the item.');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (item) => {
    try {
      await resource.api.update(accessToken, item.id, { is_published: !item.is_published });
      load();
    } catch { /* keep row unchanged on failure */ }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${resource.title(item)}"?`)) return;
    try {
      await resource.api.remove(accessToken, item.id);
      load();
    } catch { /* keep row on failure */ }
  };

  const hasPublish = resource.fields.some((f) => f.name === 'is_published');

  return (
    <div className="space-y-stack-lg">
      <div className="flex flex-wrap gap-2">
        {RESOURCES.map((r) => (
          <button
            key={r.key}
            onClick={() => { setActiveKey(r.key); setShowForm(false); }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
              activeKey === r.key ? 'bg-brand text-white' : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted'
            }`}
          >
            <Icon name={r.icon} className="text-lg" />{r.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">
            {resource.label} <span className="text-body-sm font-normal text-ink-muted">({items.length})</span>
          </h3>
          <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={showForm ? () => setShowForm(false) : startCreate}>
            {showForm ? 'Close' : `New ${resource.label.slice(0, -1) || 'Item'}`}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
            <div className="grid gap-4 sm:grid-cols-2">
              {resource.fields.map((f) => (
                <div key={f.name} className={f.kind === 'textarea' || f.kind === 'list' ? 'sm:col-span-2' : ''}>
                  <Field field={f} value={form[f.name] ?? ''} onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))} />
                </div>
              ))}
            </div>
            {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-white/70 dark:bg-dark-surface-container">
                <tr>
                  <th className="px-stack-lg py-4">Name</th>
                  <th className="px-stack-lg py-4">Status</th>
                  <th className="px-stack-lg py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
                    <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{resource.title(item)}</td>
                    <td className="px-stack-lg py-4">
                      {hasPublish ? (
                        <button onClick={() => togglePublish(item)} className="cursor-pointer">
                          <StatusBadge variant={item.is_published ? 'success' : 'neutral'}>{item.is_published ? 'published' : 'draft'}</StatusBadge>
                        </button>
                      ) : (
                        <StatusBadge variant="neutral">{item.slug || item.category || '—'}</StatusBadge>
                      )}
                    </td>
                    <td className="px-stack-lg py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(item)} className="text-ink-muted transition-colors hover:text-brand" title="Edit">
                          <Icon name="edit" className="text-lg" />
                        </button>
                        <button onClick={() => remove(item)} className="text-ink-muted transition-colors hover:text-status-error-text" title="Delete">
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td colSpan={3} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No {resource.label.toLowerCase()} found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
