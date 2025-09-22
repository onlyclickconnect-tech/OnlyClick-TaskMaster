import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function to extract YouTube video ID from URL
const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function VideoPlayer() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showControls, setShowControls] = useState(true);

  const { youtubeUrl } = params;
  const videoId = extractVideoId(youtubeUrl);

  const handleBackPress = () => {
    router.back();
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {/* Full Screen Video Player */}
      <TouchableOpacity 
        style={styles.videoContainer} 
        onPress={toggleControls}
        activeOpacity={1}
      >
        <View style={styles.videoWrapper}>
          <YoutubeIframe
            height={screenHeight * 0.9}
            width={screenWidth}
            videoId={videoId}
            play={true}
            webViewStyle={styles.webView}
            webViewProps={{
              allowsFullscreenVideo: true,
              allowsInlineMediaPlayback: true,
            }}
          />
        </View>
        
        {/* Overlay Controls */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    marginTop: 50,
  },
  webView: {
    backgroundColor: '#000',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});