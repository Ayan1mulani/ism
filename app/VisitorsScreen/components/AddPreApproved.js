import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Modal,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarSelector from './Calender';


const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

// Popular Categories (Quick Selection)
const categories = [
    { label: "Cook", icon: "restaurant-outline" },
    { label: "Maid", icon: "home-outline" },
    { label: "Nanny", icon: "happy-outline" },
    { label: "Driver", icon: "car-outline" },
];

// Categorized Services
const categoryGroups = {
    "Home Services": [
        { label: "Electrician", icon: "flash-outline" },
        { label: "Plumber", icon: "construct-outline" },
        { label: "Carpenter", icon: "hammer-outline" },
        { label: "Painter", icon: "color-palette-outline" },
        { label: "AC Service", icon: "snow-outline" },
        { label: "Pest Control", icon: "bug-outline" },
        { label: "Gardener", icon: "leaf-outline" },
        { label: "Security", icon: "shield-checkmark-outline" },
    ],
    "Utility Services": [
        { label: "Gas Delivery", icon: "flame-outline" },
        { label: "Water Supplier", icon: "water-outline" },
        { label: "Internet Service", icon: "wifi-outline" },
        { label: "Milk Delivery", icon: "cafe-outline" },
        { label: "Laundry", icon: "shirt-outline" },
    ],
    "Other Services": [
        { label: "Cleaning Service", icon: "sparkles-outline" },
        { label: "Technician", icon: "build-outline" },
        { label: "Mechanic", icon: "settings-outline" },
        { label: "Tutor", icon: "book-outline" },
        { label: "Babysitter", icon: "happy-outline" },
        { label: "Cook Helper", icon: "restaurant-outline" },
        { label: "Driver Agency", icon: "car-sport-outline" },
    ],
};

// Flatten for "More" button count
const moreCategories = Object.values(categoryGroups).flat();

const AddPreApprovedVisitor = ({ navigation }) => {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [durationType, setDurationType] = useState("15");
    const [category, setCategory] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedDays, setSelectedDays] = useState([]);
    const [entriesPerDay, setEntriesPerDay] = useState(1);

    // Animation refs
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const spinLoopAnim = useRef(null);

    // Start spinner animation when loading
    useEffect(() => {
        if (isLoading) {
            spinLoopAnim.current = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                })
            );
            spinLoopAnim.current.start();
        } else {
            if (spinLoopAnim.current) {
                spinLoopAnim.current.stop();
            }
        }

        return () => {
            if (spinLoopAnim.current) {
                spinLoopAnim.current.stop();
            }
        };
    }, [isLoading]);

    // Reset animations when modal closes
    useEffect(() => {
        if (!showSuccess) {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
            spinAnim.setValue(0);
        }
    }, [showSuccess]);

    const spinInterpolate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const increaseEntries = () => {
        setEntriesPerDay(prev => prev + 1);
    };

    const decreaseEntries = () => {
        if (entriesPerDay > 1) {
            setEntriesPerDay(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        // Validation
        if (!name.trim()) {
            Alert.alert("Missing Field", "Please enter visitor name");
            return;
        }

        if (!phone.trim()) {
            Alert.alert("Missing Field", "Please enter 10-digit phone number");
            return;
        }

        if (phone.trim().length !== 10) {
            Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
            return;
        }

        if (!category) {
            Alert.alert("Missing Field", "Please select a category");
            return;
        }

        if (!startDate || !endDate) {
            Alert.alert("Select Duration", "Please select start and end date");
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            Alert.alert("Invalid Duration", "End date cannot be before start date");
            return;
        }

        if (selectedDays.length === 0) {
            Alert.alert("Select Days", "Please select at least one active day");
            return;
        }

        // Show loading
        setIsLoading(true);
        setShowSuccess(true);

        // Simulate API call (1.5 seconds)
        setTimeout(() => {
            setIsLoading(false);

            // Animate checkmark
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Save data
            console.log({
                name,
                phone,
                category,
                startDate,
                endDate,
                selectedDays,
                entriesPerDay,
            });

            // Navigate after 2 seconds
            setTimeout(() => {
                navigation.goBack();
            }, 2000);
        }, 1500);
    };

    const setPresetDuration = (days) => {
        const today = new Date();
        const end = new Date();
        end.setDate(today.getDate() + days);

        setStartDate(today.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
    };

    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitleText}>
                        Pre-Approved Visitor
                    </Text>
                    <Text style={styles.headerSubtitleText}>
                        Allow repeated visits
                    </Text>
                </View>

                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons
                        name="notifications-outline"
                        size={22}
                        color="#6B7280"
                    />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Name */}
                <Input
                    label="Visitor Name"
                    placeholder="Enter Visitors name"
                    value={name}
                    onChange={setName}
                />

                {/* Phone */}
                <Text style={styles.label}>
                    Mobile Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.phoneInputContainer}>
                    <View style={styles.countryCodeBox}>
                        <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter 10-digit mobile number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        maxLength={10}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Category */}
                <Text style={styles.label}>
                    Category <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.iconGrid}>
                    {category ? (
                        // Show selected category
                        <>
                            {(() => {
                                // Find the selected item from all categories
                                const allItems = [...categories, ...moreCategories];
                                const selectedItem = allItems.find(item => item.label === category);
                                
                                return selectedItem ? (
                                    <TouchableOpacity
                                        style={styles.iconItem}
                                        onPress={() => setShowCategoryModal(true)}
                                    >
                                        <View style={[styles.iconBox, styles.iconBoxActive]}>
                                            <Ionicons
                                                name={selectedItem.icon}
                                                size={24}
                                                color="#1996D3"
                                            />
                                        </View>
                                        <Text style={[styles.iconLabel, { color: "#1996D3", fontWeight: "600" }]}>
                                            {selectedItem.label}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null;
                            })()}
                            
                            {/* Change Button */}
                            <TouchableOpacity
                                style={styles.iconItem}
                                onPress={() => setShowCategoryModal(true)}
                            >
                                <View style={[styles.iconBox, styles.changeBox]}>
                                    <Ionicons
                                        name="pencil-outline"
                                        size={20}
                                        color="#1996D3"
                                    />
                                </View>
                                <Text style={styles.iconLabel}>Change</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        // Show popular categories if none selected
                        <>
                            {categories.map((item) => {
                                return (
                                    <TouchableOpacity
                                        key={item.label}
                                        style={styles.iconItem}
                                        onPress={() => setCategory(item.label)}
                                    >
                                        <View style={styles.iconBox}>
                                            <Ionicons
                                                name={item.icon}
                                                size={24}
                                                color="#6B7280"
                                            />
                                        </View>
                                        <Text style={styles.iconLabel}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* MORE BUTTON */}
                            <TouchableOpacity
                                style={styles.iconItem}
                                onPress={() => setShowCategoryModal(true)}
                            >
                                <View style={[styles.iconBox, styles.moreBox]}>
                                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#1996D3" }}>
                                        +{moreCategories.length}
                                    </Text>
                                </View>
                                <Text style={styles.iconLabel}>More</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Duration Section */}
                <View
                    style={[
                        styles.durationContainer,
                        durationType === "custom" && styles.durationContainerActive,
                    ]}
                >
                    <Text style={styles.label}>
                        Duration <Text style={styles.required}>*</Text>
                    </Text>

                    <View style={styles.durationRow}>
                        <TouchableOpacity
                            style={[
                                styles.durationButton,
                                durationType === "15" && styles.durationButtonActive,
                            ]}
                            onPress={() => {
                                setDurationType("15");
                                setPresetDuration(7);
                            }}
                        >
                            <Text
                                style={[
                                    styles.durationText,
                                    durationType === "15" && styles.durationTextActive,
                                ]}
                            >
                                1 Week
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.durationButton,
                                durationType === "30" && styles.durationButtonActive,
                            ]}
                            onPress={() => {
                                setDurationType("30");
                                setPresetDuration(30);
                            }}
                        >
                            <Text
                                style={[
                                    styles.durationText,
                                    durationType === "30" && styles.durationTextActive,
                                ]}
                            >
                                1 Month
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.durationButton,
                                durationType === "custom" && styles.durationButtonActive,
                            ]}
                            onPress={() => {
                                setDurationType("custom");
                                setStartDate(null);
                                setEndDate(null);
                            }}
                        >
                            <Text
                                style={[
                                    styles.durationText,
                                    durationType === "custom" && styles.durationTextActive,
                                ]}
                            >
                                Custom
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Custom Date Pickers */}
                    {durationType === "custom" && (
                        <View style={styles.dateRow}>
                            <View style={styles.dateColumn}>
                                <CalendarSelector
                                    selectedDate={startDate}
                                    onDateSelect={setStartDate}
                                    label="Start Date"
                                    required={true}
                                    nightMode={false}
                                />
                            </View>

                            <View style={styles.dateColumn}>
                                <CalendarSelector
                                    selectedDate={endDate}
                                    onDateSelect={setEndDate}
                                    label="End Date"
                                    required={true}
                                    nightMode={false}
                                />
                            </View>
                        </View>
                    )}
                </View>
         

                {/* Weekday Boxes */}
                <Text style={styles.label}>
                    Active Days <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.weekContainer}>
                    {weekDays.map((day) => {
                        const isSelected = selectedDays.includes(day);
                        return (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayBox,
                                    isSelected && styles.dayBoxActive,
                                ]}
                                onPress={() => toggleDay(day)}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        isSelected && styles.dayTextActive,
                                    ]}
                                >
                                    {day.substring(0, 3)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Entries Per Day */}
                <Text style={styles.label}>Entries Per Day</Text>
                <View style={styles.entriesContainer}>
                    <TouchableOpacity
                        style={styles.counterButton}
                        onPress={decreaseEntries}
                    >
                        <Ionicons name="remove" size={18} color="#1996D3" />
                    </TouchableOpacity>

                    <Text style={styles.entriesText}>{entriesPerDay}</Text>

                    <TouchableOpacity
                        style={styles.counterButton}
                        onPress={increaseEntries}
                    >
                        <Ionicons name="add" size={18} color="#1996D3" />
                    </TouchableOpacity>
                </View>

                {/* Submit */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Save Access</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Category Modal with Sections */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>

                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.headerContent}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                            <Ionicons name="close" size={26} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Categories with Sections */}
                    <ScrollView contentContainerStyle={styles.modalGrid}>
                        {/* Popular Section */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Popular</Text>
                            <View style={styles.categoryRow}>
                                {categories.map((item) => {
                                    const isSelected = category === item.label;
                                    return (
                                        <TouchableOpacity
                                            key={item.label}
                                            style={styles.modalCategoryItem}
                                            onPress={() => {
                                                setCategory(item.label);
                                                setShowCategoryModal(false);
                                            }}
                                        >
                                            <View
                                                style={[
                                                    styles.modalCategoryIcon,
                                                    isSelected && { borderColor: "#1996D3", borderWidth: 2 }
                                                ]}
                                            >
                                                <Ionicons
                                                    name={item.icon}
                                                    size={18}
                                                    color={isSelected ? "#1996D3" : "#6B7280"}
                                                />
                                            </View>
                                            <Text style={styles.modalCategoryText}>
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Service Groups */}
                        {Object.entries(categoryGroups).map(([groupName, services]) => (
                            <View key={groupName} style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>{groupName}</Text>
                                <View style={styles.categoryRow}>
                                    {services.map((item) => {
                                        const isSelected = category === item.label;
                                        return (
                                            <TouchableOpacity
                                                key={item.label}
                                                style={styles.modalCategoryItem}
                                                onPress={() => {
                                                    setCategory(item.label);
                                                    setShowCategoryModal(false);
                                                }}
                                            >
                                                <View
                                                    style={[
                                                        styles.modalCategoryIcon,
                                                        isSelected && { borderColor: "#1996D3", borderWidth: 2 }
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name={item.icon}
                                                        size={18}
                                                        color={isSelected ? "#1996D3" : "#6B7280"}
                                                    />
                                                </View>
                                                <Text style={styles.modalCategoryText}>
                                                    {item.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                </SafeAreaView>
            </Modal>

            {/* Success Overlay */}
            {showSuccess && (
                <View style={styles.successOverlay}>
                    <View style={styles.successContainer}>
                        {isLoading ? (
                            // Loading State with Animated Spinner
                            <>
                                <Animated.View
                                    style={[
                                        styles.loadingSpinner,
                                        {
                                            transform: [
                                                {
                                                    rotate: spinInterpolate,
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <View style={styles.spinner} />
                                </Animated.View>
                                <Text style={styles.loadingText}>
                                    Saving your visitor...
                                </Text>
                            </>
                        ) : (
                            // Success State with Animation
                            <>
                                <Animated.View
                                    style={[
                                        styles.successIconCircle,
                                        {
                                            transform: [{ scale: scaleAnim }],
                                            opacity: opacityAnim,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="checkmark"
                                        size={60}
                                        color="#fff"
                                    />
                                </Animated.View>
                                <Text style={styles.successTitle}>
                                    Invited Successfully!
                                </Text>
                                <Text style={styles.successSubtitle}>
                                    Visitor access has been saved
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const Input = ({ label, value, onChange, keyboard, multiline, height, placeholder }) => (
    <View style={{ marginBottom: 18 }}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[
                styles.input,
                multiline && { height: height || 80, textAlignVertical: 'top', paddingTop: 10 },
            ]}
            value={value}
            onChangeText={onChange}
            keyboardType={keyboard || 'default'}
            multiline={multiline}
            placeholder={placeholder || ""}
            placeholderTextColor="#9CA3AF"
        />
    </View>
);

export default AddPreApprovedVisitor;

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
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
        color: '#1F2937',
    },

    headerSubtitleText: {
        fontSize: 12,
        marginTop: 2,
        color: '#6B7280',
        fontWeight: '500',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
        color: '#1F2937',
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1F2937',
    },

    required: {
        color: '#EF4444',
    },

    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1F2937',
    },

    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 18,
        letterSpacing:2
    },

    countryCodeBox: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },

    countryCodeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },

    phoneInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        fontSize: 14,
        color: '#1F2937',
        letterSpacing:0
    },

    selectorBox: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    card: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: '#FAFAFA',
    },

    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 10,
    },
    durationContainer: {
        borderRadius: 12,
        marginBottom: 16,
        marginTop: 10
    },

    durationContainerActive: {
        backgroundColor: "#F3F4F6",
        padding: 15
    },

    dateColumn: {
        flex: 1,
    },

    categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 18,
    },

    categoryBox: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },

    iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
    },

    iconItem: {
        width: "20%",
        alignItems: "center",
        marginBottom: 16,
    },

    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },

    iconBoxActive: {
        backgroundColor: "#E6F4FB",
    },

    moreBox: {
        backgroundColor: "#E6F4FB",
    },

    changeBox: {
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    iconLabel: {
        fontSize: 12,
        marginTop: 6,
        textAlign: "center",
        color: "#6B7280",
        fontWeight: '500',
    },

    categoryBoxActive: {
        backgroundColor: "#1996D3",
        borderColor: "#1996D3",
    },

    categoryText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#000",
    },

    categoryTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    
    modalHeader: {
        backgroundColor: "#1996D3",
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop:55
    },

    headerContent: {
        flex: 1,
    },

    modalTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },

    modalGrid: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },

    sectionContainer: {
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
    },

    categoryRow: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    modalCategoryItem: {
        width: "25%",
        alignItems: "center",
        marginBottom: 20,
    },

    modalCategoryIcon: {
        width: 55,
        height: 55,
        borderRadius: 14,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },

    modalCategoryText: {
        fontSize: 11,
        fontWeight: "500",
        textAlign: "center",
    },

    datePickerBox: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dateBox: {
        flex: 0.48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    weekContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },

    dayBox: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        position: 'relative',
    },

    dayBoxActive: {
        backgroundColor: '#1996D3',
        borderColor: '#1996D3',
    },

    dayText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1F2937',
    },

    dayTextActive: {
        color: '#fff',
        fontWeight: '600',
    },

    checkIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
    },

    entriesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
        justifyContent: 'flex-start',
    },

    counterButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },

    entriesText: {
        fontSize: 18,
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'center',
        color: '#1F2937',
    },

    submitButton: {
        backgroundColor: '#1996D3',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },

    submitText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },

    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },

    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: '#fff',
    },

    durationRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 10,
    },

    durationButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    durationButtonActive: {
        backgroundColor: "#1996D3",
        borderColor: "#1996D3",
    },

    durationText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#1F2937",
    },

    durationTextActive: {
        color: "#fff",
        fontWeight: "600",
    },

    // Success Overlay Styles
    successOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },

    successContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 32,
        paddingVertical: 40,
        alignItems: "center",
        width: "80%",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },

    successIconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    successTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
        textAlign: "center",
    },

    successSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        fontWeight: "500",
    },

    // Loading Styles
    loadingSpinner: {
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    spinner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: "#E5E7EB",
        borderTopColor: "#1996D3",
        borderRightColor: "#1996D3",
    },

    loadingText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        textAlign: "center",
    },
});