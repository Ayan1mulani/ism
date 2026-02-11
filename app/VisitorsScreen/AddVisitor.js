import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePermissions } from "../../Utils/ConetextApi";
import Util from "../../services/Util";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarSelector from "./Calender";




const AddVisitor = ({ navigation }) => {
    const { nightMode, user } = usePermissions();

    const [visitorName, setVisitorName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [purpose, setPurpose] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");
    const [visitDate, setVisitDate] = useState("");
    const [visitTime, setVisitTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedParking, setSelectedParking] = useState(null);

    const theme = {
        bg: nightMode ? "#0F0F0F" : "#ffffff",
        cardBg: nightMode ? "#1A1A1A" : "#FFFFFF",
        text: nightMode ? "#FFFFFF" : "#1F2937",
        textSecondary: nightMode ? "#9CA3AF" : "#6B7280",
        inputBg: nightMode ? "#2A2A2A" : "#F9FAFB",
        border: nightMode ? "#374151" : "#E5E7EB",
        primaryBlue: "#1D9BF0",
        selectedDate: "#4f7cca",
    };

    const handleVehicleNoChange = (text) => {
        // Only allow numbers and limit to 4 digits
        const numericText = text.replace(/[^0-9]/g, "");
        if (numericText.length <= 4) {
            setVehicleNo(numericText);
        }
    };

    const getLast4Digits = () => {
        return vehicleNo;
    };

    const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    const handleParkingNavigation = () => {
        if (!vehicleNo || vehicleNo.length < 4) {
            Alert.alert("Vehicle Required", "Please enter all 4 digits of vehicle number to book parking");
            return;
        }

        navigation.navigate("ParkingSelection", {
            vehicleLast4: vehicleNo,
            vehicleNo: vehicleNo,
            onParkingSelected: (parkingData) => {
                setSelectedParking(parkingData);
            }
        });
    };

    const handleSubmit = async () => {
        const visitDateTime = new Date(visitDate);
        visitDateTime.setHours(visitTime.getHours());
        visitDateTime.setMinutes(visitTime.getMinutes());

        const bookingFrom = Util.formatDateTime(visitDateTime);
        const bookingTo = Util.formatDateTime(
            new Date(visitDateTime.getTime() + 2 * 60 * 60 * 1000)
        );


        try {

            const payload = {
                booking_from: bookingFrom,
                booking_to: bookingTo,
                location_id: 188,
                data: {
                    name: visitorName,
                    phone_no: mobileNumber,
                    date: Util.formatDate(visitDateTime),
                    type: "VISITOR",
                    remarks: purpose,
                    vehicle_no: vehicleNo,
                    parking_details: selectedParking,
                    vehicle_last_4: vehicleNo,
                },
                reference_id: user.unit_id,
                status: 1,
                user_id: JSON.stringify(user),
            };
            setLoading(true);
            const res = await ismServices.addMyVisitor(payload)
            console.log(res, 'this is res')

            setVisitorName("");
            setMobileNumber("");
            setPurpose("");
            setVehicleNo("");
            setVisitDate("");
            setVisitTime(new Date());
            setSelectedParking(null);
            Alert.alert("Success", "Visitor added successfully");
            navigation.goBack();
        } catch (err) {
            console.error("Add visitor error:", err);
            Alert.alert("Error", "Failed to add visitor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderTimePicker = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const minutes = [0, 15, 30, 45];

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={showTimePicker}
                onRequestClose={() => setShowTimePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalOverlayTouchable}
                        activeOpacity={1}
                        onPress={() => setShowTimePicker(false)}
                    />
                    <View style={[styles.timeModal, { backgroundColor: theme.cardBg }]}>
                        <View style={styles.timeHeader}>
                            <Text style={[styles.timeTitle, { color: theme.text }]}>
                                Select Time
                            </Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.timeScrollContainer}>
                            {hours.map((hour) => (
                                <View key={hour}>
                                    {minutes.map((minute) => {
                                        const time = new Date();
                                        time.setHours(hour, minute);
                                        const isSelected =
                                            visitTime.getHours() === hour &&
                                            visitTime.getMinutes() === minute;

                                        return (
                                            <TouchableOpacity
                                                key={`${hour}-${minute}`}
                                                style={[
                                                    styles.timeOption,
                                                    { borderBottomColor: theme.border },
                                                    isSelected && { backgroundColor: theme.selectedDate },
                                                ]}
                                                onPress={() => {
                                                    setVisitTime(time);
                                                    setShowTimePicker(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.timeText,
                                                        { color: theme.text },
                                                        isSelected && styles.selectedTimeText,
                                                    ]}
                                                >
                                                    {formatTime(time)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    return (

        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitleText, { color: theme.text }]}>
                        Invite Guest
                    </Text>
                    <Text style={[styles.headerSubtitleText, { color: theme.textSecondary }]}>
                        Schedule a guest visit
                    </Text>
                </View>
                <View>
                    <Ionicons name="notifications" size={22} color={theme.textSecondary} left="20" />
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Visitor Name */}
                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.label, { color: theme.text }]}>
                        Visitor Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        value={visitorName}
                        onChangeText={setVisitorName}
                        placeholder="Enter visitor's  name"
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

                <View style={[styles.horizontalLine, { backgroundColor: theme.border }]} />

                {/* Mobile Number */}
                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.label, { color: theme.text }]}>
                        Mobile Number <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.phoneInputContainer}>
                        <View style={[styles.countryCode, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                            <Text style={[styles.countryCodeText, { color: theme.text }]}>+91</Text>
                        </View>
                        <TextInput
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            placeholder="Enter 10-digit mobile number"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="phone-pad"
                            maxLength={10}
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

                <View style={[styles.horizontalLine, { backgroundColor: theme.border }]} />

                {/* Visit Date using CalendarSelector */}
                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <CalendarSelector
                        selectedDate={visitDate}
                        onDateSelect={setVisitDate}
                        label="Scheduled Date"
                        required={true}
                        nightMode={nightMode}
                    />
                </View>
                <View style={[styles.horizontalLine, { backgroundColor: theme.border }]} />


                {/* Vehicle Number - Last 4 Digits */}
                {/* Vehicle Number - Last 4 Digits */}
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
                            style={[styles.vehicleInput, { color: theme.text }]}
                            placeholder="0000"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>
                </View>

                <View style={[styles.horizontalLine, { backgroundColor: theme.border }]} />

                {/* Parking Selection */}
                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.label, { color: theme.text }]}>
                        Need parking? Select a parking slot below
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.selectButton,
                            {
                                backgroundColor: theme.inputBg,
                                borderColor: theme.border,
                            },
                        ]}
                        onPress={handleParkingNavigation}
                    >
                        <Ionicons name="car" size={20} color={theme.primaryBlue} />
                        <Text
                            style={[
                                styles.selectButtonText,
                                { color: selectedParking ? theme.text : theme.textSecondary },
                            ]}
                        >
                            {selectedParking
                                ? `Parking Selected - ${getLast4Digits()}`
                                : "Select Parking"
                            }
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: theme.primaryBlue },
                        loading && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? "Adding Visitor..." : "Add Visitor"}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Time Picker Modal */}
            {renderTimePicker()}
        </SafeAreaView>
    );
};

export default AddVisitor;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitleText: {
        fontSize: 18,
        fontWeight: "700",
    },
    headerSubtitleText: {
        fontSize: 12,
        marginTop: 2,
    },
    headerRight: {
        width: 40,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
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
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 12,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    // Time Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalOverlayTouchable: {
        flex: 1,
    },
    timeModal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '60%',
    },
    timeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    timeTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    timeScrollContainer: {
        maxHeight: 300,
    },
    timeOption: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderRadius: 8,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    selectedTimeText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    horizontalLine: {
        height: 1,
        width: "100%",
        marginTop: 0,
    },
}); 