// Hardcoded production URL to ensure Vercel uses the Render backend instantly
const API_BASE = "https://ascend-backend-u64d.onrender.com/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ascend_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ascend_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ascend_token");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth & Access Control
  login: (data: { email: string; password: string }) =>
    request<any>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    enrollment_number?: string;
    branch?: string;
    section?: string;
    department?: string;
  }) =>
    request<{ message: string; status: string; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  requestOtp: (
    dataOrEmail:
      | string
      | {
          email: string;
          name?: string;
          enrollment_number?: string;
          branch?: string;
          section?: string;
          department?: string;
        },
    name?: string
  ) => {
    const body = typeof dataOrEmail === "string" ? { email: dataOrEmail, name } : dataOrEmail;
    return request<{ message: string; email: string; status: string; dev_otp?: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  getDevOtpHint: (email: string) =>
    request<{ email: string; dev_otp?: string }>(`/auth/dev-otp-hint?email=${encodeURIComponent(email)}`),
  verifyOtp: (email: string, otp: string) =>
    request<{ access_token: string; token_type: string; status: string; role: string; user: any }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),
  getAccessStatus: () =>
    request<{ status: string; role: string; name: string; email: string }>("/auth/access-status"),
  verifyAccessCode: (access_code: string) =>
    request<{ access_token: string; token_type: string; user: any; redirect_url: string }>("/auth/access-code/verify", {
      method: "POST",
      body: JSON.stringify({ access_code }),
    }),
  getMyAccessCode: () =>
    request<{ access_code: string }>("/auth/access-code"),
  getMe: () => {
    if (!getToken()) return Promise.resolve(null);
    return request<any>("/auth/me");
  },
  getDemoAccounts: () => request<any[]>("/auth/demo-accounts"),
  forgotPassword: (email: string) =>
    request<{ message: string; email: string; dev_otp?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (data: { email: string; otp?: string; new_password: string }) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin Access Control Queue
  getAccessRequests: () => {
    if (!getToken()) return Promise.resolve([]);
    return request<any[]>("/admin/access-requests");
  },
  approveAccessRequest: (id: string) =>
    request<{ status: string; message: string }>(`/admin/access-requests/${id}/approve`, { method: "POST" }),
  rejectAccessRequest: (id: string, reason?: string) =>
    request<{ status: string; message: string }>(`/admin/access-requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  deleteMember: (userId: string) =>
    request<{ status: string; message: string }>(`/admin/members/${userId}`, { method: "DELETE" }),

  // Achievements
  getCategories: () => request<any[]>("/achievements/categories"),
  submitAchievement: (data: any) =>
    request<any>("/achievements/submit", { method: "POST", body: JSON.stringify(data) }),
  getMySubmissions: () => {
    if (!getToken()) return Promise.resolve([]);
    return request<any[]>("/achievements/my");
  },

  // Proofs
  uploadProof: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{
      proof_id: string;
      file_name: string;
      mime_type: string;
      file_size_bytes: number;
      view_token: string;
    }>("/proofs/upload", {
      method: "POST",
      body: formData,
    });
  },
  getProofSignedToken: (proofId: string) =>
    request<{ proof_id: string; view_token: string }>("/proofs/" + proofId + "/signed-token"),
  getProofViewUrl: (viewToken: string) => `${API_BASE}/proofs/view/${viewToken}`,

  // Core Workspace
  getCoreQueue: (status?: string, search?: string) => {
    if (!getToken()) return Promise.resolve([]);
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status_filter", status);
    if (search) params.append("search", search);
    return request<any[]>(`/core/queue?${params.toString()}`);
  },
  getCoreSubmission: (id: string) => request<any>(`/core/submissions/${id}`),
  verifySubmission: (id: string, data: { rule_version?: string; override_reason?: string }) =>
    request<any>(`/core/submissions/${id}/verify`, { method: "POST", body: JSON.stringify(data) }),
  requestProofSubmission: (id: string, reason: string) =>
    request<any>(`/core/submissions/${id}/request-proof`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  rejectSubmission: (id: string, reason: string) =>
    request<any>(`/core/submissions/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  getCoreAnalytics: () => {
    if (!getToken()) return Promise.resolve(null);
    return request<any>("/core/analytics");
  },

  // Leaderboard & Progress
  getLeaderboard: () => request<any>("/leaderboard"),
  getTeamProgress: () => request<any>("/team/progress"),

  // Rules & Versions
  getRules: (version?: string) => request<any[]>(`/rules?version_id=${version || "TSJ-2026-v1"}`),
  getRuleVersions: () => request<any[]>("/rules/versions"),
  createRule: (data: any) => request<any>("/rules", { method: "POST", body: JSON.stringify(data) }),

  // Audit Logs
  getAuditLogs: (limit = 50, entityId?: string, action?: string) => {
    if (!getToken()) return Promise.resolve([]);
    const params = new URLSearchParams({ limit: limit.toString() });
    if (entityId) params.append("entity_id", entityId);
    if (action) params.append("action", action);
    return request<any[]>(`/audit-logs?${params.toString()}`);
  },

  // Admin Team Members Analytics & Leaderboard
  getTeamMembersLeaderboard: () => {
    if (!getToken()) return Promise.resolve([]);
    return request<any[]>("/admin/members-leaderboard");
  },

  // AI Assistant (ASCEND Guide)
  chatAiGuide: (message: string) =>
    request<{ reply: string; suggested_actions: string[]; knowledge_references: string[] }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  formatAchievementWithAi: (raw_text: string, category_hint?: string) =>
    request<any>("/ai/format-achievement", {
      method: "POST",
      body: JSON.stringify({ raw_text, category_hint }),
    }),
};
