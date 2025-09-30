import axios from 'axios';

const apiClient = axios.create({
    //baseURL: 'http://127.0.0.1:5000/api',
    baseURL: 'http://192.168.88.19:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default {
    getCategories() {
        return apiClient.get('/categories');
    },
    searchProducts(searchTerm) {
        return apiClient.get(`/product/${searchTerm}`);
    }
};