import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StatusModal = ({
  visible,
  type = "loading",
  title,
  subtitle,
  onClose,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(null);
  

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      if (type === "loading") {
        rotation.setValue(0);
        rotationAnim.current = Animated.loop(
          Animated.timing(rotation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        );
        rotationAnim.current.start();
      }
    } else {
      opacity.setValue(0);
      scale.setValue(0.7);
      rotation.setValue(0);
      if (rotationAnim.current) rotationAnim.current.stop();
    }

    return () => {
      if (rotationAnim.current) rotationAnim.current.stop();
    };
  }, [visible, type]);

  if (!visible) return null;

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });



  const getIcon = () => {
    if (type === "success")
      return <Ionicons name="checkmark-circle" size={60} color="#22C55E" />;
    if (type === "error")
      return <Ionicons name="close-circle" size={60} color="#EF4444" />;
    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons name="sync" size={50} color="#1996D3" />
      </Animated.View>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.box, { transform: [{ scale }] }]}>
          {getIcon()}

          <Text style={styles.title}>{title}</Text>

          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}

          {type === "error" && (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default StatusModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 280,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  closeText: {
    color: "#fff",
    fontWeight: "600",
  },
});