import { StyleSheet, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';

// 定義食物資料介面
interface FoodData {
  id: string;
  foodName: string;
  calories: string;
  weight: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  imageUri?: string;
  category: string;
}

// 讀取食物資料的函數
const loadFoods = async (): Promise<FoodData[]> => {
  const DATA_DIRECTORY = FileSystem.documentDirectory + 'foods/';
  const FOODS_FILE_PATH = DATA_DIRECTORY + 'foods.json';

  try {
    const fileInfo = await FileSystem.getInfoAsync(FOODS_FILE_PATH);
    if (!fileInfo.exists) {
      return [];
    }
    const content = await FileSystem.readAsStringAsync(FOODS_FILE_PATH);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading foods:', error);
    return [];
  }
};

// 添加分類顏色函數
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    '主食': '#FF9800',
    '肉蛋魚': '#F44336',
    '果蔬': '#4CAF50',
    '奶製品': '#2196F3',
    '豆製品': '#9C27B0',
    '飲料': '#00BCD4',
    '堅果': '#795548',
    '零食點心': '#FF4081'
  };
  return colors[category] || '#757575';
};

export default function CategoryScreen() {
  const [foods, setFoods] = useState<FoodData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 使用 useFocusEffect 替代 useEffect
  useFocusEffect(
    useCallback(() => {
      const fetchFoods = async () => {
        const loadedFoods = await loadFoods();
        setFoods(loadedFoods);
      };
      fetchFoods();
    }, [])
  );

  // 過濾食物
  const filteredFoods = foods.filter(food => 
    food.foodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 在 CategoryScreen 組件中添加刪除函數
  const deleteFood = async (id: string) => {
    try {
      const currentFoods = await loadFoods();
      const updatedFoods = currentFoods.filter(food => food.id !== id);
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + 'foods/foods.json',
        JSON.stringify(updatedFoods)
      );
      setFoods(updatedFoods);
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title" style={styles.header}>健康飲食助理</ThemedText>
        <Link href="/(food)/food-form" asChild>
          <Pressable>
            <Ionicons name="add-circle-outline" size={24} color="#000" />
          </Pressable>
        </Link>
      </ThemedView>
      
      {/* 搜尋框 */}
      <ThemedView style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput 
          placeholder="搜尋相關食物"
          style={styles.searchInput}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>

      {/* 食物列表 */}
      <ScrollView contentContainerStyle={styles.grid}>
        {filteredFoods.map(food => (
          <Link 
            key={food.id} 
            href={{
              pathname: "/(food)/food-form",
              params: { initialData: JSON.stringify(food) }
            }} 
            asChild
          >
            <Pressable style={styles.foodItem}>
              {/* 分類標籤 */}
              <ThemedView style={[
                styles.categoryBadge, 
                { backgroundColor: getCategoryColor(food.category) }
              ]}>
                <ThemedText style={styles.categoryText}>{food.category}</ThemedText>
              </ThemedView>

              {food.imageUri ? (
                <Image 
                  source={{ uri: food.imageUri }} 
                  style={styles.foodImage} 
                />
              ) : (
                <ThemedView style={styles.noImage}>
                  <Ionicons name="restaurant-outline" size={40} color="#ccc" />
                </ThemedView>
              )}
              <ThemedText style={styles.foodName}>{food.foodName}</ThemedText>
              <ThemedText style={styles.foodDetails}>
                {`${food.calories}卡路里 / ${food.weight}g`}
              </ThemedText>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    marginTop: 24,
    fontSize: 24,
  },
  searchBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  foodItem: {
    width: '47%',
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  foodImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  noImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  foodDetails: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '500',
  },
  actionButtons: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    zIndex: 1,
  },
  iconButton: {
    padding: 6,
    marginLeft: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
