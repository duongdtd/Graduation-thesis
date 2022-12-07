import axios from 'axios'

const baseURL = `https://backend-production-b88c.up.railway.app/api/finger`
export async function fetchMe(token) {
    return await axios({
      url: `${baseURL}/me`,
      method: 'GET',
      headers: {
        Authorization: token,
      },
    })
  }
  export async function addfinger(data,token) {
    return await axios({
      url: `${baseURL}/addfinger`,
      method: 'POST',
      headers: {
        Authorization: token,
      },
      data,
    })
  }
  export async function checkfinger(data,token) {
    return await axios({
      url: `${baseURL}/checkfinger`,
      method: 'POST',
      headers: {
        Authorization: token,
      },
      data,
    })
  }
  export async function getData(token) {
    return await axios({
      url: `${baseURL}`,
      method: 'GET',
      headers: {
        Authorization: token,
      },
    })
  }
  export async function deleteFinger(id,token)
  {
    return await axios({
      url: `${baseURL}/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: token,
      },
    })
  }