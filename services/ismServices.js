import {API_URL2}   from "@env"
import { ApiCommon } from "./ApiCommon"
import { Common } from "./Common";
import { Util } from "./Util";
import AsyncStorage from "@react-native-async-storage/async-storage";

 const ismServices = {

  getUserDetails: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
      "site_id": user.societyId
    };
    const url =  ismServices.appendParamsInUrl(`${API_URL2}/userDetailsById/${user.id}`, params);
    const headers = await Util.getCommonAuth()
   const response =   await ApiCommon.getReq(url, headers, params);
   await AsyncStorage.setItem("userDetails",JSON.stringify(response))
   return response
  },

    getMyBalance: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.apiToken,
      "user-id": user.id,
      "cache":0,
      "bill_type":835
    };
    const url =  ismServices.appendParamsInUrl(`${API_URL2}/getOutstandingBalance/${user.id}`);
    console.log(url,'this is url')
    const headers = await Util.getCommonAuth()
   const response =   await ApiCommon.getReq(url,headers, params);
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

export {ismServices}