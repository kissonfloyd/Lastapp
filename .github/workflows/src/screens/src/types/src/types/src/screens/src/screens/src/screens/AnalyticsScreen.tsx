import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { BudgetContext } from '../context/BudgetContext';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { budgets, expenses, totalSpent, getCategoryExpenses, getMonthlyExpenses } = useContext(BudgetContext);

  const categoryData = getCategoryExpenses();
  const monthlyData = getMonthlyExpenses();
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudgets = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const remainingBudget = totalBudgets - totalExpenses;

  // Prepare pie chart data
  const pieChartData = Object.entries(categoryData).map(([category, amount], index) => ({
    name: category,
    amount: amount,
    color: [
      '#FF6B35', '#F7931E', '#4CAF50', '#2196F3', '#9C27B0',
      '#FF5722', '#795548', '#607D8B', '#E91E63', '#3F51B5'
    ][index % 10],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  // Prepare line chart data
  const monthlyEntries = Object.entries(monthlyData);
  const lineChartData = {
    labels: monthlyEntries.slice(-6).map(([month]) => month.split(' ')[0]), // Show last 6 months
    datasets: [
      {
        data: monthlyEntries.slice(-6).map(([, amount]) => amount),
        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#FF6B35',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>खर्च विश्लेषण</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>रू {totalExpenses.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>कुल खर्च</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{expenses.length}</Text>
          <Text style={styles.summaryLabel}>कुल ट्रांजैक्शन</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>रू {totalBudgets.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>कुल बजेट</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[
            styles.summaryNumber, 
            { color: remainingBudget >= 0 ? '#4CAF50' : '#FF4444' }
          ]}>
            रू {remainingBudget.toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>बचत</Text>
        </View>
      </View>

      {/* Monthly Spending Trend */}
      {monthlyEntries.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>मासिक खर्च ट्रेंड</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Category-wise Spending */}
      {pieChartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>श्रेणी के अनुसार खर्च</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryData).length > 0 && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>श्रेणी विवरण</Text>
          {Object.entries(categoryData)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount], index) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100) : 0;
              return (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View style={[
                      styles.categoryDot, 
                      { backgroundColor: pieChartData[index]?.color || '#FF6B35' }
                    ]} />
                    <Text style={styles.categoryName}>{category}</Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryAmount}>
                      रू {amount.toLocaleString()}
                    </Text>
                    <Text style={styles.categoryPercentage}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>
      )}

      {/* Budget Performance */}
      {budgets.length > 0 && (
        <View style={styles.budgetPerformanceContainer}>
          <Text style={styles.breakdownTitle}>बजेट प्रदर्शन</Text>
          {budgets.map((budget) => {
            const spent = totalSpent(budget.id);
            const percentage = (spent / budget.amount) * 100;
            const isOverBudget = percentage > 100;
            
            return (
              <View key={budget.id} style={styles.budgetPerformanceItem}>
                <View style={styles.budgetInfo}>
                  <Text style={styles.budgetName}>{budget.name}</Text>
                  <Text style={styles.budgetAmount}>
                    रू {spent.toLocaleString()} / {budget.amount.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.budgetProgressContainer}>
                  <View style={styles.budgetProgressBar}>
                    <View
                      style={[
                        styles.budgetProgressFill,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOverBudget ? '#FF4444' : 
                            percentage > 75 ? '#FFA500' : '#4CAF50',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[
                    styles.budgetPercentage,
                    { color: isOverBudget ? '#FF4444' : '#666' }
                  ]}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
                
                {isOverBudget && (
                  <View style={styles.overBudgetWarning}>
                    <Ionicons name="warning" size={14} color="#FF4444" />
                    <Text style={styles.overBudgetText}>बजेट पार!</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Empty State */}
      {expenses.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={80} color="#DDD" />
          <Text style={styles.emptyText}>कोई डेटा उपलब्ध नहीं</Text>
          <Text style={styles.emptySubtext}>
            विश्लेषण देखने के लिए पहले कुछ खर्च जोड़ें
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  breakdownContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  budgetPerformanceContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  budgetPerformanceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  budgetAmount: {
    fontSize: 14,
    color: '#666',
  },
  budgetProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetPercentage: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 45,
    textAlign: 'right',
  },
  overBudgetWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  overBudgetText: {
    fontSize: 12,
    color: '#FF4444',
    marginLeft: 4,
    fontWeight: '500',
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
});
