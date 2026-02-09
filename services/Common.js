//this deals with localstorage
import AsyncStorage from "@react-native-async-storage/async-storage";

const Common = {
    getLoggedInUser: async () => {
        try {


            const userInfo = await AsyncStorage.getItem('userInfo');
            // Check if userInfo exists before proceeding
            if (!userInfo) {
                throw new Error("User info not found");
            }

            // Parse the user info to get required data
            const parsedUserInfo = JSON.parse(userInfo);
            return parsedUserInfo;

        } catch (e) {
            console.error("Error in getLoggedInUser", e)
        }

    },

    getUserDetails: async () => {
        try {


            const userDetails = await AsyncStorage.getItem('userDetails');
            // Check if userInfo exists before proceeding
            if (!userDetails) {
                throw new Error("User info not found");
            }

            // Parse the user info to get required data
            const parsedUserInfo = JSON.parse(userDetails);
            return parsedUserInfo;

        } catch (e) {
            console.error("Error in getLoggedInUser", e)
        }

    },

}
export { Common };
