import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="categories"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#f8f8f8',
          },
          default: {
            backgroundColor: '#f8f8f8',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: '分類',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: '計劃',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: '工具',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="hammer" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '個人設定',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
