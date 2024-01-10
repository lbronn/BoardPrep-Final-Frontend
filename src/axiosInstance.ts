import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_BOARDPREP_API
      : "http://localhost:8000",
  headers: {
    "Access-Control-Allow-Credentials": true,
  },
});

export default axiosInstance;
