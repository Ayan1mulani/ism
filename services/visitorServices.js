import {API_URL4}   from "@env"
import { ApiCommon } from "./ApiCommon"
import { Common } from "./Common";
import { Util } from "./Util";

 const visitorServices = {

  getMyVisitors: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
    };
    console.log(API_URL4,'this is url 4')
    const paylod ={
        input: "",
        residentId: user.id
    }
    const url =  visitorServices.appendParamsInUrl(`${API_URL4}/v1/society/290/getVisitsForResident?api-token=${user.api_token}&user-id=${367102}`);
    const headers = await Util.getCommonAuth()
     console.log(API_URL4,'this is url 4',url)
     const response =   await ApiCommon.postReq(url,paylod,headers);
     return response
  },


  getMyPasses: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
    };
    console.log(API_URL4,'this is url 4')
    const paylod ={
        input: "",
        residentId: user.id
    }
    const url =  visitorServices.appendParamsInUrl(`${API_URL4}/v1/society/290/searchPass?api-token=${user.api_token}&user-id=${367102}`);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.postReq(url,paylod,headers);
     return response
  },


  
    getStaffCategories: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
    };
  
    const url =  visitorServices.appendParamsInUrl(`${API_URL4}/v1/society/290/allstaffcategory`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     return response
  },

    getMyStaffs: async (category) => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
      "category": category || null,
    };
  
    const url =  visitorServices.appendParamsInUrl(`${API_URL4}/v1/society/290/staffbycategory`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     return response
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

export {visitorServices}