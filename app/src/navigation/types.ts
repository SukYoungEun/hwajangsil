import { Toilet } from '../types';

export type RootStackParamList = {
  Tabs: undefined;
  Detail: { toilet: Toilet };
  Emergency: undefined;
  Alt: undefined;
  Review: { toilet: Toilet };
  Visits: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  My: undefined;
};
