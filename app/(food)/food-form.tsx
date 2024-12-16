import { StyleSheet, TextInput, Pressable, ScrollView, Image, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';

interface FoodData {
  id?: string;
  foodName: string;
  category: typeof FOOD_CATEGORIES[number];
  calories: string;
  weight: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  imageUri?: string;
}

interface FoodFormProps {
  initialData?: FoodData;
}

// 定義資料儲存路徑
const DATA_DIRECTORY = FileSystem.documentDirectory + 'foods/';
const FOODS_FILE_PATH = DATA_DIRECTORY + 'foods.json';

// 確保目錄存在
const ensureDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(DATA_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DATA_DIRECTORY, { intermediates: true });
  }
};

// 讀取食物資料
const loadFoods = async (): Promise<FoodData[]> => {
  try {
    await ensureDirectoryExists();
    const fileInfo = await FileSystem.getInfoAsync(FOODS_FILE_PATH);
    
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(FOODS_FILE_PATH, JSON.stringify([]));
      return [];
    }

    const content = await FileSystem.readAsStringAsync(FOODS_FILE_PATH);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading foods:', error);
    return [];
  }
};

// 儲存食物資料
const saveFoods = async (foods: FoodData[]) => {
  try {
    await ensureDirectoryExists();
    await FileSystem.writeAsStringAsync(
      FOODS_FILE_PATH,
      JSON.stringify(foods, null, 2)
    );
  } catch (error) {
    console.error('Error saving foods:', error);
    throw error;
  }
};

// 在組件頂部定義分類選項
const FOOD_CATEGORIES = [
  '主食',
  '肉蛋魚',
  '果蔬',
  '奶製品',
  '豆製品',
  '飲料',
  '堅果',
  '零食點心'
] as const;

export default function FoodForm() {
  const params = useLocalSearchParams();
  const initialData = params.initialData ? JSON.parse(params.initialData as string) : undefined;

  // 移除這些 state 初始化中的 initialData
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [weight, setWeight] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<typeof FOOD_CATEGORIES[number]>('主食');

  // 修改 useEffect，添加空依賴數組，只在組件掛載時執行一次
  useEffect(() => {
    if (initialData) {
      console.log('Setting form data with:', initialData);
      setFoodName(initialData.foodName || '');
      setCalories(initialData.calories || '');
      setWeight(initialData.weight || '');
      setProtein(initialData.protein || '');
      setCarbs(initialData.carbs || '');
      setFat(initialData.fat || '');
      setFiber(initialData.fiber || '');
      setImageUri(initialData.imageUri || '');
      setCategory(initialData.category || '主食');
    }
  }, []); // 空依賴數組，確保只執行一次

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!foodName.trim()) {
      alert('請輸入食物名稱');
      return false;
    }
    if (!weight || isNaN(Number(weight))) {
      alert('請輸入有效的重量');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('Submitting with ID:', initialData?.id);

      const newFood: FoodData = {
        id: initialData?.id || Date.now().toString(),
        foodName: foodName.trim(),
        category,
        calories: calories || '0',
        weight: weight || '0',
        protein: protein || '0',
        carbs: carbs || '0',
        fat: fat || '0',
        fiber: fiber || '0',
        imageUri,
      };

      // 如果有圖片，將圖片複製到應用程式目錄
      if (imageUri) {
        const fileName = `${newFood.id}_${Date.now()}.jpg`;
        const newImagePath = DATA_DIRECTORY + fileName;
        await FileSystem.copyAsync({
          from: imageUri,
          to: newImagePath
        });
        newFood.imageUri = newImagePath;
      }

      // 讀取現有資料
      const foods = await loadFoods();

      if (initialData?.id) {
        // 更新現有食物
        const index = foods.findIndex(food => food.id === initialData.id);
        if (index !== -1) {
          foods[index] = newFood;
        }
      } else {
        // 添加新食物
        foods.push(newFood);
      }

      // 儲存更新後的資料
      await saveFoods(foods);
      
      alert('食物已成功儲存！');
      router.back();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加刪除函數
  const handleDelete = async () => {
    if (!initialData?.id) return;

    try {
      Alert.alert(
        '確認刪除',
        '確定要刪除這個食物嗎？',
        [
          {
            text: '取消',
            style: 'cancel'
          },
          {
            text: '刪除',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                const foods = await loadFoods();
                const updatedFoods = foods.filter(food => food.id !== initialData.id);
                await saveFoods(updatedFoods);
                
                Alert.alert('成功', '食物已成功刪除！', [
                  {
                    text: '確定',
                    onPress: () => router.back()
                  }
                ]);
              } catch (error) {
                console.error('Error deleting food:', error);
                Alert.alert('錯誤', '刪除失敗，請稍後再試');
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleDelete:', error);
      Alert.alert('錯誤', '操作失敗，請稍後再試');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>
          {initialData ? '編輯食物' : '新增食物'}
        </ThemedText>
        <ThemedView style={styles.headerButtons}>
          {initialData && ( // 只在編輯模式顯示刪除按鈕
            <Pressable 
              onPress={handleDelete} 
              disabled={isLoading}
              style={styles.deleteButton}
            >
              <ThemedText style={styles.deleteButtonText}>
                刪除
              </ThemedText>
            </Pressable>
          )}
          <Pressable 
            onPress={handleSubmit} 
            disabled={isLoading}
            style={styles.saveButton}
          >
            <ThemedText style={styles.saveButtonText}>
              {isLoading ? '儲存中...' : '儲存'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>

      <ScrollView style={styles.form}>
        <Pressable onPress={pickImage} style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <ThemedView style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color="#666" />
              <ThemedText>點擊上傳圖片</ThemedText>
            </ThemedView>
          )}
        </Pressable>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>食物名稱</ThemedText>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="請輸入食物名稱"
          />
        </ThemedView>
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>分類</ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
              itemStyle={{ fontSize: 16, height: 44 }}
            >
              {FOOD_CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>重量 (g)</ThemedText>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="請輸入重量"
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>熱量 (kcal)</ThemedText>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            placeholder="請輸入熱量"
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>蛋白質 (g)</ThemedText>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            placeholder="請輸入蛋白質含量"
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>碳水化合物 (g)</ThemedText>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            placeholder="請輸入碳水化合物含量"
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>脂肪 (g)</ThemedText>
          <TextInput
            style={styles.input}
            value={fat}
            onChangeText={setFat}
            placeholder="請輸入脂肪含量"
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>纖維素 (g)</ThemedText>
          <TextInput
            style={styles.input}
            value={fiber}
            onChangeText={setFiber}
            placeholder="請輸入纖維素含量"
            keyboardType="numeric"
          />
        </ThemedView>

       
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    marginLeft: 12,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  deleteButton: {
    marginRight: 12,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    width: '100%',
  },
});