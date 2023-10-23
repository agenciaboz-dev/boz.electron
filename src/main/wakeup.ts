import axios from 'axios'

declare type HTTPMethods = 'GET' | 'POST'

const request = async (url: string, method: HTTPMethods, data?: string) => {
  console.log({ url, method, data })
  const response = await axios.request({ method, url, data })
  delete response.request
  return JSON.stringify(response)
}

export default { request }
