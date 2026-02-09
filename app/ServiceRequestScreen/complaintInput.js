// ComplaintInputScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePermissions } from '../../Utils/ConetextApi';

const { width } = Dimensions.get('window');

// --- YOUR THEME COLORS ---
const THEME_COLORS = {
  primaryAccent: '#1996D3',
  darkText: '#074B7C',
  inactiveText: '#6c757d',
  lightBackground: '#f4f7f9',
  componentBackground: '#ffffff',
  borderColor: '#e0e0e0',
  successColor: '#28a745',
  dangerColor: '#dc3545',
  // Night mode colors
  darkBackground: '#121212',
  darkComponentBackground: '#1e1e1e',
  darkBorderColor: '#333333',
  darkText: '#ffffff',
  darkInactiveText: '#aaaaaa',
};

// Mock location data - replace with your actual locations
const LOCATIONS = [
  { id: 1, name: 'Lobby Area' },
  { id: 2, name: 'Parking Area' },
  { id: 3, name: 'Garden Area' },
  { id: 4, name: 'Swimming Pool' },
  { id: 5, name: 'Gym Area' },
  { id: 6, name: 'Terrace' },
  { id: 7, name: 'Basement' },
  { id: 8, name: 'Common Bathroom' },
  { id: 9, name: 'Elevator' },
  { id: 10, name: 'Staircase' },
];

const ComplaintInputScreen = ({ navigation, route }) => {
  const { nightMode } = usePermissions();
  
  // Get passed data from navigation
  const { category, subCategory } = route.params || {};
  
  // Form state
  const [isASAP, setIsASAP] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic theme based on night mode
  const currentTheme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkText : "black",
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
    inputBackground: nightMode ? THEME_COLORS.darkComponentBackground : '#ffffff',
  };

  // Render category icon
  const renderCategoryIcon = (categoryData) => {
    if (!categoryData) return null;
    const { icon, iconType, color } = categoryData;
    const size = 18;
    
    switch (iconType) {
      case 'FontAwesome5':
        return <FontAwesome5 name={icon} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={icon} size={size} color={color} />;
      case 'Ionicons':
      default:
        return <Ionicons name={icon} size={size} color={color} />;
    }
  };

  // Handle image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets.slice(0, 5 - selectedImages.length)]);
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  // Handle time change
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!selectedLocation) {
      Alert.alert('Required Field', 'Please select a location.');
      return;
    }

    if (!remarks.trim()) {
      Alert.alert('Required Field', 'Please provide remarks describing the issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare complaint data
      const complaintData = {
        category: category,
        subCategory: subCategory,
        isASAP: isASAP,
        scheduledDate: !isASAP ? selectedDate : null,
        scheduledTime: !isASAP ? selectedTime : null,
        location: selectedLocation,
        remarks: remarks.trim(),
        images: selectedImages,
        createdAt: new Date(),
      };


      // TODO: Replace with actual API call
      // await complaintService.createComplaint(complaintData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success', 
        'Your complaint has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ServiceRequestTabs')
          }
        ]
      );

    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar 
        barStyle={nightMode ? "light-content" : "dark-content"} 
        backgroundColor={currentTheme.backgroundColor}
      />

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Selected Category & Subcategory */}
        <View style={[styles.selectionCard, { 
          backgroundColor: currentTheme.componentBackground,
          borderColor: currentTheme.borderColor 
        }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
            Selected Issue
          </Text>
          <View style={styles.selectedIssue}>
            <View style={[
              styles.categoryIconContainer,
              { backgroundColor: `${category?.color || THEME_COLORS.primaryAccent}20` }
            ]}>
              {renderCategoryIcon(category)}
            </View>
            <View style={styles.issueDetails}>
              <Text style={[styles.categoryName, { color: currentTheme.textColor }]}>
                {category?.name || 'Unknown Category'}
              </Text>
              <Text style={[styles.subCategoryName, { color: currentTheme.inactiveTextColor }]}>
                {subCategory?.name || 'Unknown Subcategory'}
              </Text>
            </View>
          </View>
        </View>

        {/* Priority Section */}
        <View style={[styles.sectionCard, { 
          backgroundColor: currentTheme.componentBackground,
          borderColor: currentTheme.borderColor 
        }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
            Priority
          </Text>
          {/* Priority options in one row */}
          <View style={styles.priorityOptionsRow}>
            <TouchableOpacity
              style={[
                styles.priorityOption,
                { borderColor: currentTheme.borderColor },
                isASAP && { backgroundColor: `${THEME_COLORS.primaryAccent}15`, borderColor: THEME_COLORS.primaryAccent }
              ]}
              onPress={() => setIsASAP(true)}
            >
              <Ionicons 
                name={isASAP ? "radio-button-on" : "radio-button-off"} 
                size={18} 
                color={isASAP ? THEME_COLORS.primaryAccent : currentTheme.inactiveTextColor} 
              />
              <Text style={[
                styles.priorityText, 
                { color: isASAP ? THEME_COLORS.primaryAccent : currentTheme.textColor }
              ]}>
                ASAP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityOption,
                { borderColor: currentTheme.borderColor },
                !isASAP && { backgroundColor: `${THEME_COLORS.primaryAccent}15`, borderColor: THEME_COLORS.primaryAccent }
              ]}
              onPress={() => setIsASAP(false)}
            >
              <Ionicons 
                name={!isASAP ? "radio-button-on" : "radio-button-off"} 
                size={18} 
                color={!isASAP ? THEME_COLORS.primaryAccent : currentTheme.inactiveTextColor} 
              />
              <Text style={[
                styles.priorityText, 
                { color: !isASAP ? THEME_COLORS.primaryAccent : currentTheme.textColor }
              ]}>
                Schedule
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date & Time Selection */}
          {!isASAP && (
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={[styles.dateTimeButton, { 
                  backgroundColor: currentTheme.inputBackground,
                  borderColor: currentTheme.borderColor 
                }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={18} color={THEME_COLORS.primaryAccent} />
                <Text style={[styles.dateTimeText, { color: currentTheme.textColor }]}>
                  {formatDate(selectedDate)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateTimeButton, { 
                  backgroundColor: currentTheme.inputBackground,
                  borderColor: currentTheme.borderColor 
                }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={18} color={THEME_COLORS.primaryAccent} />
                <Text style={[styles.dateTimeText, { color: currentTheme.textColor }]}>
                  {formatTime(selectedTime)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Location Selection */}
        <View style={[styles.sectionCard, { 
          backgroundColor: currentTheme.componentBackground,
          borderColor: currentTheme.borderColor 
        }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
            Location *
          </Text>
          <TouchableOpacity
            style={[styles.locationButton, { 
              backgroundColor: currentTheme.inputBackground,
              borderColor: currentTheme.borderColor 
            }]}
            onPress={() => setShowLocationModal(true)}
          >
            <Ionicons name="location" size={18} color={THEME_COLORS.primaryAccent} />
            <Text style={[
              styles.locationText, 
              { color: selectedLocation ? currentTheme.textColor : currentTheme.inactiveTextColor }
            ]}>
              {selectedLocation?.name || 'Select Location'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={currentTheme.inactiveTextColor} />
          </TouchableOpacity>
        </View>

        {/* Remarks */}
        <View style={[styles.sectionCard, { 
          backgroundColor: currentTheme.componentBackground,
          borderColor: currentTheme.borderColor 
        }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
            Remarks *
          </Text>
          <TextInput
            style={[styles.remarksInput, { 
              backgroundColor: currentTheme.inputBackground,
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor
            }]}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={currentTheme.inactiveTextColor}
            multiline
            numberOfLines={3}
            value={remarks}
            onChangeText={setRemarks}
            textAlignVertical="top"
          />
        </View>

        {/* Image Upload */}
        <View style={[styles.sectionCard, { 
          backgroundColor: currentTheme.componentBackground,
          borderColor: currentTheme.borderColor 
        }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
            Images (Optional)
          </Text>
          
          <TouchableOpacity
            style={[styles.imageUploadButton, { 
              backgroundColor: `${THEME_COLORS.primaryAccent}10`,
              borderColor: THEME_COLORS.primaryAccent 
            }]}
            onPress={pickImage}
            disabled={selectedImages.length >= 5}
          >
            <Ionicons name="camera" size={20} color={THEME_COLORS.primaryAccent} />
            <Text style={[styles.imageUploadText, { color: THEME_COLORS.primaryAccent }]}>
              Add Images ({selectedImages.length}/5)
            </Text>
          </TouchableOpacity>

          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <View style={styles.imageContainer}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={18} color={THEME_COLORS.dangerColor} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: THEME_COLORS.primaryAccent,
              opacity: isSubmitting ? 0.7 : 1 
            }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { 
            backgroundColor: currentTheme.componentBackground,
            borderColor: currentTheme.borderColor 
          }]}>
            <View style={[styles.modalHeader, { borderBottomColor: currentTheme.borderColor }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.textColor }]}>
                Select Location
              </Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color={currentTheme.inactiveTextColor} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationOption,
                    { borderBottomColor: currentTheme.borderColor },
                    selectedLocation?.id === location.id && { backgroundColor: `${THEME_COLORS.primaryAccent}15` }
                  ]}
                  onPress={() => {
                    setSelectedLocation(location);
                    setShowLocationModal(false);
                  }}
                >
                  <Text style={[
                    styles.locationOptionText,
                    { color: selectedLocation?.id === location.id ? THEME_COLORS.primaryAccent : currentTheme.textColor }
                  ]}>
                    {location.name}
                  </Text>
                  {selectedLocation?.id === location.id && (
                    <Ionicons name="checkmark" size={20} color={THEME_COLORS.primaryAccent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom:70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  selectionCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  sectionCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedIssue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  issueDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  subCategoryName: {
    fontSize: 13,
  },
  priorityOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  dateTimeText: {
    fontSize: 14,
    marginLeft: 6,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  remarksInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    minHeight: 70,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  submitButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: 400,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  locationOptionText: {
    fontSize: 15,
  },
});

export default ComplaintInputScreen;
