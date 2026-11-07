export type TabId = 'home' | 'friends' | 'shared' | 'notifications' | 'profile';

export interface TabItemConfig {
  id: TabId;
  label: string;
  renderIcon: (color: string) => React.ReactNode;
}
