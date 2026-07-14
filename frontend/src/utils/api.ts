const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "/api/v1"
    : "http://localhost:5000/api/v1";

interface RequestOptions extends RequestInit {
  body?: any;
}

// Track an ongoing refresh request to prevent duplicate simultaneous refresh calls
let refreshPromise: Promise<{
  accessToken: string;
  refreshToken: string;
}> | null = null;

const getTokens = () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  return { accessToken, refreshToken };
};

const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
};

export class ApiError extends Error {
  public statusCode: number;
  public details: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Low-level fetch wrapper
const customFetch = async (
  endpoint: string,
  options: RequestOptions = {},
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  // Set default Content-Type for JSON
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Inject Access Token if available
  const { accessToken } = getTokens();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  // Handle empty responses
  let data: any = {};
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || response.statusText || "An error occurred",
      response.status,
      data?.error?.details,
    );
  }

  return data;
};

export const api = async (
  endpoint: string,
  options: RequestOptions = {},
): Promise<any> => {
  try {
    return await customFetch(endpoint, options);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.statusCode === 401 &&
      !endpoint.includes("/auth/login")
    ) {
      const { refreshToken } = getTokens();

      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new Event("auth-expired"));
        throw error;
      }

      try {
        if (!refreshPromise) {
          refreshPromise = customFetch("/auth/refresh", {
            method: "POST",
            body: { refreshToken },
          })
            .then((res) => {
              const { accessToken: newAccess, refreshToken: newRefresh } =
                res.data;
              setTokens(newAccess, newRefresh);
              return { accessToken: newAccess, refreshToken: newRefresh };
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const tokens = await refreshPromise;

        if (options.headers) {
          const headers = new Headers(options.headers);
          headers.set("Authorization", `Bearer ${tokens.accessToken}`);
          options.headers = headers;
        }

        return await customFetch(endpoint, options);
      } catch (refreshError) {
        clearTokens();
        window.dispatchEvent(new Event("auth-expired"));
        throw refreshError;
      }
    }

    throw error;
  }
};
