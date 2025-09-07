import { BodyPart } from "@/utils/ExerciseData";
import { LegendList } from "@legendapp/list";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height, width } = Dimensions.get("window");

const Exercise = () => {
  const router = useRouter();

  const handleBodyPart = (name: string) => {
    router.push({
      pathname: "/BodyPart/[name]",
      params: {
        name,
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          padding: 10,
          paddingInline: 20,
          backgroundColor: "#32CD32",
          width: width * 0.4,
          borderRadius: 50,
          margin: 10,
        }}
      >
        <Text style={{ fontSize: 25, fontWeight: 800 }}>Exercise</Text>
      </View>

      <View style={{ marginBottom: 80 }}>
        <LegendList
          data={BodyPart}
          contentContainerStyle={{ paddingInline: 10, marginTop: 5 }}
          numColumns={2}
          recycleItems
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={{ height: 190, width: 190 }}
                onPress={() => handleBodyPart(item?.name)}
              >
                <Image
                  source={item.image}
                  style={{ height: 180, width: 180, borderRadius: 30 }}
                />
                <Text
                  style={{
                    position: "absolute",
                    color: "black",
                    fontSize: 18,
                    fontWeight: 800,
                    bottom: 18,
                    left: 8,
                    backgroundColor: "#32CD32",
                    borderRadius: 20,
                    padding: 5,
                    textTransform: "capitalize",
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

export default Exercise;
