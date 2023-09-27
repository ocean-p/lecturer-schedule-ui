import axios from "axios";

const request = axios.create({
  baseURL: 'https://20.214.249.72/api/'
})

export default request;

