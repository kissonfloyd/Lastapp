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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BudgetContext } from '../context/BudgetContext';
import { Budget } from '../types/Budget';

export default function BudgetScreen() {
  const { budgets, addBudget, totalSpent, addExpense } = useContext(BudgetContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleAddBudget = () => {
    if (!budgetName.trim() || !budgetAmount.trim()) {
      Alert.alert('त्रुटि', 'कृपया सभी फ़ील्ड भरें');
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('त्रुटि', 'कृपया सही राशि दर्ज करें');
      return;
    }

    const newBudget: Budget = {
      id: Date.now().toString(),
      name: budgetName,
      amount: amount,
      spent: 0,
      createdAt: new Date(),
    };

    addBudget(newBudget);
    setBudgetName('');
    setBudgetAmount('');
    setModalVisible(false);
    Alert.alert('सफलता', 'बजेट सफलतापूर्वक जोड़ा गया');
  };

  const getBudgetProgress = (budget: Budget) => {
    const spent = totalSpent(budget.id);
    const percentage = (spent / budget.amount) * 100;
    return Math.min(percentage, 100);
  };

  const getBudgetColor = (budget: Budget) => {
    const progress = getBudgetProgress(budget);
    if (progress >= 90) return '#FF4444';
    if (progress >= 75) return '#FFA500';
    return '#4CAF50';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>मेरे बजेट</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>कोई बजेट नहीं मिला</Text>
            <Text style={styles.emptySubtext}>
              अपना पहला बजेट जोड़ने के लिए + बटन दबाएं
            </Text>
          </View>
        ) : (
          budgets.map((budget) => {
            const spent = totalSpent(budget.id);
            const remaining = budget.amount - spent;
            const progress = getBudgetProgress(budget);
            const color = getBudgetColor(budget);

            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetName}>{budget.name}</Text>
                  <Text style={styles.budgetAmount}>रू {budget.amount.toLocaleString()}</Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: color }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
                </View>

                <View style={styles.budgetStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>खर्च</Text>
                    <Text style={[styles.statValue, { color: '#FF6B35' }]}>
                      रू {spent.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>बचा हुआ</Text>
                    <Text style={[styles.statValue, { color: color }]}>
                      रू {remaining.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {progress >= 90 && (
                  <View style={styles.warningContainer}>
                    <Ionicons name="warning" size={16} color="#FF4444" />
                    <Text style={styles.warningText}>
                      बजेट सीमा के करीब पहुंच गया है!
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>नया बजेट जोड़ें</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>बजेट का नाम</Text>
              <TextInput
                style={styles.input}
                value={budgetName}
                onChangeText={setBudgetName}
                placeholder="जैसे: मासिक खर्च, छुट्टी, खरीदारी"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>राशि (रू)</Text>
              <TextInput
                style={styles.input}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
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
                onPress={handleAddBudget}
              >
                <Text style={styles.saveButtonText}>सेव करें</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  budgetCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#FF4444',
    marginLeft: 6,
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
    width: '90%',
    maxWidth: 400,
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
});
