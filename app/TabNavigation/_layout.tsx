import { useDataStore } from "@/store/dataStore";
import { useResponsive } from "@/constants/responsive";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabsLayout = () => {
  const workoutCount = useDataStore((state) => state.workoutList.length);
  const { spacing, ms, radius, isSmallPhone } = useResponsive();
  const insets = useSafeAreaInsets();

  const tabBarBottom = insets.bottom + spacing.sm;
  const tabBarHorizontalPadding = isSmallPhone ? spacing.xl : spacing.xxl;
  const tabBarGap = isSmallPhone ? spacing.lg : spacing.xl;
  const iconSize = isSmallPhone ? ms(20) : ms(22);
  const badgeSize = isSmallPhone ? spacing.md : spacing.lg;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, descriptors, navigation }) => {
        // Only show tabs that are visible (href !== null)
        const visibleRoutes = state.routes.filter((route) => {
          const options = descriptors[route.key].options as any;
          return options?.href !== null;
        });

        return (
          <View style={[styles.tabBarWrapper, { bottom: tabBarBottom }]}>
            <View
              style={[
                styles.tabBar,
                {
                  paddingVertical: spacing.sm,
                  paddingHorizontal: tabBarHorizontalPadding,
                  gap: tabBarGap,
                  borderRadius: radius.full,
                },
              ]}
            >
              {visibleRoutes.map((route) => {
                const isFocused = state.routes[state.index].key === route.key;

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                const iconName =
                  route.name === "HomeScreen" ? "home" : "dumbbell";

                const badgeCount =
                  route.name === "WorkoutListsScreen" ? workoutCount : 0;

                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={onPress}
                    style={styles.tabItem}
                  >
                    <FontAwesome5
                      name={iconName}
                      size={iconSize}
                      color={isFocused ? "#32CD32" : "#777"}
                    />
                    {badgeCount > 0 && (
                      <View
                        style={[
                          styles.badge,
                          {
                            minWidth: badgeSize,
                            height: badgeSize,
                            borderRadius: badgeSize / 2,
                          },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      }}
    >
      <Tabs.Screen name="HomeScreen" />
      <Tabs.Screen name="BodyPart/[name]" options={{ href: null }} />
      <Tabs.Screen
        name="Details/[exercisesDetails]"
        options={{ href: null }}
      />
      <Tabs.Screen name="WorkoutListsScreen" />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minWidth: 44,
    minHeight: 44,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#000",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
});

export default TabsLayout;
