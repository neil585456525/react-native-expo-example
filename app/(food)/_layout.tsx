import { Stack } from 'expo-router';

export default function FoodLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="food-form" 
        options={{
          presentation: 'modal',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}