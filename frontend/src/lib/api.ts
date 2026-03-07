import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { getToken } from './auth'

export const api = axios.create({
  baseURL: 'http://localhost:8000',
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

