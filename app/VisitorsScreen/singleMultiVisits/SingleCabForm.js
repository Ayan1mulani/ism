import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import ProviderSelector from "../components/ProviderSelector";
import CalendarSelector from "../components/Calender";
import { Ionicons } from "@expo/vector-icons";

const SingleCabForm = ({ theme }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [visitDate, setVisitDate] = useState(null);
  const [vehicleNo, setVehicleNo] = useState("");
  const [entriesPerDay, setEntriesPerDay] = useState(1);

  const handleVehicleChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length <= 4) setVehicleNo(numeric);
  };

  const handleSubmit = () => {
    console.log({
      type: "cab-single",
      provider: selectedProvider,
      visitDate,
      vehicleLast4: vehicleNo,
      entriesPerDay,
    });
  };

  return (
    <View style={{ flex: 1 }}>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔵 Cab Provider */}
        <ProviderSelector
          visitorType="cab"
          theme={theme}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          stylesFromParent={styles}
        />

        {/* 🔵 Visit Date */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <CalendarSelector
            selectedDate={visitDate}
            onDateSelect={setVisitDate}
            label="Visit Date"
            required={true}
            nightMode={false}
          />
        </View>

        {/* 🔵 Vehicle Number (Optional) */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Vehicle Number
          </Text>

          <TextInput
            value={vehicleNo}
            onChangeText={handleVehicleChange}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="0000"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.vehicleInput,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>

        {/* 🔵 Entries Per Day */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Entries Per Day
          </Text>

          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, { borderColor: theme.border }]}
              onPress={() =>
                setEntriesPerDay(Math.max(1, entriesPerDay - 1))
              }
            >
              <Ionicons name="remove" size={18} color={theme.primaryBlue} />
            </TouchableOpacity>

            <Text style={[styles.counterText, { color: theme.text }]}>
              {entriesPerDay}
            </Text>

            <TouchableOpacity
              style={[styles.counterBtn, { borderColor: theme.border }]}
              onPress={() => setEntriesPerDay(entriesPerDay + 1)}
            >
              <Ionicons name="add" size={18} color={theme.primaryBlue} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 🔵 Sticky Bottom Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: theme.primaryBlue },
        ]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Schedule Cab</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SingleCabForm;

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

  vehicleInput: {
    height: 45,
    borderWidth: 1,
    borderRadius: 14,
    textAlign: "center",
    fontSize: 26,
    letterSpacing: 15,
  },

  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  counterBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  counterText: {
    fontSize: 18,
    fontWeight: "600",
  },

  submitButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});