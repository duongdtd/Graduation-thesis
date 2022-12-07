import axios from 'axios'

const baseURL = `https://backend-production-b88c.up.railway.app/api/notification`
  export async function getDataNotification(data) {
    console.log(data)
    return await axios({
      url: `${baseURL}`,
      method: 'POST',
      data
    })
  }
 