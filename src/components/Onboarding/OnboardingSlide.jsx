import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

const OnboardingSlide = ({ title, description, image }) => {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(descAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: imageAnim,
            transform: [
              {
                translateY: imageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Image 
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      <LinearGradient
        colors={['#3898B3', '#FFFFFF']}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 0.95 }}
        style={styles.modal}
      >
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {title}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.description,
            {
              opacity: descAnim,
              transform: [
                {
                  translateY: descAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {description}
        </Animated.Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modal: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingBottom: 90,
    height: '55%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 31,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'left',
    marginBottom: 24,
    lineHeight: 30,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    color: '#444',
    textAlign: 'left',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
});

export default OnboardingSlide;