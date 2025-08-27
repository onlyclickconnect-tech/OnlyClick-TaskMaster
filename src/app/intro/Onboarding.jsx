import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppStates } from "../../context/AppStates";
const Onboarding = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const totalPages = 3;
  const { setIsAppOpenedFirstTime } = useAppStates();

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = () => {
    router.replace("/protected/");
    setIsAppOpenedFirstTime(true);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <View style={styles.pageContent}>
            <Text style={styles.title}>Welcome to Our App</Text>
            <Text style={styles.description}>
              Discover amazing features that will make your life easier.
            </Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.pageContent}>
            <Text style={styles.title}>Easy to Use</Text>
            <Text style={styles.description}>
              Simple and intuitive interface designed for everyone.
            </Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.pageContent}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.description}>
              Join thousands of happy users today.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderPageContent()}

      <View style={styles.pagination}>
        {[...Array(totalPages)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentPage === i + 1 ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentPage === totalPages ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  pageContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 40,
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#3898b3",
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  skipButton: {
    color: "#666",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#3898b3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Onboarding;
