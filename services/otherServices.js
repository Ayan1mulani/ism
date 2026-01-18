import {API_URL2}   from "@env"
import { ApiCommon } from "./ApiCommon"
import { Common } from "./Common";
import { Util } from "./Util";

 const otherServices = {

  getOutStandings: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
    };
  
    const url =  otherServices.appendParamsInUrl(`${API_URL2}/my/outstandingbalances`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     console.log(response.data,'this is response for outstnading')
     return response
  },


    getMyAccounts: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
    };
  
    const url =  otherServices.appendParamsInUrl(`${API_URL2}/billing/houseStatement/439139/1/100`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     console.log(response.data,'this is response for accounts')
     return response
  },


  
    getStaffCategories: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
    };
  
    const url =  otherServices.appendParamsInUrl(`${API_URL2}/billing/houseStatement/439139/1/100`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     console.log(response.data,'this is response for accounts')
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

export {otherServices}