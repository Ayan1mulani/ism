import AsyncStorage from "@react-native-async-storage/async-storage";

const Common = {
    getLoggedInUser: async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            
            if (!userInfo) {
                throw new Error("User info not found");
            }

            const parsedUserInfo = JSON.parse(userInfo);
            return parsedUserInfo;

        } catch (e) {
            console.error("Error in getLoggedInUser", e)
            throw e; // ✅ Re-throw so caller knows it failed
        }
    },

    getUserDetails: async () => {
        try {
            // ✅ Use 'userInfo' instead of 'userDetails'
            const userInfo = await AsyncStorage.getItem('userInfo');
            
            if (!userInfo) {
                throw new Error("User info not found");
            }

            const parsedUserInfo = JSON.parse(userInfo);
            return parsedUserInfo;

        } catch (e) {
            console.error("Error in getUserDetails", e); // ✅ Fixed log name
            throw e; // ✅ Re-throw
        }
    },
}

export { Common };