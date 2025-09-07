import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BodyPart } from "@/utils/ExerciseData";
import { LegendList } from "@legendapp/list";

import { ExerciseArray } from "@/utils/ExerciseData";
import AntDesign from "@expo/vector-icons/AntDesign";
import Index from "@/app";

const { height, width } = Dimensions.get("window");

interface exerciseDetailsType {
  id: number;
  name: string;
  gifUrl: any;
  category: string;
  difficulty: string;
  equipment: string;
  description: string;
  target: string;
  instructions: string[];
  bodyPart: string;
  secondaryMuscles?: any;
}

const NamePage = () => {
  const [parts, setparts] = useState<exerciseDetailsType[] | null>(null);
  const [filteredParts, setFilteredParts] = useState<
    exerciseDetailsType[] | null
  >(null);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<"name" | "bodyPart" | "target">(
    "name"
  );
  const [storeImage, setStoreImage] = useState();
  const [loading, setLoading] = useState<Boolean>(false);

  const router = useRouter();
  const { name } = useLocalSearchParams();

  const filterArray = () => {
    if (name) {
      const dataStore = BodyPart.find((item) => {
        return item.name == name;
      })?.image;
      setStoreImage(dataStore);
    }
  };
  const filterFunc = () => {
    const filterExercises = ExerciseArray.filter((item) => {
      return item.bodyPart === name;
    });
    setparts(filterExercises);
    setFilteredParts(filterExercises);
  };

  useEffect(() => {
    filterFunc();
    filterArray();
  }, [name]);

  useEffect(() => {
    if (!parts) return;
    if (searchText.trim() === "") {
      setFilteredParts(parts);
      return;
    }
    const filtered = parts.filter((item) => {
      const search = searchText.toLowerCase();
      return (
        item.name.toLowerCase().includes(search) ||
        item.bodyPart.toLowerCase().includes(search) ||
        item.target.toLowerCase().includes(search)
      );
    });
    setFilteredParts(filtered);
  }, [searchText, parts]);

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
            name="search1"
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
          <AntDesign name="leftcircle" size={36} color="#32CD32" />
        </TouchableOpacity>
        <Text style={styles.headingTextWithBack}>{name}</Text>
      </View>
      {/* List below search bar and heading, always scrollable */}
      <View style={{ flex: 1, left: 6 }}>
        <LegendList
          data={filteredParts || []}
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
                  source={{ uri: item?.gifUrl }}
                  style={{ height: 190, width: 190, borderRadius: 30 }}
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
