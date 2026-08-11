export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ensure absolute URL
  const fetchUrl = url.startsWith('http') ? url : `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  const res = await fetch(fetchUrl, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Optionally trigger a logout event or redirect if unauthorized
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return res;
};
