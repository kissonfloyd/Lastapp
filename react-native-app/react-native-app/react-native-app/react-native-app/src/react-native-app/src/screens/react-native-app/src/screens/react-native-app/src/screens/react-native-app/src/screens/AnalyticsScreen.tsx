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
import { ExpenseCategory } from '../types/Expense';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#FF6B35',
  backgroundGradientFrom: '#FF6B35',
  backgroundGradientTo: '#F7931E',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

const categoryColors = {
  'खाना-पीना': '#FF6B35',
  'यातायात': '#4CAF50',
  'खरीदारी': '#2196F3',
  'मनोरंजन': '#9C27B0',
  'बिल': '#FF9800',
  'स्वास्थ्य': '#F44336',
  'शिक्षा': '#607D8B',
  'अन्य': '#795548',
};

export default function AnalyticsScreen() {
  const { expenses, budgets, getCategoryExpenses, getMonthlyExpenses } = useContext(BudgetContext);

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0);
  const remainingBudget = totalBudget - totalExpenses;

  // Category-wise data for pie chart
  const categoryData = Object.keys(categoryColors).map((category) => {
    const categoryExpenses = getCategoryExpenses(category as ExpenseCategory);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category,
      amount: total,
      color: categoryColors[category as keyof typeof categoryColors],
      legendFontColor: '#333',
      legendFontSize: 12,
    };
  }).filter(item => item.amount > 0);

  // Monthly expenses data
  const monthlyData = getMonthlyExpenses();
  const monthlyLabels = Object.keys(monthlyData).slice(-6); // Last 6 months
  const monthlyAmounts = monthlyLabels.map(month => monthlyData[month] || 0);

  // Top categories
  const topCategories = categoryData
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const getInsights = (): Array<{type: string; icon: string; text: string; color: string}> => {
    const insights: Array<{type: string; icon: string; text: string; color: string}> = [];
    
    if (totalExpenses > totalBudget * 0.8) {
      insights.push({
        type: 'warning',
        icon: 'warning',
        text: 'आपका खर्च बजेट के 80% के करीब पहुंच गया है',
        color: '#FF9800'
      });
    }

    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      insights.push({
        type: 'info',
        icon: 'pie-chart',
        text: `सबसे ज्यादा खर्च ${topCategory.name} में: रू ${topCategory.amount.toLocaleString()}`,
        color: '#2196F3'
      });
    }

    if (remainingBudget > 0) {
      insights.push({
        type: 'success',
        icon: 'checkmark-circle',
        text: `बचत: रू ${remainingBudget.toLocaleString()} बचा है`,
        color: '#4CAF50'
      });
    }

    return insights;
  };

  const insights = getInsights();

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={80} color="#DDD" />
        <Text style={styles.emptyTitle}>कोई विश्लेषण उपलब्ध नहीं</Text>
        <Text style={styles.emptyText}>
          विश्लेषण देखने के लिए पहले कुछ खर्च जोड़ें
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={styles.overviewCard}>
          <Ionicons name="wallet" size={24} color="#FF6B35" />
          <Text style={styles.overviewAmount}>रू {totalBudget.toLocaleString()}</Text>
          <Text style={styles.overviewLabel}>कुल बजेट</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <Ionicons name="trending-up" size={24} color="#F44336" />
          <Text style={styles.overviewAmount}>रू {totalExpenses.toLocaleString()}</Text>
          <Text style={styles.overviewLabel}>कुल खर्च</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <Ionicons name="cash" size={24} color="#4CAF50" />
          <Text style={styles.overviewAmount}>रू {remainingBudget.toLocaleString()}</Text>
          <Text style={styles.overviewLabel}>बचत</Text>
        </View>
      </View>

      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>अंतर्दृष्टि</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Ionicons name={insight.icon as any} size={20} color={insight.color} />
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Monthly Spending Trend */}
      {monthlyLabels.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>मासिक खर्च की प्रवृत्ति</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: monthlyLabels,
                datasets: [{
                  data: monthlyAmounts,
                }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      )}

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>श्रेणी के अनुसार खर्च</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={categoryData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              style={styles.chart}
            />
          </View>
        </View>
      )}

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>शीर्ष खर्च श्रेणियां</Text>
          {topCategories.map((category, index) => {
            const percentage = ((category.amount / totalExpenses) * 100);
            return (
              <View key={category.name} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryAmount}>रू {category.amount.toLocaleString()}</Text>
                  <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Recent Expenses Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>हाल के खर्च का सारांश</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{expenses.length}</Text>
            <Text style={styles.summaryLabel}>कुल एंट्रीज</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {expenses.filter(e => e.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </Text>
            <Text style={styles.summaryLabel}>इस सप्ताह</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              रू {(totalExpenses / expenses.length).toFixed(0)}
            </Text>
            <Text style={styles.summaryLabel}>औसत खर्च</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  overviewContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  overviewAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  chart: {
    borderRadius: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
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
  summaryGrid: {
    flexDirection: 'row',
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
});
