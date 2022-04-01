import { create } from "apisauce";

const domain = "https://suremarket.ng";
const apiKey = "1eb2beac-3186-4c54-9c3a-ca6be1263761";

const api = create({
  baseURL: domain + "/wp-json/rtcl/v1/",
//  baseURL: domain + "/wp-json/wp/v2",
  headers: {
    Accept: "application/json",
    "X-API-KEY": apiKey,
  },
  timeout: 30000, // 30 secs
});
const setAuthToken = (token) =>
  api.setHeader("Authorization", "Bearer " + token);
const removeAuthToken = () => api.deleteHeader("Authorization");
const setMultipartHeader = () =>
  api.setHeader("Content-Type", "multipart/form-data");
const removeMultipartHeader = () => api.deleteHeader("Content-Type");

export default api;
export {
  setAuthToken,
  removeAuthToken,
  setMultipartHeader,
  removeMultipartHeader,
};
