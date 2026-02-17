import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddPreVisitorModal = ({
  visible,
  nightMode,
  onClose,
  onSingleEntry,
  onPreApproved,
}) => {

  const theme = {
    background: nightMode ? '#1E1E1E' : '#FFFFFF',
    overlay: 'rgba(0,0,0,0.5)',
    text: nightMode ? '#FFFFFF' : '#212529',
    textSecondary: nightMode ? '#9E9E9E' : '#6C757D',
    border: nightMode ? '#2E2E2E' : '#E9ECEF',
    primary: '#1996D3',
    card: nightMode ? '#2A2A2A' : '#F8F9FA',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        
        {/* Bottom Sheet */}
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
            },
          ]}
        >

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>
              Add Visitor
            </Text>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Option 1 – Single Entry */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={onSingleEntry}
            activeOpacity={0.85}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="person-add-outline"
                size={22}
                color={theme.primary}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Single Entry
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  { color: theme.textSecondary },
                ]}
              >
                Approve a visitor for one visit only.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 2 – Pre Approved */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={onPreApproved}
            activeOpacity={0.85}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="repeat-outline"
                size={22}
                color={theme.primary}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Pre-Approved
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  { color: theme.textSecondary },
                ]}
              >
                Allow repeated visits (maid, delivery, staff).
              </Text>
            </View>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default AddPreVisitorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1, // 🔥 border added
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
  },

  optionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1, // 🔥 subtle border for each card
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  optionDesc: {
    fontSize: 13,
  },
});