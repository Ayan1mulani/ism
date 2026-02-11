import {API_URL2}   from "@env"
import { ApiCommon } from "./ApiCommon"
import { Common } from "./Common";
import { Util } from "./Util";

 const complaintService = {

  getMyComplaints: async (status) => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.api_token,
      "user-id": user.id,
      "status": status,
      "per_page":10,
      "page_no":1
    };
  

    const url =  complaintService.appendParamsInUrl(`${API_URL2}/my/complaints`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     console.log("complaint response", headers, response)
     return response
  },

    getCategories: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.api_token,
      "user-id": user.id,
    };

    const url =  complaintService.appendParamsInUrl(`${API_URL2}/getcomplaintcategory`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
console.log(
  "complaint category response:\n",
  JSON.stringify(response, null, 2)
);     return response
  },

appendParamsInUrl: (url, params) => {
    if (params && typeof params === "object") {
      const queryParams = Object.keys(params)
        .filter((key) => params[key] !== null && params[key] !== undefined)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

      if (queryParams) {
        url += url.includes('?') ? '&' : '?';
        url += queryParams;
      }
    }

    return url;
  }

}

export {complaintService}