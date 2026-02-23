// AddVehicleScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Common } from "../../services/Common";
import { Util } from "../../services/Util";
import { ApiCommon } from "../../services/ApiCommon";
import { API_URL2 } from "@env";
const AddVehicleScreen = ({ navigation, route }) => {
  const vehicle = route?.params?.vehicle;
  const isEdit = !!vehicle;
  const [loading, setLoading] = useState(false);

  const [vehicleNo, setVehicleNo] = useState(vehicle?.vehicle_no || "");
  const [owner, setOwner] = useState(vehicle?.owner || "");
  const [type, setType] = useState(vehicle?.type || "");
  const [model, setModel] = useState(vehicle?.model || "");
  const [stkNo, setStkNo] = useState(vehicle?.stk_no || "");
  const [insNo, setInsNo] = useState(vehicle?.ins_no || "");
  const [insExpDate, setInsExpDate] = useState(vehicle?.ins_exp_date || "");

  const [showTypeModal, setShowTypeModal] = useState(false);

  const handleSubmit = async () => {
    if (!vehicleNo || !owner || !type) {
      Alert.alert("Validation", "Vehicle No, Owner & Type are required");
      return;
    }

    try {
      setLoading(true);

      const user = await Common.getLoggedInUser();

      const userObj = {
        user_id: user.unit_id,
        group_id: user.role_id,
        flat_no: user.flat_no,
        unit_id: user.unit_id,
        society_id: user.societyId,
      };

      const headers = await Util.getCommonAuth();

      const payload = {
        vehicle_no: vehicleNo,
        owner,
        type,
        model,
        stk_no: stkNo,
        ins_no: insNo,
        ins_exp_date: insExpDate,
        provider: null,
        rf_id: null,
        secret_code: null,
      };

      let response;

      if (isEdit) {
        // UPDATE MODE
        const url = `${API_URL2}/my/vehicle/${vehicle.id}?api-token=${user.api_token
          }&user-id=${encodeURIComponent(JSON.stringify(userObj))}`;

        response = await ApiCommon.postReq(url, payload, headers);
      } else {
        // ADD MODE
        const url = `${API_URL2}/my/vehicle?api-token=${user.api_token
          }&user-id=${encodeURIComponent(JSON.stringify(userObj))}`;

        response = await ApiCommon.putReq(url, payload, headers);
      }

      if (response.status === "success") {
        Alert.alert(
          "Success",
          isEdit ? "Vehicle updated successfully" : "Vehicle added successfully"
        );
        navigation.goBack();
      } else {
        Alert.alert("Error", response.message || "Something went wrong");
      }
    } catch (error) {
      console.log("Vehicle Error:", error);
      Alert.alert("Error", "Operation failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1668A5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Update Vehicle" : "Add Vehicle"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex - MH12BA0223"
          value={vehicleNo}
          onChangeText={setVehicleNo}
        />

        <Text style={styles.label}>Owner</Text>
        <TextInput
          style={styles.input}
          placeholder="Vehicle Owner Name"
          value={owner}
          onChangeText={setOwner}
        />

        {/* Type Selector */}
        <Text style={styles.label}>Type</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTypeModal(true)}
        >
          <Text style={{ color: type ? "#000" : "#999" }}>
            {type || "Select Vehicle Type"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          placeholder="Vehicle Model"
          value={model}
          onChangeText={setModel}
        />

        <Text style={styles.label}>Sticker Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Vehicle Sticker Number"
          value={stkNo}
          onChangeText={setStkNo}
        />

        <Text style={styles.label}>Insurance Number (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Vehicle Insurance Number"
          value={insNo}
          onChangeText={setInsNo}
        />

        <Text style={styles.label}>Insurance Expire Date (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={insExpDate}
          onChangeText={setInsExpDate}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isEdit ? "UPDATE VEHICLE" : "ADD VEHICLE"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Modal */}
      <Modal
        transparent
        visible={showTypeModal}
        animationType="none"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>Select Vehicle Type</Text>

            {["Car", "Bike", "2 Wheeler", "Other"].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.sheetItem}
                onPress={() => {
                  setType(item);
                  setShowTypeModal(false);
                }}
              >
                <Text style={styles.sheetText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AddVehicleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  header: {
    height: 60,
    backgroundColor: "#1668A5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 20,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#1668A5",
    marginTop: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    fontSize: 15,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#1668A5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 70
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
  },
  sheetItem: {
    paddingVertical: 12,
  },
  sheetText: {
    fontSize: 15,
    fontWeight: "500",
  },
});