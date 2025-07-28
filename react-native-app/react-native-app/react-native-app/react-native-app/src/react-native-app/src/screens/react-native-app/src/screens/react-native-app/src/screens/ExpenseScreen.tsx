import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BudgetContext } from '../context/BudgetContext';
import { Expense, ExpenseCategory } from '../types/Expense';

const categories: ExpenseCategory[] = [
  'खाना-पीना', 'यातायात', 'खरीदारी', 'मनोरंजन', 
  'बिल', 'स्वास्थ्य', 'शिक्षा', 'अन्य'
];

export default function ExpenseScreen() {
  const { budgets, expenses, addExpense, deleteExpense } = useContext(BudgetContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('अन्य');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddExpense = () => {
    if (!selectedBudget || !amount.trim() || !description.trim()) {
      Alert.alert('त्रुटि', 'कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Alert.alert('त्रुटि', 'कृपया सही राशि दर्ज करें');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      budgetId: selectedBudget,
      amount: expenseAmount,
      description,
      category,
      receiptImage,
      createdAt: new Date(),
    };

    addExpense(newExpense);
    
    // Reset form
    setSelectedBudget('');
    setAmount('');
    setDescription('');
    setCategory('अन्य');
    setReceiptImage(null);
    setModalVisible(false);
    
    Alert.alert('सफलता', 'खर्च सफलतापूर्वक जोड़ा गया');
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('अनुमति आवश्यक', 'रसीद अपलोड करने के लिए फोटो एक्सेस की अनुमति दें');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('अनुमति आवश्यक', 'रसीद की फोटो लेने के लिए कैमरा की अनुमति दें');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'रसीद की फोटो',
      'आप कैसे रसीद की फोटो जोड़ना चाहते हैं?',
      [
        { text: 'कैमरा', onPress: takePhoto },
        { text: 'गैलरी से चुनें', onPress: pickImage },
        { text: 'रद्द करें', style: 'cancel' }
      ]
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      'पुष्टि करें',
      'क्या आप इस खर्च को हटाना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { text: 'हटाएं', style: 'destructive', onPress: () => deleteExpense(expenseId) }
      ]
    );
  };

  const getBudgetName = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    return budget ? budget.name : 'अज्ञात बजेट';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseBudget}>{getBudgetName(item.budgetId)}</Text>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={styles.amountText}>रू {item.amount.toLocaleString()}</Text>
          <Text style={styles.expenseDate}>
            {new Date(item.createdAt).toLocaleDateString('ne-NP')}
          </Text>
        </View>
      </View>
      
      <View style={styles.expenseActions}>
        {item.receiptImage && (
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={() => {
              setSelectedImage(item.receiptImage);
              setShowImageViewer(true);
            }}
          >
            <Ionicons name="image" size={16} color="#FF6B35" />
            <Text style={styles.receiptButtonText}>रसीद देखें</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteExpense(item.id)}
        >
          <Ionicons name="trash" size={16} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>मेरे खर्च</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        style={styles.expensesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>कोई खर्च नहीं मिला</Text>
            <Text style={styles.emptySubtext}>
              अपना पहला खर्च जोड़ने के लिए + बटन दबाएं
            </Text>
          </View>
        }
      />

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>नया खर्च जोड़ें</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>बजेट चुनें *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.budgetSelector}>
                  {budgets.map((budget) => (
                    <TouchableOpacity
                      key={budget.id}
                      style={[
                        styles.budgetOption,
                        selectedBudget === budget.id && styles.selectedBudget
                      ]}
                      onPress={() => setSelectedBudget(budget.id)}
                    >
                      <Text style={[
                        styles.budgetOptionText,
                        selectedBudget === budget.id && styles.selectedBudgetText
                      ]}>
                        {budget.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>राशि (रू) *</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>विवरण *</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="खर्च का विवरण लिखें"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>श्रेणी</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        category === cat && styles.selectedCategory
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        category === cat && styles.selectedCategoryText
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>रसीद की फोटो (वैकल्पिक)</Text>
                <TouchableOpacity style={styles.imageButton} onPress={showImagePicker}>
                  <Ionicons name="camera" size={24} color="#FF6B35" />
                  <Text style={styles.imageButtonText}>रसीद की फोटो जोड़ें</Text>
                </TouchableOpacity>
                {receiptImage && (
                  <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
