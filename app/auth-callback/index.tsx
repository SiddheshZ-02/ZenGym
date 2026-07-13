import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { initialized } = useAuthStore();

  useEffect(() => {
    if (initialized) {
      router.replace('/TabNavigation/HomeScreen');
    }
  }, [initialized, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
      <ActivityIndicator size="large" color="#32CD32" />
    </View>
  );
}