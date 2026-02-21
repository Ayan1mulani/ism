import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SlidingTabs = ({
  tabs = [],
  activeIndex = 0,
  onTabPress,
  primaryColor = "#1996D3",
  inactiveColor = "#6B7280",
  containerStyle,
}) => {
  const tabWidth = (SCREEN_WIDTH - 32) / tabs.length;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();
  }, [activeIndex]);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.container}>
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;

          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => onTabPress(index)}
            >
              <Text
                style={[
                  styles.label,
                  { color: isActive ? primaryColor : inactiveColor },
                  isActive && styles.activeLabel,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth,
              backgroundColor: primaryColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

export default SlidingTabs;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  container: {
    flexDirection: "row",
    position: "relative",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeLabel: {
    fontWeight: "700",
  },
  indicator: {
    height: 3,
    borderRadius: 2,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});