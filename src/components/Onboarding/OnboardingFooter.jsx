import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from "../ui/Text";
const OnboardingFooter = forwardRef(function OnboardingFooter({ onNext, onPrevious, onComplete, currentSlide, totalSlides, isLastSlide, isTransitioning, isCompleting }, ref) {
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(buttonAnim, {
      toValue: 1,
      useNativeDriver: true,
      delay: 600
    }).start();
  }, []);

  const handleNextPress = () => {
    // Prevent button press during transition or completion
    if (isTransitioning || isCompleting) {
      return;
    }

    if (isLastSlide) {
      onComplete();
    } else {
      onNext();
    }
  };

  const handleBackPress = () => {
    // Prevent button press during transition or completion
    if (isTransitioning || isCompleting) {
      return;
    }

    onPrevious();
  };

  // Expose the button press functions to parent component
  useImperativeHandle(ref, () => ({
    pressNextButton: handleNextPress,
    pressBackButton: handleBackPress
  }));

  const renderDots = () => {
    // Dots are removed as per user request
    return null;
  };

  return (
    <Animated.View style={[
      styles.footer,
      isLastSlide && styles.footerLastSlide, // Add special styling for last slide
      {
        opacity: buttonAnim,
        transform: [{
          translateY: buttonAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0]
          })
        }]
      }
    ]}>
      {renderDots()}
      
      <View style={styles.buttonContainer}>
        {currentSlide > 0 && (
          <TouchableOpacity 
            style={[
              styles.backButton,
              (isTransitioning || isCompleting) && styles.disabledButton
            ]} 
            onPress={handleBackPress}
            disabled={isTransitioning || isCompleting}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        {/* Invisible spacer to push next button to the right when no back button */}
        {currentSlide === 0 && <View style={styles.buttonSpacer} />}
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            isLastSlide && styles.getStartedButton,
            (isTransitioning || isCompleting) && styles.disabledButton
          ]} 
          onPress={handleNextPress}
          disabled={isTransitioning || isCompleting}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  footerLastSlide: {
    bottom: 30, // Same spacing as regular footer since no dots
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  buttonSpacer: {
    minWidth: 100, // Same as back button minWidth
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3898b3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3898b3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#3898b3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  getStartedButton: {
    paddingHorizontal: 35,
    paddingVertical: 15,
    minWidth: 140,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

OnboardingFooter.displayName = 'OnboardingFooter';
export default OnboardingFooter;