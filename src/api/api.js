import axios from 'axios'

const api = axios.create({
  baseURL: 'https://apartment-building-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json'
  }
})

// attach token if available
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if(token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// auto-logout on unauthorized (token expired) responses
let isHandlingAuthError = false
api.interceptors.response.use(
  res => res,
  err => {
    const status = err?.response?.status
    if((status === 401 || status === 403) && !isHandlingAuthError){
      isHandlingAuthError = true
      // clear local storage and force navigation to login
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      // use full reload to reset app state
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
