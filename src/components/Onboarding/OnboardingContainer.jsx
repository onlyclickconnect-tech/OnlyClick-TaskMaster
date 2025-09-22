import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import supabase from "../../data/supabaseClient.js";
import LoadingScreen from "../common/LoadingScreen.jsx";
import OnboardingFooter from "./OnboardingFooter";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingSlide from "./OnboardingSlide";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    title: "Your skills deserve recognition.",
    description: "You’re not just a worker — you’re a Task Master.\nJoin a platform that values your experience and professionalism.\nEarn respect, not just income.",
    image: require('../../../assets/images/onboard1.png')
  },
  {
    title: "Earn fair. Get paid on time.",
    description: "Set transparent prices for your services.\nTrack your earnings and receive payments securely, with no hidden cuts.\nYour work, your worth — always honored.",
    image: require('../../../assets/images/onboard2.png')
  },
  {
    title: "We’ve got your back. Always.",
    description: "From verified bookings to real-time support, you’re never alone on the job.\nTask Master ensures trust, safety, and steady opportunities —\nso you can work with peace of mind.",
    image: require('../../../assets/images/onboard3.png')
  },
];

const OnboardingContainer = ({ onComplete }) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const footerRef = useRef(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkNewUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return;
      }
      if (!user) {
        return;
      }


      // 2️⃣ Query the profile in onlyclick.users
      const { data, error } = await supabase
        .schema("onlyclick")
        .from("users")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      if (error) {
        return;
      }

      if (data.full_name) {
        router.replace("/(app)/protected/(tabs)/Home");
      } else {
        return;
      }
    };

    checkNewUser();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      // await supabase.auth.signOut()   // to signout everytime when login uncomment this
      try {
        // Get stored session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          //No session stored
          return;
        }

        // Verify with Supabase using access token
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          // // if Session invalid/expired
          await supabase.auth.signOut();
          return;
        } else {

          const { data, error } = await supabase
            .schema("onlyclick")
            .from("users")
            .select("full_name")
            .eq("user_id", user.id)
            .single();

          if (error) {
            return;
          }

          if (data.full_name) {
            router.replace("/(app)/protected/(tabs)/Home");
          } else {
            router.replace("/(app)/auth/profile-setup")
          }

        }
      } catch (err) {
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Unified completion function
  const handleComplete = () => {
    // Prevent multiple completion calls
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Add a small delay before navigation to ensure smooth transition
      setTimeout(() => {
        router.push("/(app)/auth/sign-in"); // Navigate directly to sign-in page
      }, 100);
    });
  };

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      handleComplete();
      return;
    }

    // Prevent multiple transitions
    if (isTransitioning) {
      return;
    }

    // Additional safety check
    if (currentSlide < 0 || currentSlide >= slides.length) {
      return;
    }

    setIsTransitioning(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentSlide((prev) => prev + 1);

      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Small delay to ensure slide is fully rendered
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      });
    });
  };

  const handlePrevious = () => {
    if (currentSlide === 0) return;

    // Prevent multiple transitions
    if (isTransitioning) {
      return;
    }

    // Additional safety check
    if (currentSlide < 0 || currentSlide >= slides.length) {
      return;
    }

    setIsTransitioning(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentSlide((prev) => prev - 1);

      fadeAnim.setValue(0);
      slideAnim.setValue(-50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Small delay to ensure slide is fully rendered
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      });
    });
  };

  // Create PanResponder for swipe gestures - recreate when currentSlide changes
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Disable swiping completely on the last slide or during transition
          if (currentSlide === slides.length - 1 || isTransitioning) {
            return false;
          }
          return (
            Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100
          );
        },
        onPanResponderMove: (evt, gestureState) => {
          // Optional: Add visual feedback during swipe
        },
        onPanResponderRelease: (evt, gestureState) => {
          // Don't respond to gestures during transition
          if (isTransitioning) {
            return;
          }

          const { dx } = gestureState;

          // Swipe left (next slide)
          if (dx < -50) {
            handleNext();
          }
          // Swipe right (previous slide)
          else if (dx > 50) {
            handlePrevious();
          }
        },
      }),
    [currentSlide, handleNext, handlePrevious, isTransitioning]
  );

  if (loading) return <LoadingScreen />;
  return (
    <View style={styles.container}>
      <OnboardingHeader />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <OnboardingSlide
          key={`slide-${currentSlide}`}
          title={slides[currentSlide]?.title || ""}
          description={slides[currentSlide]?.description || ""}
          image={slides[currentSlide]?.image}
        />
      </Animated.View>

      <OnboardingFooter
        ref={footerRef}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleComplete}
        currentSlide={currentSlide}
        totalSlides={slides.length}
        isLastSlide={currentSlide === slides.length - 1}
        isTransitioning={isTransitioning}
        isCompleting={isCompleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: width * 0.01, // 1% of screen width for padding
    paddingVertical: height * 0.01, // 1% of screen height for padding
  },
});

export default OnboardingContainer;
