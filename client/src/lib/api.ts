import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Here you can hook into a notification system (e.g. toast)
        // const message = error.response?.data?.error || 'Something went wrong';
        // toast.error(message);

        if (error.response?.status === 401) {
            // Optional: redirect to login or clear auth state if needed
            // But usually the AuthContext handles the 401 state updates
        }
        return Promise.reject(error);
    }
);

export default api;
