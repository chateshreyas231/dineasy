import { useAppStore } from '../store/useAppStore';

export const seedMockData = () => {
  const store = useAppStore.getState();

  // Seed some initial watches
  if (store.watches.length === 0) {
    store.addWatch({
      id: 'watch-1',
      geoLabel: 'Near me',
      radius: 2,
      timeRange: 'next 2 hours',
      vibeTags: ['quiet', 'romantic'],
      notificationsEnabled: true,
    });
  }

  // Seed some backup plans
  if (store.backupPlans.length === 0) {
    store.setBackupPlans([
      {
        restaurantId: '2',
        restaurantName: 'Jazz & Jive',
        time: '8:00 PM',
        partySize: 2,
      },
      {
        restaurantId: '4',
        restaurantName: 'The Quiet Corner',
        time: '7:30 PM',
        partySize: 2,
      },
    ]);
  }
};

