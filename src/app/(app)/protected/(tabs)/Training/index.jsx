import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import AppHeader from "../../../../../components/common/AppHeader";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Mock training videos data
const trainingVideos = [
  {
    id: '1',
    title: 'Introduction to TaskMaster',
    description: 'Learn the basics of using TaskMaster platform',
    duration: '5:30',
    category: 'Getting Started',
    thumbnail: 'https://picsum.photos/300/200?random=1',
    videoUrl: 'https://example.com/video1.mp4',
    views: '1.2K',
    rating: 4.8
  },
  {
    id: '2',
    title: 'Customer Service Excellence',
    description: 'Master the art of providing exceptional customer service',
    duration: '8:45',
    category: 'Customer Service',
    thumbnail: 'https://picsum.photos/300/200?random=2',
    videoUrl: 'https://example.com/video2.mp4',
    views: '856',
    rating: 4.9
  },
  {
    id: '3',
    title: 'Safety Protocols & Best Practices',
    description: 'Essential safety guidelines for service providers',
    duration: '12:20',
    category: 'Safety',
    thumbnail: 'https://picsum.photos/300/200?random=3',
    videoUrl: 'https://example.com/video3.mp4',
    views: '2.1K',
    rating: 4.7
  },
  {
    id: '4',
    title: 'Pricing Strategies for Services',
    description: 'How to set competitive and profitable pricing',
    duration: '7:15',
    category: 'Business',
    thumbnail: 'https://picsum.photos/300/200?random=4',
    videoUrl: 'https://example.com/video4.mp4',
    views: '654',
    rating: 4.6
  },
  {
    id: '5',
    title: 'Emergency Response Training',
    description: 'Handle emergency situations professionally',
    duration: '15:30',
    category: 'Safety',
    thumbnail: 'https://picsum.photos/300/200?random=5',
    videoUrl: 'https://example.com/video5.mp4',
    views: '3.2K',
    rating: 4.9
  },
  {
    id: '6',
    title: 'Quality Assurance Checklist',
    description: 'Ensure high-quality service delivery every time',
    duration: '6:45',
    category: 'Quality',
    thumbnail: 'https://picsum.photos/300/200?random=6',
    videoUrl: 'https://example.com/video6.mp4',
    views: '789',
    rating: 4.5
  }
];

const categories = [
  'All',
  'Getting Started',
  'Customer Service',
  'Safety',
  'Business',
  'Quality'
];

export default function Training() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredVideos = selectedCategory === 'All'
    ? trainingVideos
    : trainingVideos.filter(video => video.category === selectedCategory);

  const handleVideoPress = (video) => {
    Alert.alert(
      'Video Playback',
      `Playing: ${video.title}\n\nDuration: ${video.duration}\nViews: ${video.views}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Watch Now', onPress: () => {
          // In a real app, this would navigate to a video player
          console.log('Playing video:', video.title);
        }}
      ]
    );
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.selectedCategoryButtonText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderVideoCard = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <View style={styles.playButtonOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#fff" />
          </View>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.videoMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.views}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.metaText}>{item.rating}</Text>
          </View>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Training" showBack={true} onBack={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(category => renderCategoryButton(category))}
          </ScrollView>
        </View>

        {/* Videos List */}
        <View style={styles.videosSection}>
          <View style={styles.videosHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Videos' : `${selectedCategory} Videos`}
            </Text>
            <Text style={styles.videoCount}>{filteredVideos.length} videos</Text>
          </View>

          <FlatList
            data={filteredVideos}
            renderItem={renderVideoCard}
            keyExtractor={(item) => `video-${item.id}`}
            scrollEnabled={false}
            contentContainerStyle={styles.videosList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="videocam-outline" size={64} color="#DDD" />
                <Text style={styles.emptyTitle}>No videos found</Text>
                <Text style={styles.emptySubtitle}>
                  Try selecting a different category
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: '#3898B3',
    borderColor: '#3898B3',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedCategoryButtonText: {
    color: '#fff',
  },
  videosSection: {
    flex: 1,
    marginTop: 10,
  },
  videosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  videoCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  videosList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  videoThumbnailContainer: {
    position: 'relative',
    height: 180,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 152, 179, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 22,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 11,
    color: '#3898B3',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
