import {API_URL4}   from "@env"
import { ApiCommon } from "./ApiCommon"
import { Common } from "./Common";
import { Util } from "./Util";

 const visitorServices = {

  getMyVisitors: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.api_token,
      "user-id": user.id,
    };
    const paylod ={
        input: "",
        residentId: user.id
    }
    const url =  await visitorServices.appendParamsInUrl(`${API_URL4}/v1/society/290/getVisitsForResident`);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.postReq(url,paylod,headers);
     return response
  },


  getMyPasses: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.api_token,
      "user-id": user.id,
    };
    const paylod ={
        input: "",
        residentId: user.id
    }
    const url =  await visitorServices.appendParamsInUrl(`${API_URL4}/v1/society/290/searchPass`);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.postReq(url,paylod,headers);
     console.log(response,'this is res for pass')
     return response
  },

  addMyVisitor: async (data) => {
  const user = await Common.getLoggedInUser()
  const url = await visitorServices.appendParamsInUrl(
    `${API_URL4}/v2/society/290/createallpass`
    
  )

  const headers = await Util.getCommonAuth()

  console.log("🔗 API URL:", url)
  console.log("📦 Payload:", data)

  return ApiCommon.postReq(url, data, headers)
},



  
    getStaffCategories: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.api_token,
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
      "api-token": user.api_token,
      "user-id": user.id,
      "category": category || null,
    };
  
    const url =  visitorServices.appendParamsInUrl(`${API_URL4}/v1/society/290/staffbycategory`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     return response
  },


appendParamsInUrl: async (url, extraParams = {}) => {
  const user = await Common.getLoggedInUser()

  const uObj = {
    user_id: 367102,
    group_id: 2265,
    flat_no: "CL1-T112",
    unit_id: 367102,
    society_id: 290
  };

  const u = JSON.stringify(uObj); // ✅ no encode

  const commonParams = {
    "api-token": user.api_token,
    "user-id": u,
    "group-id": 2265,
    "app_id": "ism_resident"
  };

  const finalParams = {
    ...commonParams,
    ...extraParams
  };

  const queryParams = Object.keys(finalParams)
    .filter(key => finalParams[key] !== null && finalParams[key] !== undefined)
    .map(
      key =>
        `${encodeURIComponent(key)}=${encodeURIComponent(finalParams[key])}`
    )
    .join("&");

  if (queryParams) {
    url += url.includes("?") ? "&" : "?";
    url += queryParams;
  }

  return url;
}

}

export {visitorServices}