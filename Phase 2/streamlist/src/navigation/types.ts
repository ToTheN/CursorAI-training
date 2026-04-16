import type { NavigatorScreenParams } from '@react-navigation/native';
import type { HomeGenreSelection } from '../hooks/useHome';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

export type SeeAllRail = 'discover' | 'trending' | 'topRated';

export type SeeAllScreenParams =
  | {
      rail: 'discover';
      screenTitle: string;
      discoverGenreKey: HomeGenreSelection;
    }
  | {
      rail: 'trending' | 'topRated';
      screenTitle: string;
    };

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Detail: { movieId: number };
  SeeAll: SeeAllScreenParams;
};
