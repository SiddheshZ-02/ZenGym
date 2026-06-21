import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExerciseType, useDataStore } from "@/store/DataStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LegendList } from "@legendapp/list";

const { height, width } = Dimensions.get("window");

const NamePage = () => {
  const [filteredParts, setFilteredParts] = useState<ExerciseType[]>([]);
  const [searchText, setSearchText] = useState("");

  const router = useRouter();
  const { name } = useLocalSearchParams();
  const { exercises, loading, fetchExercises } = useDataStore();

  // Fetch data when component mounts
  useEffect(() => {
    if (name) {
      fetchExercises(name as string);
    }
  }, [name, fetchExercises]);

  // Filter exercises
  useEffect(() => {
    setFilteredParts(exercises);
  }, [exercises]);

  // Search filter
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredParts(exercises);
      return;
    }
    const filtered = exercises.filter((item) => {
      const search = searchText.toLowerCase();
      const itemName = item.name || "";
      const itemBodyPart = item.body_part || "";
      const itemTarget = item.target || "";
      return (
        itemName.toLowerCase().includes(search) ||
        itemBodyPart.toLowerCase().includes(search) ||
        itemTarget.toLowerCase().includes(search)
      );
    });
    setFilteredParts(filtered);
  }, [searchText, exercises]);

  const handleDetails = (id: number) => {
    router.push({
      pathname: "/Details/[exercisesDetails]",
      params: { exercisesDetails: id },
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
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <SafeAreaView />
      {/* Search Bar at the top, with search icon */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarInner}>
          <AntDesign
            name="search"
            size={22}
            color="#32CD32"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search by name, body part, or target..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>
      </View>
      {/* Name Heading below search bar, always visible, with back button on left */}
      <View style={styles.headingContainerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AntDesign name="left-circle" size={36} color="#32CD32" />
        </TouchableOpacity>
        <Text style={styles.headingTextWithBack}>{name}</Text>
      </View>
      {/* List below search bar and heading, always scrollable */}
      <View style={{ flex: 1, left: 6 }}>
        <LegendList
          data={filteredParts}
          numColumns={2}
          recycleItems
          contentContainerStyle={{ paddingBottom: 30 }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={{
                  height: height * 0.32,
                  width: width * 0.5,
                  borderRadius: 30,
                }}
                onPress={() => handleDetails(item.id)}
              >
                <Image
                  source={
                    item.gif_url
                      ? item.gif_url
                      : "https://placehold.co/190x190/32CD32/000?text=" +
                        item.name
                  }
                  style={{ height: 190, width: 190, borderRadius: 30 }}
                  autoplay={false}
                  contentFit="cover"
                />
                <Text
                  style={{
                    fontSize: 18,
                    color: "white",
                    textAlign: "center",
                    width: width * 0.4,
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

const styles = StyleSheet.create({
  searchBarContainer: {
    padding: 16,
    backgroundColor: "#181818",
    zIndex: 10,
  },
  searchBarInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  filterBtn: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 8,
    marginLeft: 4,
  },
  filterBtnActive: {
    backgroundColor: "#32CD32",
  },
  headingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 0,
  },
  headingText: {
    fontSize: 35,
    fontWeight: "800",
    textTransform: "capitalize",
    backgroundColor: "#32CD32",
    borderRadius: 40,
    width: width * 0.6,
    textAlign: "center",
    marginBottom: 0,
    marginTop: 0,
  },
  headingContainerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 0,
  },
  backBtn: {
    marginRight: 10,
    marginLeft: 0,
  },
  headingTextWithBack: {
    fontSize: 24,
    fontWeight: "800",
    textTransform: "capitalize",
    backgroundColor: "#32CD32",
    borderRadius: 40,
    width: width * 0.5,
    textAlign: "center",
    marginBottom: 0,
    marginTop: 0,
    paddingVertical: 4,
  },
});

export default NamePage;
