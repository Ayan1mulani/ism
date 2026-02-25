import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StatusModal = ({ visible, type = "loading", title, subtitle }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkBounce = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // ✅ Show icon for all types (loading, success, error)
      Animated.sequence([
        Animated.delay(120),
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

      // ✅ Special animation for checkmark (success)
      if (type === "success") {
        checkmarkScale.setValue(0);
        checkmarkBounce.setValue(0);
        
        // Checkmark pops in with bounce effect
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.spring(checkmarkScale, {
              toValue: 1,
              tension: 180,  // Higher tension for snappier pop
              friction: 12,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(checkmarkBounce, {
                toValue: -0.1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(checkmarkBounce, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start();
      }

      // ✅ Add continuous rotation for loading spinner
      if (type === "loading") {
        rotation.setValue(0);
        rotationAnim.current = Animated.loop(
          Animated.timing(rotation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        );
        rotationAnim.current.start();
      }
    } else {
      opacity.setValue(0);
      scale.setValue(0.7);
      iconScale.setValue(0);
      iconOpacity.setValue(0);
      checkmarkScale.setValue(0);
      checkmarkBounce.setValue(0);
      rotation.setValue(0);
      
      // ✅ Stop the rotation animation
      if (rotationAnim.current) {
        rotationAnim.current.stop();
      }
    }

    return () => {
      if (rotationAnim.current) {
        rotationAnim.current.stop();
      }
    };
  }, [visible, type]);

  if (!visible) return null;

  const getIcon = () => {
    if (type === "success")
      return <Ionicons name="checkmark-circle" size={60} color="#22C55E" />;
    if (type === "error")
      return <Ionicons name="close-circle" size={60} color="#EF4444" />;
    // Loading spinner
    return <Ionicons name="sync" size={50} color="#1996D3" />;
  };

  // ✅ Rotation interpolation for loading
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // ✅ Checkmark bounce interpolation
  const checkmarkTransformY = checkmarkBounce.interpolate({
    inputRange: [-0.1, 0],
    outputRange: [-10, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View style={[styles.box, { transform: [{ scale }] }]}>
          <Animated.View
            style={[
              {
                transform: [
                  { scale: type === "success" ? checkmarkScale : iconScale },
                  type === "loading" && { rotate: spin },
                  type === "success" && { translateY: checkmarkTransformY },
                ].filter(Boolean),
                opacity: iconOpacity,
              },
            ]}
          >
            {getIcon()}
          </Animated.View>

          <Text
            style={[
              styles.title,
              type === "error" && { color: "#EF4444" },
            ]}
          >
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </Animated.View>
      </Animated.View>
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
    width: 260,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    color: "#6B7280",
  },
});