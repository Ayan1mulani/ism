import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import SlidingTabs from "../../app/components/SlidingTabs";
import MyStaffScreen from "./MyStaffScreen";
import SearchStaffScreen from "./SearchStaffScreen";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";

const StaffScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <MyStaffScreen />;
      case 1:
        return <SearchStaffScreen />;
      default:
        return null;
    }
  };

  return (
    <>
    <SafeAreaView style={styles.container}>
            <AppHeader title="Staff Management" />

      <SlidingTabs
        tabs={["My Staff", "Search Staff"]}
        activeIndex={activeIndex}
        onTabPress={setActiveIndex}
      />

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
    </>
  );
};

export default StaffScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
});