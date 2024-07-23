import axios from "axios";
 
// --for deployment i think (dont erase)-- //
// const axiosInstance = axios.create({ 
//   baseURL:
//     process.env.NODE_ENV === "production"
//       ? process.env.REACT_APP_BOARDPREP_API
//       : "https://boardprep-backend.azurewebsites.net",
//   withCredentials: true,
// });

// remove after testing
const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_BOARDPREP_API
      : "http://127.0.0.1:8000",
  withCredentials: true,
});

export default axiosInstance;
