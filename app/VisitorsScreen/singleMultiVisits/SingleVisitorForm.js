import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CalendarSelector from "../components/Calender";
import { visitorServices } from "../../../services/visitorServices";
import StatusModal from "../../components/StatusModal";

const SingleVisitorForm = () => {
  const navigation = useNavigation();

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
  const [visitDate, setVisitDate] = useState(null);
  const [vehicleNo, setVehicleNo] = useState("");
  const [selectedParking, setSelectedParking] = useState(null);
  const [modalType, setModalType] = useState(null); // null | "loading" | "success" | "error"
  const [errors, setErrors] = useState({});

  // Animation values
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.7)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  // Animate modal box in when modalType changes to any value
  useEffect(() => {
    if (modalType) {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset all animation values for next open
      modalOpacity.setValue(0);
      modalScale.setValue(0.7);
      iconScale.setValue(0);
      iconOpacity.setValue(0);
    }
  }, [modalType]);

  // Animate icon bounce when success or error
  useEffect(() => {
    if (modalType === "success" || modalType === "error") {
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.spring(iconScale, {
            toValue: 1,
            tension: 140,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(iconOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [modalType]);

  // Clear individual error as user types
  const handleNameChange = (text) => {
    setVisitorName(text);
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  };

  const handleMobileChange = (text) => {
    setMobileNumber(text);
    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: null }));
  };

  const handleDateChange = (date) => {
    setVisitDate(date);
    if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
  };

  const handleVehicleNoChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 4) {
      setVehicleNo(numericText);
    }
  };

  const handleSubmit = async () => {
    let newErrors = {};

    if (!visitorName.trim()) {
      newErrors.name = "Visitor name is required";
    }
    if (!mobileNumber || mobileNumber.length !== 10) {
      newErrors.mobile = "Enter valid 10-digit mobile number";
    }
    if (!visitDate) {
      newErrors.date = "Please select a date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const formattedDate =
        visitDate instanceof Date
          ? visitDate.toISOString().split("T")[0]
          : visitDate;

      const payload = {
        date_time: formattedDate,
        mobile: mobileNumber,
        name: visitorName,
        type: "guest",
      };

      setModalType("loading");

      const response = await visitorServices.addMyVisitor(payload);

      if (response) {
        setModalType("success");
        setTimeout(() => {
          setModalType(null);
          navigation.goBack();
        }, 1400);
      } else {
        // API responded but returned falsy
        setModalType("error");
        setTimeout(() => setModalType(null), 2000);
      }
    } catch (error) {
      console.log("❌ Error:", error);
      setModalType("error");
      setTimeout(() => setModalType(null), 2000);
    }
  };

  return (
    <>
      {/* Visitor Name */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Visitor Name <Text style={styles.required}>*</Text>
        </Text>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <TextInput
          value={visitorName}
          onChangeText={handleNameChange}
          placeholder="Enter visitor name"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: errors.name ? "#EF4444" : theme.border,
              color: theme.text,
            },
          ]}
        />
      </View>

      {/* Mobile */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Mobile Number <Text style={styles.required}>*</Text>
        </Text>
        {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
        <View style={styles.phoneInputContainer}>
          <View
            style={[
              styles.countryCode,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.countryCodeText, { color: theme.text }]}>
              +91
            </Text>
          </View>
          <TextInput
            value={mobileNumber}
            onChangeText={handleMobileChange}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.phoneInput,
              {
                backgroundColor: theme.inputBg,
                borderColor: errors.mobile ? "#EF4444" : theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>
      </View>

      {/* Date */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <CalendarSelector
          selectedDate={visitDate}
          onDateSelect={handleDateChange}
          label="Scheduled Date"
          required={true}
          nightMode={false}
        />
        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
      </View>

      {/* Vehicle Number */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Vehicle Number (Last 4 Digits - Optional)
        </Text>
        <View
          style={[
            styles.vehicleContainer,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
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

      {/* Parking */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Need parking?
        </Text>
        <TouchableOpacity
          style={[
            styles.selectButton,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
          ]}
        >
          <Ionicons name="car" size={20} color={theme.primaryBlue} />
          <Text style={[styles.selectButtonText, { color: theme.textSecondary }]}>
            {selectedParking ? "Parking Selected" : "Select Parking"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: theme.primaryBlue }]}
        onPress={handleSubmit}
        disabled={modalType === "loading"}
      >
        <Text style={styles.submitText}>Add Visitor</Text>
      </TouchableOpacity>

      {/* Animated Modal — loading / success / error */}
     <StatusModal
  visible={!!modalType}
  type={modalType}
  title={
    modalType === "loading"
      ? "Saving..."
      : modalType === "success"
      ? "Visitor Added"
      : "Failed!"
  }
  subtitle={
    modalType === "loading"
      ? "Please wait"
      : modalType === "success"
      ? "Redirecting..."
      : "Please try again"
  }
/>
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
    letterSpacing:0
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
  submitBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 3,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    width: 260,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    color: "#111827",
  },
  successSubtitle: {
    fontSize: 13,
    marginTop: 4,
    color: "#6B7280",
  },
});