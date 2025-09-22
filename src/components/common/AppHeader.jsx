import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
    Platform,
    StatusBar as RNStatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AppHeader({
  title = '',
  showBack = false,
  onBack = () => {},
  variant = 'solid', // 'solid' | 'transparent'
  accentColor = '#3898B3',
  backgroundColor,
  textColor = '#ffffff',
  profileImage,
  hideStatusBar = true,
}) {
  const headerBg = backgroundColor || (variant === 'transparent' ? 'transparent' : accentColor);
  const topInset = hideStatusBar ? 8 : (Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 44);

  return (
    <View style={[styles.header, { backgroundColor: headerBg, paddingTop: topInset + 4 }]}>
      <StatusBar hidden={hideStatusBar} style={variant === 'transparent' ? 'dark' : 'light'} />

      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          {showBack ? (
            <TouchableOpacity
              accessibilityLabel="Go back"
              accessibilityRole="button"
              style={styles.iconButton}
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={22} color={textColor} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}

          <View style={[styles.titleWrap, { marginRight: 16 }] }>
            <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>

          <View style={styles.placeholder} />
        </View>
      </View>
    </View>
  );
}

function lighten(hex, amount = 0.7) {
  // simple hex to rgba lightening helper for text contrast
  try {
    if (!hex) return '#fff';
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    const r = Math.min(255, Math.floor(((num >> 16) & 255) * amount + 255 * (1 - amount)));
    const g = Math.min(255, Math.floor(((num >> 8) & 255) * amount + 255 * (1 - amount)));
    const b = Math.min(255, Math.floor((num & 255) * amount + 255 * (1 - amount)));
    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    return '#fff';
  }
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 0,
    paddingBottom: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerTop: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  placeholder: {
    width: 36,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginRight: 80, // leave space for right actions so title doesn't overlap
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.95,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'android' ? 18 : 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    backgroundColor: '#ff4d4f',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  profileButton: {
    marginLeft: 8,
  },
  profileImage: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  profilePlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 10,
    opacity: 0.85,
  },
  ratingWrap: {
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
