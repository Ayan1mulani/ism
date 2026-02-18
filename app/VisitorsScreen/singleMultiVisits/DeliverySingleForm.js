import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import ProviderSelector from "../components/ProviderSelector";
import CalendarSelector from "../components/Calender";
import { Ionicons } from "@expo/vector-icons";

const SingleDeliveryForm = ({ theme }) => {
  const [deliveryPerson, setDeliveryPerson] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [visitDate, setVisitDate] = useState(null);
  const [entriesPerDay, setEntriesPerDay] = useState(1);

  const handleSubmit = () => {
    console.log({
      type: "delivery-single",
      provider: selectedProvider,
      deliveryPerson,
      mobile,
      visitDate,
      entriesPerDay,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      
      {/* 🔵 Provider Selector */}
      <ProviderSelector
        visitorType="delivery"
        theme={theme}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        stylesFromParent={styles}
      />


      {/* 🔵 Visit Date Calendar */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <CalendarSelector
          selectedDate={visitDate}
          onDateSelect={setVisitDate}
          label="Visit Date"
          required={true}
          nightMode={false}
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

      {/* 🔵 Save Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: theme.primaryBlue },
        ]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Schedule Delivery</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default SingleDeliveryForm;

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

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  phoneRow: {
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

  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
    position:"relative",
    bottom:0
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});