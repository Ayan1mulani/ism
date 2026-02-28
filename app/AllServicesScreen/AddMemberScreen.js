import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import { visitorServices } from "../../services/visitorServices";

const RELATION_OPTIONS = [
  "Mother","Father","Son","Daughter","Husband","Wife","other","",
];

const AddMemberScreen = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [showRelationModal, setShowRelationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRelationSelect = (selectedRelation) => {
    setRelation(selectedRelation);
    setShowRelationModal(false);
  };

 const handleSubmit = async () => {
  if (!name.trim()) {
    alert("Please enter name");
    return;
  }

  try {
    setIsSubmitting(true);

    const res = await visitorServices.addFamilyMember({
      name: name.trim(),
      phone_no: contact,
      email: email,
      relation: relation,
      vehicle_no: vehicleNumber,
      image_src: null,
    });

    console.log("Add Member Response:", res);

    alert("✅ Member added successfully!");

  } catch (error) {
    alert("❌ Failed to add member");
  } finally {
    setIsSubmitting(false);
  }
};

  const renderRelationOption = ({ item }) => (
    <TouchableOpacity
      style={styles.relationOption}
      onPress={() => handleRelationSelect(item)}
    >
      <Text style={styles.relationOptionText}>{item}</Text>
      {relation === item && (
        <Ionicons name="checkmark" size={20} color="#1565A9" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Add Member" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* Profile */}
            <View style={styles.imageSection}>
              <View style={styles.profileCircle}>
                <Ionicons name="person" size={42} color="#9CA3AF" />
              </View>
              <TouchableOpacity style={styles.changeButton}>
                <Ionicons name="camera" size={14} color="#fff" />
                <Text style={styles.changeText}>Add Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formCard}>

              {/* Name */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === "name" && styles.inputContainerFocused,
                ]}>
                  <Ionicons name="person" size={16} color="#1565A9" />
                  <TextInput
                    placeholder="Enter full name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput(null)}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Contact */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Contact Number</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === "contact" && styles.inputContainerFocused,
                ]}>
                  <Ionicons name="call" size={16} color="#1565A9" />
                  <TextInput
                    placeholder="Enter mobile number"
                    placeholderTextColor="#9CA3AF"
                    value={contact}
                    onChangeText={setContact}
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedInput("contact")}
                    onBlur={() => setFocusedInput(null)}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === "email" && styles.inputContainerFocused,
                ]}>
                  <Ionicons name="mail" size={16} color="#1565A9" />
                  <TextInput
                    placeholder="Enter email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Relation */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  Relation <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dropdownContainer}
                  onPress={() => setShowRelationModal(true)}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons name="people" size={16} color="#1565A9" />
                    <Text style={[
                      styles.dropdownText,
                      !relation && styles.dropdownPlaceholder,
                    ]}>
                      {relation || "Select relation"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#1565A9" />
                </TouchableOpacity>
              </View>

              {/* Vehicle */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Vehicle Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="car" size={16} color="#1565A9" />
                  <TextInput
                    placeholder="Enter vehicle number"
                    placeholderTextColor="#9CA3AF"
                    value={vehicleNumber}
                    onChangeText={setVehicleNumber}
                    style={styles.input}
                  />
                </View>
              </View>

            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <Text style={styles.buttonText}>Adding...</Text>
              ) : (
                <>
                  <Ionicons name="add-circle" size={18} color="#fff" />
                  <Text style={styles.buttonText}>ADD NEW MEMBER</Text>
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal */}
      <Modal
        visible={showRelationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRelationModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowRelationModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Relation</Text>
                  <TouchableOpacity onPress={() => setShowRelationModal(false)}>
                    <Ionicons name="close" size={22} color="#111827" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={RELATION_OPTIONS}
                  renderItem={renderRelationOption}
                  keyExtractor={(item) => item}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
};

export default AddMemberScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },

  imageSection: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 6,
  },
  profileCircle: {
    width: 95,
    height: 95,
    borderRadius: 47.5,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1565A9",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 6,
  },
  changeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  inputWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  required: {
    color: "#EF4444",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  inputContainerFocused: {
    borderColor: "#1565A9",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontWeight: "400",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1565A9",
    paddingVertical: 13,
    borderRadius: 10,
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  relationOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  relationOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
});