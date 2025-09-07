import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useAppContext } from "@/Context/ContextProvider";

const router = useRouter();
const _layout = () => {
  const { exercisesList } = useAppContext();
  const workoutCount = exercisesList.length;

  return (
    <Tabs
      tabBar={(props) => {
        return (
          <View
            style={{
              height: "6%",
              width: "50%",
              backgroundColor: "black",
              borderRadius: 100,
              position: "absolute",
              bottom: 20,
              left: "25%",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <TouchableOpacity onPress={() => router.push("/Home")}>
              <FontAwesome5 name="home" size={24} color="#32CD32" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.push("/WorkoutLists");
              }}
              style={{ position: "relative" }}
            >
              <FontAwesome5 name="dumbbell" size={24} color="#32CD32" />
              {workoutCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: "#FF4444",
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "black",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {workoutCount > 99 ? "99+" : workoutCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          headerShown: false,
         

          tabBarIcon: ({ focused }) => {
            return focused ? (
              <FontAwesome5 name="home" size={24} color="black" />
            ) : (
              <FontAwesome5 name="home" size={24} color="blue" />
            );
          },
        }}
      />
      <Tabs.Screen
        name="BodyPart/[name]"
        options={{ headerShown: false, href: null }}
      />
      <Tabs.Screen
        name="Details/[exercisesDetails]"
        options={{ headerShown: false, href: null }}
      />

      <Tabs.Screen
        name="WorkoutLists"
        options={{
          headerShown: false,
          headerTitleAlign: "center",
          tabBarBadge: workoutCount > 0 ? workoutCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#FF4444",
            color: "white",
            fontSize: 12,
            fontWeight: "bold",
          },
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  workoutTabContainer: {},
  badge: {},
  badgeText: {},
});

export default _layout;
