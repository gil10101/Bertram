const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type GetToken = () => Promise<string | null>;

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
  getToken?: GetToken,
): Promise<T> {
  const token = getToken ? await getToken() : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!options.body || typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `API error ${response.status}`);
  }

  return response.json();
}

export function createApiClient(getToken: GetToken) {
  return {
    get: <T = unknown>(path: string) => request<T>(path, {}, getToken),
    post: <T = unknown>(path: string, data?: unknown) =>
      request<T>(path, { method: "POST", body: JSON.stringify(data) }, getToken),
    postForm: <T = unknown>(path: string, formData: FormData) =>
      request<T>(path, { method: "POST", body: formData }, getToken),
    patch: <T = unknown>(path: string, data?: unknown) =>
      request<T>(path, { method: "PATCH", body: JSON.stringify(data) }, getToken),
    put: <T = unknown>(path: string, data?: unknown) =>
      request<T>(path, { method: "PUT", body: JSON.stringify(data) }, getToken),
    delete: <T = unknown>(path: string) =>
      request<T>(path, { method: "DELETE" }, getToken),
    getAttachmentUrl: (emailId: string, attachmentId: string, provider?: string) => {
      const qs = provider ? `?provider=${provider}` : "";
      return `${API_BASE_URL}/emails/${emailId}/attachments/${attachmentId}${qs}`;
    },
    getToken,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
