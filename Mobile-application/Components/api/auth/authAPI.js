import axios from 'axios'

const baseURL = `https://backend-production-b88c.up.railway.app/api/auth`
export async function register(data) {
  return await axios({
    url: `${baseURL}/register`,
    method: 'POST',
    data,
  })
}
export async function open() {
  return await axios({
    url: `https://backend-production-b88c.up.railway.app/open`,
    method: 'GET',
  })
}
export async function login(data) {
  return await axios({
    url: `${baseURL}/login`,
    method: 'POST',
    data,
  })
}
export async function fetchMe(token) {
  return await axios({
    url: `${baseURL}/me`,
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })
}
export async function changePassword(token, data) {
  return await axios({
    url: `${baseURL}/change-password`,
    method: 'POST',
    headers: {
      Authorization: token,
    },
    data,
  })
}
export async function forgotPassword(data) {
  return await axios({
    url: `${baseURL}/forgot-password`,
    method: 'POST',
    data,
  })
}
