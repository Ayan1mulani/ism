import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CalendarSelector from "../components/Calender";

const SingleVisitorForm = () => {

  // ✅ Internal predefined theme (no dependency from parent)
  const theme = {
    cardBg: "#FFFFFF",
    text: "#1F2937",
    textSecondary: "#6B7280",
    inputBg: "#F9FAFB",
    border: "#E5E7EB",
    primaryBlue: "#1996D3",
  };

  const [visitorName, setVisitorName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [selectedParking, setSelectedParking] = useState(null);

  const handleVehicleNoChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 4) {
      setVehicleNo(numericText);
    }
  };

  return (
    <>
      {/* Visitor Name */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Visitor Name <Text style={styles.required}>*</Text>
        </Text>

        <TextInput
          value={visitorName}
          onChangeText={setVisitorName}
          placeholder="Enter visitor name"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
        />
      </View>

      {/* Mobile Number */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Mobile Number <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.phoneInputContainer}>
          <View
            style={[
              styles.countryCode,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.countryCodeText, { color: theme.text }]}>
              +91
            </Text>
          </View>

          <TextInput
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.phoneInput,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>
      </View>

      {/* Scheduled Date */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <CalendarSelector
          selectedDate={visitDate}
          onDateSelect={setVisitDate}
          label="Scheduled Date"
          required={true}
          nightMode={false}
        />
      </View>

      {/* Vehicle Number */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Vehicle Number (Last 4 Digits - Optional)
        </Text>

        <View
          style={[
            styles.vehicleContainer,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.border,
            },
          ]}
        >
          <TextInput
            value={vehicleNo}
            onChangeText={handleVehicleNoChange}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="0000"
            placeholderTextColor={theme.textSecondary}
            style={[styles.vehicleInput, { color: theme.text }]}
          />
        </View>
      </View>

      {/* Parking Selection */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Need parking?
        </Text>

        <TouchableOpacity
          style={[
            styles.selectButton,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="car" size={20} color={theme.primaryBlue} />

          <Text
            style={[
              styles.selectButtonText,
              { color: theme.textSecondary },
            ]}
          >
            {selectedParking ? "Parking Selected" : "Select Parking"}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default SingleVisitorForm;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  required: {
    color: "#EF4444",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  phoneInputContainer: {
    flexDirection: "row",
    gap: 8,
  },

  countryCode: {
    width: 60,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
  },

  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  vehicleContainer: {
    height: 60,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  vehicleInput: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 15,
    width: "100%",
  },

  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },

  selectButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});