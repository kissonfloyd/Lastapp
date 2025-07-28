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
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>रद्द करें</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddExpense}
                >
                  <Text style={styles.saveButtonText}>सेव करें</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showImageViewer}
        onRequestClose={() => setShowImageViewer(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity
            style={styles.imageViewerClose}
            onPress={() => setShowImageViewer(false)}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expensesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 2,
  },
  expenseBudget: {
    fontSize: 12,
    color: '#666',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FFF5F0',
    borderRadius: 6,
  },
  receiptButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  budgetSelector: {
    flexDirection: 'row',
  },
  budgetOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  selectedBudget: {
    backgroundColor: '#FF6B35',
  },
  budgetOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedBudgetText: {
    color: '#FFFFFF',
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#FF6B35',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  imageButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    marginLeft: 8,
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  fullScreenImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
});
