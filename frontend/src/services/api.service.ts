// frontend/src/services/api.service.ts
import { auth } from 'src/boot/firebase';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important pour CORS avec credentials
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor pour ajouter le token Firebase
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Token added to request');
          } else {
            console.log('ℹ️ No user authenticated');
          }
        } catch (error) {
          console.error('❌ Error getting Firebase token:', error);
        }

        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => {
        console.log(`📥 Response ${response.status} from ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        console.error(`❌ Response error ${error.response?.status} from ${originalRequest.url}`);

        // Si erreur 401 et pas déjà une retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const user = auth.currentUser;
            if (user) {
              // Forcer le renouvellement du token
              const newToken = await user.getIdToken(true);
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
              };
              console.log('🔄 Token refreshed, retrying request');
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            // Rediriger vers la page de login si nécessaire
            window.location.href = '/login';
          }
        }

        // Gérer les autres erreurs
        if (error.response?.status === 403) {
          console.error('🚫 Access forbidden');
        } else if (error.response?.status === 500) {
          console.error('💥 Server error');
        }

        return Promise.reject(error);
      }
    );
  }

  // Méthodes publiques pour les appels API
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Méthodes spécifiques pour votre application
  async testConnection(): Promise<unknown> {
    return this.get('/api/test');
  }

  async getHealth(): Promise<unknown> {
    return this.get('/api/health');
  }

  async getMainData(): Promise<unknown> {
    return this.get('/api/main');
  }

  async getUserProfile(): Promise<unknown> {
    return this.get('/api/user/profile');
  }

  async testAuthentication(): Promise<unknown> {
    return this.post('/api/test-auth');
  }
}

// Export d'une instance unique
export const apiService = new ApiService();

// Export de la classe pour les tests
export default ApiService;
