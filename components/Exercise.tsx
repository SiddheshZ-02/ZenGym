import { useDataStore } from "@/store/DataStore";
import { LegendList } from "@legendapp/list";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { height, width } = Dimensions.get("window");

const Exercise = () => {
  const router = useRouter();
  const { bodyParts, loading, fetchBodyParts } = useDataStore();

  useEffect(() => {
    fetchBodyParts();
  }, [fetchBodyParts]);

  const handleBodyPart = (name: string) => {
    router.push({
      pathname: "/BodyPart/[name]",
      params: {
        name,
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

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
          data={bodyParts}
          contentContainerStyle={{ paddingInline: 10, marginTop: 5 }}
          numColumns={2}
          recycleItems
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            // For now, use a placeholder since we don't have images uploaded yet
            const imageSource = item.image_url
              ? { uri: item.image_url }
              : { uri: "https://placehold.co/180x180/32CD32/000?text=" + item.name };

            return (
              <TouchableOpacity
                style={{ height: 190, width: 190 }}
                onPress={() => handleBodyPart(item?.name)}
              >
                <Image
                  source={imageSource}
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
