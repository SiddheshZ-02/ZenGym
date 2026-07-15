import { createThemedStyles } from "@/constants/responsive";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Plan {
  id: string;
  name: string;
  price: string;
  priceUnit?: string;
  features: string[];
  isFeatured?: boolean;
}

const useStyles = createThemedStyles((_, responsive) => {
  const {
    spacing,
    radius,
    fontSizes,
    hp,
    wp,
    isSmallPhone,
    containerMaxWidth,
  } = responsive;

  return {
    safeArea: {
      flex: 1,
      backgroundColor: "#32CD32",
    },
    screen: {
      flex: 1,
      backgroundColor: "#000",
    },
    headingContainerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xs,
    },
    backBtn: {
      position: "absolute",
      left: spacing.md,
      padding: spacing.xs,
      zIndex: 1,
    },
    headingTextWithBack: {
      fontSize: isSmallPhone ? fontSizes.lg : fontSizes.xl,
      fontWeight: "800",
      textTransform: "capitalize",
      backgroundColor: "#32CD32",
      width: "100%",
      textAlign: "center",
      paddingVertical: spacing.sm,
      color: "#000",
    },
    contentShell: {
      flex: 1,
      width: "100%",
      alignSelf: "center",
      maxWidth: containerMaxWidth,
      paddingHorizontal: spacing.md,
    },
    titleSection: {
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    mainTitle: {
      fontSize: fontSizes.xxl,
      fontWeight: "800",
      color: "#fff",
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: fontSizes.md,
      color: "#aaa",
      textAlign: "center",
      lineHeight: fontSizes.lg,
    },
    planCard: {
      backgroundColor: "#1a1a1a",
      borderRadius: radius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: "transparent",
    },
    featuredPlanCard: {
      borderColor: "#32CD32",
      backgroundColor: "#1a3a1a",
    },
    featuredBadge: {
      position: "absolute",
      top: -12,
      alignSelf: "center",
      backgroundColor: "#32CD32",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
    },
    featuredBadgeText: {
      color: "#000",
      fontWeight: "700",
      fontSize: fontSizes.sm,
    },
    planHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    planName: {
      fontSize: fontSizes.xl,
      fontWeight: "800",
      color: "#fff",
    },
    planPriceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: spacing.lg,
    },
    planPrice: {
      fontSize: fontSizes.hero,
      fontWeight: "800",
      color: "#32CD32",
    },
    planPriceUnit: {
      fontSize: fontSizes.md,
      color: "#888",
      marginLeft: spacing.xs,
    },
    featuresList: {
      gap: spacing.sm,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    featureText: {
      fontSize: fontSizes.md,
      color: "#ddd",
      flex: 1,
    },
    ctaButton: {
      marginTop: spacing.lg,
      backgroundColor: "#32CD32",
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      alignItems: "center",
    },
    ctaButtonText: {
      color: "#000",
      fontSize: fontSizes.lg,
      fontWeight: "700",
    },
  };
});

const PlansScreen = () => {
  const styles = useStyles();
  const router = useRouter();

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "basic",
        name: "Basic (Free)",
        price: "$0",
        features: [
          "Beginner workout library",
          "exercise animations",
          "Unlock the selected Standard/Premium Exercise for 1 hour by watching an ad",
        ],
      },
      {
        id: "standard",
        name: "Standard",
        price: "$4.99",
        priceUnit: "/month",
        features: [
          "All Beginner/Intermediate Workout",
          "exercise animations",
          "Unlock the selected Premium Exercise for 1 hour by watching an ad",
        ],
        isFeatured: true,
      },
      {
        id: "premium",
        name: "Premium",
        price: "$9.99",
        priceUnit: "/month",
        features: [
          "All features Unlock ",
          "All Workout Unlock",
          "exercise animations",
          "Priority support",
          "Ad-free experience",
        ],
      },
    ],
    [],
  );

  const handlePlanSelect = useCallback((planId: string) => {
    console.log("Plan selected:", planId);
  }, []);

  const renderPlan = useCallback(
    ({ item }: { item: Plan }) => (
      <View
        style={[styles.planCard, item.isFeatured && styles.featuredPlanCard]}
      >
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Most Popular</Text>
          </View>
        )}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{item.name}</Text>
          {item.isFeatured && (
            <FontAwesome5 name="crown" size={24} color="#EFBF04" />
          )}
        </View>
        <View style={styles.planPriceContainer}>
          <Text style={styles.planPrice}>{item.price}</Text>
          {item.priceUnit && (
            <Text style={styles.planPriceUnit}>{item.priceUnit}</Text>
          )}
        </View>
        <View style={styles.featuresList}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Feather name="check-circle" size={20} color="#32CD32" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => handlePlanSelect(item.id)}
        >
          <Text style={styles.ctaButtonText}>
            {item.id === "basic" ? "Get Started" : "Choose Plan"}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [styles, handlePlanSelect],
  );

  const ListContent = useMemo(
    () => (
      <>
        <View style={styles.headingContainerRow}>
          <Text style={styles.headingTextWithBack}>Subscription Plans</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather name="chevron-left" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.contentShell}>
          <View style={styles.titleSection}>
            <Text style={styles.subtitle}>
              Subscribe to Premium for exclusive features and an ad-free
              experience!
            </Text>
          </View>
          <FlatList
            data={plans}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={renderPlan}
          />
        </View>
      </>
    ),
    [styles, router, plans, renderPlan],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>{ListContent}</View>
    </SafeAreaView>
  );
};

export default PlansScreen;
