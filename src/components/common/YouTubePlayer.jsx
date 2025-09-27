import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Text from '../ui/Text';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function YouTubePlayer({
  videoId,
  title,
  isVisible,
  onClose,
  onReady,
  onError
}) {
  const [playing, setPlaying] = useState(false);

  const handleClose = () => {
    setPlaying(false);
    onClose();
  };

  const onStateChange = (state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Video Player */}
        <View style={styles.playerContainer}>
          <YoutubePlayer
            height={screenHeight * 0.4}
            width={screenWidth}
            videoId={videoId}
            play={playing}
            onChangeState={onStateChange}
            onReady={onReady}
            onError={onError}
            webViewStyle={styles.webView}
            webViewProps={{
              allowsFullscreenVideo: true,
              allowsInlineMediaPlayback: true,
            }}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Training Video</Text>
          <Text style={styles.infoText}>
            Watch this video to learn important skills for your work.
            Make sure you're in a quiet environment and take notes if needed.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  webView: {
    backgroundColor: '#000',
  },
  infoSection: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  infoTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
});