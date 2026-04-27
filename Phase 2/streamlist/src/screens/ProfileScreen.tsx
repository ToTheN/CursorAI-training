import React, { useCallback, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  APP_DISPLAY_NAME,
  APP_VERSION,
  TMDB_ATTRIBUTION,
  TMDB_WEB_URL,
} from '../constants/appInfo';
import { GlobalAppBar } from '../components/common/GlobalAppBar';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import { useWatchlistStore } from '../store/watchlistStore';
import { buildWatchlistSummaryLabel } from '../utils/buildWatchlistSummaryLabel';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const EXTERNAL_LINK_ICON_SIZE: number = spacing.lg;
const BOOKMARK_ICON_SIZE: number = spacing.lg;
const WATCHLIST_ICON_SQUARE: number = spacing.lg * 2;

function ProfileHeader(): React.ReactElement {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.collectionLabel}>Account</Text>
      <Text style={styles.screenTitle} accessibilityRole="header">
        Profile
      </Text>
      <Text style={styles.subhead}>Your list and app info in one place.</Text>
    </View>
  );
}

interface WatchlistCardProps {
  itemCount: number;
}

function WatchlistCard(props: WatchlistCardProps): React.ReactElement {
  const { itemCount } = props;
  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.cardRow}>
        <View style={styles.cardIconWrap}>
          <MaterialIcons
            name="bookmark"
            size={BOOKMARK_ICON_SIZE}
            color={colors.primary_container}
          />
        </View>
        <View style={styles.cardTextCol}>
          <Text style={styles.cardTitle}>My watchlist</Text>
          <Text style={styles.cardBody}>{buildWatchlistSummaryLabel(itemCount)}</Text>
        </View>
      </View>
    </View>
  );
}

function AboutAppCard(): React.ReactElement {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>About this app</Text>
      <Text style={styles.cardBody}>
        {APP_DISPLAY_NAME} · v{APP_VERSION}
      </Text>
    </View>
  );
}

interface TmdbAttributionBlockProps {
  linkError: string | null;
  onOpenTmdb: () => void;
}

function TmdbAttributionBlock(props: TmdbAttributionBlockProps): React.ReactElement {
  const { linkError, onOpenTmdb } = props;
  return (
    <View style={styles.card} accessibilityLabel="The Movie Database attribution">
      <Text style={styles.attribution}>{TMDB_ATTRIBUTION}</Text>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Open themoviedb.org in the browser"
        onPress={onOpenTmdb}
        style={({ pressed }) => [styles.linkRow, pressed && styles.pressedRow]}
      >
        <Ionicons
          name="open-outline"
          size={EXTERNAL_LINK_ICON_SIZE}
          color={colors.on_surface}
        />
        <Text style={styles.linkText}>themoviedb.org</Text>
        <Ionicons
          name="chevron-forward"
          size={EXTERNAL_LINK_ICON_SIZE}
          color={colors.on_surface_variant}
        />
      </Pressable>
      {linkError !== null ? (
        <Text style={styles.linkError} accessibilityLiveRegion="polite">
          {linkError}
        </Text>
      ) : null}
    </View>
  );
}

function ProfileBody(): React.ReactElement {
  const itemCount: number = useWatchlistStore((s) => s.entries.length);
  const [linkError, setLinkError] = useState<string | null>(null);
  const onOpenTmdb = useCallback(async (): Promise<void> => {
    setLinkError(null);
    const url: string = TMDB_WEB_URL;
    try {
      const can: boolean = await Linking.canOpenURL(url);
      if (!can) {
        setLinkError('This link could not be opened on this device.');
        return;
      }
      const opened: boolean = await Linking.openURL(url);
      if (!opened) {
        setLinkError('Could not open the website. Try again later.');
      }
    } catch {
      setLinkError('Could not open the website. Try again later.');
    }
  }, []);
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader />
      <WatchlistCard itemCount={itemCount} />
      <AboutAppCard />
      <TmdbAttributionBlock linkError={linkError} onOpenTmdb={onOpenTmdb} />
    </ScrollView>
  );
}

export function ProfileScreen(): React.ReactElement {
  const refetch = useCallback((): void => {}, []);
  return (
    <View style={styles.screenWrap}>
      <GlobalAppBar />
      <SafeAreaView style={styles.root} edges={['left', 'right']}>
        <ScreenErrorBoundary onRetry={refetch}>
          <ProfileBody />
        </ScreenErrorBoundary>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  titleBlock: {
    gap: spacing.xxs,
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },
  collectionLabel: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
    textTransform: 'uppercase',
  },
  screenTitle: {
    ...typography.textStyle.displayMd,
    color: colors.on_surface,
  },
  subhead: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
    marginTop: spacing.xxs,
  },
  card: {
    backgroundColor: colors.surface_container_high,
    borderRadius: spacing.md,
    padding: spacing.lg,
    alignSelf: 'stretch',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIconWrap: {
    width: WATCHLIST_ICON_SQUARE,
    height: WATCHLIST_ICON_SQUARE,
    borderRadius: spacing.md,
    backgroundColor: colors.surface_container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextCol: {
    flex: 1,
    gap: spacing.xxs,
  },
  cardTitle: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface,
  },
  cardBody: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
  },
  attribution: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
  },
  pressedRow: {
    backgroundColor: colors.surface_bright,
  },
  linkText: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface,
    flex: 1,
  },
  linkError: {
    ...typography.textStyle.labelSm,
    color: colors.primary_container,
    marginTop: spacing.sm,
  },
});
