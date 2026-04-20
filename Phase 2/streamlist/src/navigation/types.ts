import type { NavigatorScreenParams } from '@react-navigation/native';
import type { HomeGenreSelection } from '../hooks/useHome';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

export type SeeAllRail = 'discover' | 'trending' | 'topRated' | 'similar';

export type SeeAllScreenParams =
  | {
      rail: 'discover';
      screenTitle: string;
      discoverGenreKey: HomeGenreSelection;
    }
  | {
      rail: 'trending' | 'topRated';
      screenTitle: string;
    }
  | {
      rail: 'similar';
      screenTitle: string;
      /** When set, loads `/movie/{id}/similar`. */
      similarSourceMovieId?: number;
      /** When set, loads `/tv/{id}/similar`. Provide either this or `similarSourceMovieId`. */
      similarSourceTvId?: number;
    };

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Detail: { movieId: number };
  SeeAll: SeeAllScreenParams;
};
