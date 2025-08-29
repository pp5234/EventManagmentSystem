const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
    static getToken() {
        return localStorage.getItem('jwt');
    }

    static async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static get(endpoint) {
        return this.request(endpoint);
    }

    static post(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
    }

    static put(endpoint, data) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
    }

    static patch(endpoint) {
        return this.request(endpoint, { method: 'PATCH' });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    static async login(emailOrPayload, password) {
        if (emailOrPayload && typeof emailOrPayload === 'object' && !Array.isArray(emailOrPayload)) {
            return this.post('/login', emailOrPayload);
        }
        return this.post('/login', { email: emailOrPayload, password });
        }

    // Users
    static async getUsers(page = 1, limit = 10) {
        return this.get(`/user?page=${page}&limit=${limit}`);
    }
    static async createUser(userData) {
        return this.post('/user', userData);
    }
    static async updateUser(id, userData) {
        return this.put(`/user/${id}`, userData);
    }
    static async toggleUserStatus(id) {
        return this.patch(`/user/${id}/status`);
    }
    static async deleteUser(id) {
        return this.delete(`/user/${id}`);
    }

    // Categories
    static async getCategories(page = 1, limit = 10) {
        return this.get(`/category?page=${page}&limit=${limit}`);
    }
    static async createCategory(data) {
        return this.post('/category', data);
    }
    static async updateCategory(id, data) {
        return this.put(`/category/${id}`, data);
    }
    static async deleteCategory(id) {
        return this.delete(`/category/${id}`);
    }

    // Events
    static async getEvents(page = 1, limit = 10) {
        return this.get(`/event?page=${page}&limit=${limit}`);
    }
    static async getPopularEvents() {
        return this.get('/event/popular');
    }
    static async searchEvents(query, page = 1, limit = 10) {
        return this.get(`/event/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
    }
    static async getEventsByCategory(categoryId, page = 1, limit = 10) {
        return this.get(`/event/category/${categoryId}?page=${page}&limit=${limit}`);
    }
    static async getEventsByTag(tagId, page = 1, limit = 10) {
        return this.get(`/event/tag/${tagId}?page=${page}&limit=${limit}`);
    }
    static async getEvent(id) {
        return this.get(`/event/${id}`);
    }
    static async createEvent(data) {
        return this.post('/event', data);
    }
    static async updateEvent(id, data) {
        return this.put(`/event/${id}`, data);
    }
    static async deleteEvent(id) {
        return this.delete(`/event/${id}`);
    }
    static async likeEvent(id) {
        return this.patch(`/event/like/${id}`);
    }
    static async dislikeEvent(id) {
        return this.patch(`/event/dislike/${id}`);
    }
    static async getTopReactionEvents() {
        return this.get('/event/top-reactions');
    }

    // Comments
    static async addComment(eventId, data) {
        return this.post(`/event/${eventId}/comment`, data);
    }
    static async deleteComment(id) {
        return this.delete(`/comment/${id}`);
    }
    static async likeComment(id) {
        return this.patch(`/comment/like/${id}`);
    }
    static async dislikeComment(id) {
        return this.patch(`/comment/dislike/${id}`);
    }

    // RSVP
    static async registerForEvent(eventId, email) {
        return this.post(`/event/${eventId}/registration`, { email });
    }
}

export default ApiService;