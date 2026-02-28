import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

const SlidingTabs = ({
  tabs = [],
  activeIndex = 0,
  onTabPress,
  primaryColor = "#1996D3",
  inactiveColor = "#6B7280",
  containerStyle,
  scrollX,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const tabWidth =
    containerWidth && tabs.length
      ? containerWidth / tabs.length
      : 0;

  // When NOT using scrollX (manual tab press animation)
  useEffect(() => {
    if (!scrollX && tabWidth) {
      Animated.spring(translateX, {
        toValue: activeIndex * tabWidth,
        useNativeDriver: true,
        tension: 120,
        friction: 10,
      }).start();
    }
  }, [activeIndex, tabWidth]);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View
        style={styles.container}
        onLayout={(e) =>
          setContainerWidth(e.nativeEvent.layout.width)
        }
      >
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.tab, { width: tabWidth }]}
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

        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: tabWidth,
                backgroundColor: primaryColor,
                transform: scrollX
                  ? [
                      {
                        translateX: scrollX.interpolate({
                          inputRange: tabs.map(
                            (_, i) => i * screenWidth
                          ),
                          outputRange: tabs.map(
                            (_, i) => i * tabWidth
                          ),
                          extrapolate: "clamp",
                        }),
                      },
                    ]
                  : [{ translateX }],
              },
            ]}
          />
        )}
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
  },
});