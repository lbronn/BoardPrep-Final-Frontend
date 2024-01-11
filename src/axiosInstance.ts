import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_BOARDPREP_API
      : "https://boardprep-backend.azurewebsites.net",
  withCredentials: true,
});

export default axiosInstance;
