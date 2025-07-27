import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BudgetContext } from '../context/BudgetContext';
import { Expense, EXPENSE_CATEGORIES } from '../types/Expense';

export default function ExpenseScreen() {
  const { budgets, expenses, addExpense, deleteExpense } = useContext(BudgetContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showBudgetPicker, setShowBudgetPicker] = useState(false);

  const handleAddExpense = () => {
    if (!selectedBudget || !description.trim() || !amount.trim() || !selectedCategory) {
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
      description: description.trim(),
      amount: expenseAmount,
      category: selectedCategory,
      receiptImage: receiptImage || undefined,
      createdAt: new Date(),
    };

    addExpense(newExpense);
    
    // Reset form
    setSelectedBudget('');
    setDescription('');
    setAmount('');
    setSelectedCategory('');
    setReceiptImage(null);
    setModalVisible(false);
    
    Alert.alert('सफलता', 'खर्च सफलतापूर्वक जोड़ा गया');
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('अनुमति आवश्यक', 'फोटो चुनने के लिए गैलरी की अनुमति दें');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('अनुमति आवश्यक', 'फोटो लेने के लिए कैमरा की अनुमति दें');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'रसीद की फोटो',
      'फोटो कैसे जोड़ना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { text: 'गैलरी से चुनें', onPress: pickImage },
        { text: 'फोटो लें', onPress: takePhoto },
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

              {/* Budget Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>बजेट चुनें *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowBudgetPicker(true)}
                >
                  <Text style={[styles.pickerText, { color: selectedBudget ? '#333' : '#999' }]}>
                    {selectedBudget ? getBudgetName(selectedBudget) : 'बजेट चुनें'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>विवरण *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="जैसे: दोपहर का खाना, पेट्रोल"
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Amount */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>राशि (रू) *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="जैसे: 500"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Category Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>श्रेणी *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <Text style={[styles.pickerText, { color: selectedCategory ? '#333' : '#999' }]}>
                    {selectedCategory || 'श्रेणी चुनें'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Receipt Photo */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>रसीद की फोटो (वैकल्पिक)</Text>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={showImagePickerOptions}
                >
                  <Ionicons name="camera" size={20} color="#FF6B35" />
                  <Text style={styles.imageButtonText}>फोटो जोड़ें</Text>
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

      {/* Budget Picker Modal */}
      <Modal
        visible={showBudgetPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBudgetPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowBudgetPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>बजेट चुनें</Text>
            {budgets.map((budget) => (
              <TouchableOpacity
                key={budget.id}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedBudget(budget.id);
                  setShowBudgetPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{budget.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>श्रेणी चुनें</Text>
            {EXPENSE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        transparent={true}
        animationType="fade"
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  expensesList: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  expenseBudget: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF3F0',
    borderRadius: 20,
  },
  receiptButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
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
    margin: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '80%',
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
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
