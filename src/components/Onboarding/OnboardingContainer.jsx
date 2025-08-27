import { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import OnboardingFooter from './OnboardingFooter';
import OnboardingHeader from './OnboardingHeader';
import OnboardingSlide from './OnboardingSlide';

const { width, height } = Dimensions.get('window');

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
  }
];

const OnboardingContainer = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const footerRef = useRef(null);

  // Defensive: make sure currentSlide points to a valid slide
  const current = slides[currentSlide] ?? null;
  if (!current) {
    // This helps debug why an out-of-range index occurred at runtime
    console.warn(`OnboardingContainer: slide index ${currentSlide} is out of range (0..${slides.length - 1})`);
  }

  // Unified completion function
  const handleComplete = () => {
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
      })
    ]).start(() => {
      onComplete();
    });
  };

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      handleComplete();
      return;
    }

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
      })
    ]).start(() => {
      setCurrentSlide(prev => prev + 1);
      
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
        })
      ]).start();
    });
  };

  const handlePrevious = () => {
    if (currentSlide === 0) return;

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
      })
    ]).start(() => {
      setCurrentSlide(prev => prev - 1);
      
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
        })
      ]).start();
    });
  };

  // Create PanResponder for swipe gestures - recreate when currentSlide changes
  const panResponder = useMemo(() => 
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Disable swiping completely on the last slide
        if (currentSlide === slides.length - 1) {
          return false;
        }
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Optional: Add visual feedback during swipe
      },
      onPanResponderRelease: (evt, gestureState) => {
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
    }), [currentSlide, handleNext, handlePrevious]);

  return (
    <View style={styles.container}>
      <OnboardingHeader />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        {current ? (
          <OnboardingSlide 
            title={current.title}
            description={current.description}
            image={current.image}
          />
        ) : null}
      </Animated.View>
      
      <OnboardingFooter 
        ref={footerRef}
        onNext={handleNext}
        onComplete={handleComplete}
        currentSlide={currentSlide}
        totalSlides={slides.length}
        isLastSlide={currentSlide === slides.length - 1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: width * 0.01, // 1% of screen width for padding
    paddingVertical: height * 0.01, // 1% of screen height for padding
  },
});

export default OnboardingContainer;