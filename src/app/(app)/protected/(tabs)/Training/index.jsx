import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import Text from '../../../../../components/ui/Text';
import AppHeader from '../../../../../components/common/AppHeader';
import { getTrainingVideos } from '../../../../api/trainingVideos';


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Helper function to extract YouTube video ID from URL
const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function Training() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [trainingVideos, setTrainingVideos] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainingVideos = async () => {
      try {
        setLoading(true);
        const data = await getTrainingVideos("Plumbing");

        // Transform Supabase data to component format
        const transformedVideos = data.map(video => ({
          id: video.id.toString(),
          title: video.Title,
          category: video.category.trim(), // Remove any trailing whitespace
          youtubeUrl: video.youtube_url,
        }));

        setTrainingVideos(transformedVideos);

        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(transformedVideos.map(video => video.category))];
        setCategories(uniqueCategories);

      } catch (err) {
        console.error('Error fetching training videos:', err);
        setError('Failed to load training videos');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingVideos();
  }, []);

  const filteredVideos = selectedCategory === 'All'
    ? trainingVideos
    : trainingVideos.filter(video => video.category === selectedCategory);

  const handleVideoPress = (video) => {
    router.push({
      pathname: "/(app)/protected/(tabs)/Training/video-player",
      params: {
        youtubeUrl: video.youtubeUrl,
        title: video.title,
        category: video.category,
      }
    });
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
          source={{ uri: `https://img.youtube.com/vi/${extractVideoId(item.youtubeUrl)}/maxresdefault.jpg` }}
          style={styles.videoThumbnail}
          resizeMode="cover"
          onError={(e) => {
            // Fallback to default thumbnail if maxresdefault fails
            e.target.source = { uri: `https://img.youtube.com/vi/${extractVideoId(item.youtubeUrl)}/hqdefault.jpg` };
          }}
        />
        <View style={styles.playButtonOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="logo-youtube" size={24} color="#fff" />
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
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Training" showBack={true} onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3898B3" />
          <Text style={styles.loadingText}>Loading training videos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader title="Training" showBack={true} onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Error Loading Videos</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Re-fetch videos
              const fetchVideos = async () => {
                try {
                  const data = await getTrainingVideos();
                  const transformedVideos = data.map(video => ({
                    id: video.id.toString(),
                    title: video.Title,
                    category: video.category.trim(),
                    youtubeUrl: video.youtube_url,
                  }));
                  setTrainingVideos(transformedVideos);
                  const uniqueCategories = ['All', ...new Set(transformedVideos.map(video => video.category))];
                  setCategories(uniqueCategories);
                } catch (err) {
                  setError('Failed to load training videos');
                } finally {
                  setLoading(false);
                }
              };
              fetchVideos();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // return (
  //   <View style={styles.container}>
  //     <AppHeader title="Training" showBack={true} onBack={() => router.back()} />

  //     <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
  //       {/* Categories */}
        

  //       {/* Videos List */}
  //       <View style={styles.videosSection}>
          

  //         <FlatList
  //           data={filteredVideos}
  //           renderItem={renderVideoCard}
  //           keyExtractor={(item) => `video-${item.id}`}
  //           scrollEnabled={false}
  //           contentContainerStyle={styles.videosList}
  //           ListEmptyComponent={
  //             <View style={styles.emptyContainer}>
  //               <Ionicons name="videocam-outline" size={64} color="#DDD" />
  //               <Text style={styles.emptyTitle}>No videos found</Text>
  //               <Text style={styles.emptySubtitle}>
  //                 Try selecting a different category
  //               </Text>
  //             </View>
  //           }
  //         />
  //       </View>
  //     </ScrollView>
  //   </View>
  // );

  return(
    <View style={styles.container}>
      <AppHeader title="Training" showBack={true} onBack={() => router.back()} />
      <Image
        source={require('../../../../../../assets/images/comingSoon.png')}
        style={styles.comingSoonImage}
        resizeMode="contain"
      />
    </View> 
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 8,
  },
    comingSoonImage: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.5,
    alignSelf: 'center',
    marginTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3898B3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom:15,
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
    marginTop: 20,
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
    justifyContent: 'flex-start',
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
