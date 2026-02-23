import {API_URL2}   from "@env"
import { ApiCommon } from "./ApiCommon"
import { Common } from "./Common";
import { Util } from "./Util";

 const otherServices = {

  getOutStandings: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.api_token,
      "user-id": user.id,
    };
  
    const url =  otherServices.appendParamsInUrl(`${API_URL2}/my/outstandingbalances`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     return response
  },


    getMyAccounts: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.api_token,
      "user-id": user.id,
    };
  
    const url =  otherServices.appendParamsInUrl(`${API_URL2}/billing/houseStatement/439139/1/100`,params);
    const headers = await Util.getCommonAuth()
     const response =   await ApiCommon.getReq(url,headers);
     return response
  },

getStaffByCategory: async (category) => {
  try {
    const user = await Common.getLoggedInUser();

    const userObj = {
      user_id: user.unit_id,
      group_id: user.role_id,
      flat_no: user.flat_no,
      unit_id: user.unit_id,
      society_id: user.societyId,
    };

    const params = {
      "api-token": user.api_token,
      "user-id": JSON.stringify(userObj),
      category: category,
    };

    // Build URL
    const url = otherServices.appendParamsInUrl(
      `https://vms-api.isocietymanager.com/v1/society/${user.societyId}/staffbycategory`,
      params
    );

    const headers = await Util.getCommonAuth();
    const response = await ApiCommon.getReq(url, headers);

    return response;
  } catch (error) {
    console.log("Get Staff By Category Error:", error);
    throw error;
  }
},
 

getStaffCategories: async () => {
  try {
    const user = await Common.getLoggedInUser();

    const userObj = {
      user_id: user.unit_id,
      group_id: user.role_id,
      flat_no: user.flat_no,
      unit_id: user.unit_id,
      society_id: user.societyId,
    };

    const params = {
      "api-token": user.api_token,
      "user-id": JSON.stringify(userObj),
    };

    const url = otherServices.appendParamsInUrl(
      `https://vms-api.isocietymanager.com/v1/society/${user.societyId}/allstaffcategory`,
      params
    );

    const headers = await Util.getCommonAuth();

    return await ApiCommon.getReq(url, headers);

  } catch (error) {
    console.log("Get Staff Categories Error:", error);
    throw error;
  }
},
  addVehicle: async (vehicleData) => {
  try {
    const user = await Common.getLoggedInUser();

    const userObj = {
      user_id: user.unit_id,
      group_id: user.role_id,
      flat_no: user.flat_no,
      unit_id: user.unit_id,
      society_id: user.societyId,
    };

    const params = {
      "api-token": user.api_token,
      "user-id": JSON.stringify(userObj),
    };

    const url = otherServices.appendParamsInUrl(
      `${API_URL2}/my/vehicle`,
      params
    );

    const headers = await Util.getCommonAuth();

    const response = await ApiCommon.putReq(
      url,
      vehicleData,
      headers
    );

    return response;

  } catch (error) {
    console.log("Add Vehicle Error:", error);
    throw error;
  }
},

getMyVehicles: async () => {
  const user = await Common.getLoggedInUser();

  const userObj = {
    user_id: user.unit_id,
    group_id: user.role_id,
    flat_no: user.flat_no,
    unit_id: user.unit_id,
    society_id: user.societyId,
  };

  const url = `${API_URL2}/my/vehicles?api-token=${
    user.api_token
  }&user-id=${encodeURIComponent(JSON.stringify(userObj))}`;

  const headers = await Util.getCommonAuth();
  return ApiCommon.getReq(url, headers);
},

updateVehicle: async (vehicleId, payload) => {
  const user = await Common.getLoggedInUser();

  const userObj = {
    user_id: user.unit_id,
    group_id: user.role_id,
    flat_no: user.flat_no,
    unit_id: user.unit_id,
    society_id: user.societyId,
  };

  const url = `${API_URL2}/my/vehicle/${vehicleId}?api-token=${
    user.api_token
  }&user-id=${encodeURIComponent(JSON.stringify(userObj))}`;

  const headers = await Util.getCommonAuth();

  return ApiCommon.postReq(url, payload, headers);
},
getVehicleLogs: async ({
  vehicleId,
  from,
  to,
  getAll = 1,
}) => {
  try {
    const user = await Common.getLoggedInUser();

    const userObj = {
      user_id: user.unit_id,
      group_id: user.role_id,
      flat_no: user.flat_no,
      unit_id: user.unit_id,
      society_id: user.societyId,
    };

    const params = {
      "api-token": user.api_token,
      "user-id": JSON.stringify(userObj),
      from,
      to,
      vehicle_id: vehicleId,
      get_all: getAll,
    };

    const url = otherServices.appendParamsInUrl(
      `${API_URL2}/my/vehicle/log`,
      params
    );

    const headers = await Util.getCommonAuth();

    const response = await ApiCommon.getReq(url, headers);

    return response;

  } catch (error) {
    console.log("Vehicle Logs Error:", error);
    throw error;
  }
},

toggleVehicleSubscription: async (vehicleId, isSubscribed) => {
  try {
    const user = await Common.getLoggedInUser();

    const userObj = {
      user_id: user.unit_id,
      group_id: user.role_id,
      flat_no: user.flat_no,
      unit_id: user.unit_id,
      society_id: user.societyId,
    };

    const url = `${API_URL2}/my/vehiclesubscription?api-token=${
      user.api_token
    }&user-id=${encodeURIComponent(JSON.stringify(userObj))}`;

    const headers = await Util.getCommonAuth();

    const payload = {
      id: vehicleId,
      is_subscribed: isSubscribed,
    };

    return await ApiCommon.postReq(url, payload, headers);

  } catch (error) {
    console.log("Toggle subscription error:", error);
    throw error;
  }
},

toggleVehicleAccess: async (vehicleId, payload) => {
  try {
    const user = await Common.getLoggedInUser();

    const userObj = {
      user_id: user.unit_id,
      group_id: user.role_id,
      flat_no: user.flat_no,
      unit_id: user.unit_id,
      society_id: user.societyId,
    };

    const url = `${API_URL2}/my/vehicletagautolock/${vehicleId}?api-token=${
      user.api_token
    }&user-id=${encodeURIComponent(JSON.stringify(userObj))}`;

    const headers = await Util.getCommonAuth();

    return await ApiCommon.postReq(url, payload, headers);

  } catch (error) {
    console.log("Vehicle Access toggle error:", error);
    throw error;
  }
},

createOrUpdateVehicleTag: async (vehicleId, payload) => {
  try {
    const user = await Common.getLoggedInUser();

    const userObj = {
      user_id: user.unit_id,
      group_id: user.role_id,
      flat_no: user.flat_no,
      unit_id: user.unit_id,
      society_id: user.societyId,
    };

    const url = `${API_URL2}/vehicletag/${vehicleId}?api-token=${
      user.api_token
    }&user-id=${encodeURIComponent(JSON.stringify(userObj))}`;

    const headers = await Util.getCommonAuth();

    return await ApiCommon.postReq(url, payload, headers);

  } catch (error) {
    console.log("Vehicle Tag Error:", error);
    throw error;
  }
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