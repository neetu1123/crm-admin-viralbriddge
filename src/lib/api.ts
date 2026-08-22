const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-admin-viralbridgge-new-three.vercel.app';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch<T = unknown>(path: string, options: RequestInit = {}, attempt = 1): Promise<T> {
  const token = getToken();
  const isPublicAuth = path === '/auth/login' || path === '/auth/register';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(!isPublicAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers, signal: controller.signal });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Try again in a few seconds.');
    }
    throw new Error('Cannot reach API. Check NEXT_PUBLIC_API_URL.');
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 503 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 3000));
    return apiFetch<T>(path, options, attempt + 1);
  }

  if (res.status === 401) {
    const err = await res.json().catch(() => ({ message: 'Unauthorized' }));
    if (isPublicAuth) {
      throw new Error(err.message || 'Invalid email or password');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.replace('/login');
    }
    throw new Error(err.message || 'Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  const json = await res.json();
  return (json?.success === true && 'data' in json ? json.data : json) as T;
}

function toQuery(params?: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; user: { id: string; name: string; email: string; role?: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  me: () => apiFetch<{ id: string; name: string; email: string; role?: { name: string } }>('/auth/me'),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

export const crmApi = {
  getSummary: () =>
    apiFetch<{
      totalLeads: number;
      newLeads: number;
      qualifiedLeads: number;
      convertedLeads: number;
      lostLeads: number;
      todaysFollowUps: number;
    }>('/admin/crm/summary'),

  getAssignees: () =>
    apiFetch<Array<{ id: string; name: string; email: string }>>('/admin/crm/assignees'),

  getLeads: (params?: {
    search?: string;
    leadStatus?: string;
    leadType?: string;
    priority?: string;
    assignedToId?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) =>
    apiFetch<{
      data: import('@/src/lib/crm/types').CrmLead[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/admin/crm/leads${toQuery(params)}`),

  getLead: (id: string) =>
    apiFetch<import('@/src/lib/crm/types').CrmLead>(`/admin/crm/leads/${id}`),

  createLead: (body: import('@/src/lib/crm/types').CrmLeadInput) =>
    apiFetch<import('@/src/lib/crm/types').CrmLead>('/admin/crm/leads', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateLead: (id: string, body: Partial<import('@/src/lib/crm/types').CrmLeadInput>) =>
    apiFetch<import('@/src/lib/crm/types').CrmLead>(`/admin/crm/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteLead: (id: string) =>
    apiFetch<{ success: boolean }>(`/admin/crm/leads/${id}`, { method: 'DELETE' }),

  archiveLead: (id: string) =>
    apiFetch<import('@/src/lib/crm/types').CrmLead>(`/admin/crm/leads/${id}/archive`, {
      method: 'PATCH',
    }),

  addNote: (leadId: string, content: string) =>
    apiFetch(`/admin/crm/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  updateNote: (leadId: string, noteId: string, content: string) =>
    apiFetch(`/admin/crm/leads/${leadId}/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),

  deleteNote: (leadId: string, noteId: string) =>
    apiFetch(`/admin/crm/leads/${leadId}/notes/${noteId}`, { method: 'DELETE' }),

  addFollowUp: (leadId: string, body: { title: string; date: string; time: string; notes?: string }) =>
    apiFetch(`/admin/crm/leads/${leadId}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  completeFollowUp: (leadId: string, followUpId: string) =>
    apiFetch(`/admin/crm/leads/${leadId}/follow-ups/${followUpId}/complete`, {
      method: 'PATCH',
    }),

  getAgents: (activeOnly = false) =>
    apiFetch<import('@/src/lib/crm/types').CrmAgent[]>(
      `/admin/crm/agents${activeOnly ? '?activeOnly=true' : ''}`,
    ),

  getAgentWorkload: (userId: string) =>
    apiFetch<{ userId: string; name: string; email: string; status: string; assignedLeads: number; todaysFollowUps: number }>(
      `/admin/crm/agents/${userId}/workload`,
    ),

  bulkAssign: (leadIds: string[], agentId: string) =>
    apiFetch<{ success: boolean; count: number; assignedTo: string }>('/admin/crm/leads/bulk-assign', {
      method: 'POST',
      body: JSON.stringify({ leadIds, agentId }),
    }),

  bulkAutoAssign: (leadIds: string[]) =>
    apiFetch<{ success: boolean; count: number; strategy: string }>('/admin/crm/leads/bulk-auto-assign', {
      method: 'POST',
      body: JSON.stringify({ leadIds }),
    }),

  bulkUpdate: (leadIds: string[], data: { leadStatus?: string; priority?: string; tags?: string[] }) =>
    apiFetch<{ success: boolean; count: number }>('/admin/crm/leads/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ leadIds, ...data }),
    }),

  bulkDelete: (leadIds: string[]) =>
    apiFetch<{ success: boolean; count: number }>('/admin/crm/leads/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ leadIds }),
    }),

  assignLead: (leadId: string, agentId: string) =>
    apiFetch<{ success: boolean; assignedTo: string }>(`/admin/crm/leads/${leadId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    }),

  reassignLead: (leadId: string, agentId: string, reason?: string) =>
    apiFetch<{ success: boolean; assignedTo: string }>(`/admin/crm/leads/${leadId}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ agentId, reason }),
    }),

  getAssignmentHistory: (leadId: string) =>
    apiFetch<import('@/src/lib/crm/types').AssignmentHistoryEntry[]>(
      `/admin/crm/leads/${leadId}/assignment-history`,
    ),

  importPreview: (fileName: string, rows: Record<string, string>[]) =>
    apiFetch<import('@/src/lib/crm/types').ImportPreviewResult>('/admin/crm/leads/import/preview', {
      method: 'POST',
      body: JSON.stringify({ fileName, rows }),
    }),

  importConfirm: (importJobId: string, duplicateStrategy?: 'SKIP' | 'UPDATE' | 'IMPORT_AS_NEW') =>
    apiFetch<{ importJobId: string; imported: number; duplicates: number; failed: number; status: string }>(
      '/admin/crm/leads/import/confirm',
      { method: 'POST', body: JSON.stringify({ importJobId, duplicateStrategy }) },
    ),

  getImportHistory: () =>
    apiFetch<import('@/src/lib/crm/types').ImportHistoryItem[]>('/admin/crm/import-history'),

  getImportJob: (importId: string) =>
    apiFetch<{
      id: string;
      fileName: string;
      uploadedBy: string;
      uploadedDate: string;
      completedAt?: string;
      totalRecords: number;
      successfulRecords: number;
      duplicateRecords: number;
      failedRecords: number;
      status: string;
      errors: Array<{ rowNumber: number; error: string; suggestedFix?: string }>;
    }>(`/admin/crm/import/${importId}`),

  getImportErrorsCsv: (importId: string) =>
    apiFetch<string>(`/admin/crm/import/${importId}/errors`),

  exportLeads: (opts: { leadIds?: string[]; filters?: Record<string, string | undefined>; fields?: string[] }) =>
    apiFetch<{ exportJobId: string; recordCount: number; csv: string }>('/admin/crm/leads/export', {
      method: 'POST',
      body: JSON.stringify(opts),
    }),

  getExportHistory: () =>
    apiFetch<import('@/src/lib/crm/types').ExportHistoryItem[]>('/admin/crm/export-history'),

  getExportDownload: (exportId: string) =>
    apiFetch<{ fileName: string; csv: string }>(`/admin/crm/export/${exportId}/download`),

  getLeadIdsByFilters: (filters: Record<string, string | undefined>) =>
    apiFetch<string[]>('/admin/crm/leads/filter-ids', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),
};
