import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget } from '../types/Budget';
import { Expense } from '../types/Expense';

interface BudgetContextType {
  budgets: Budget[];
  expenses: Expense[];
  addBudget: (budget: Budget) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  totalSpent: (budgetId: string) => number;
  getCategoryExpenses: () => { [key: string]: number };
  getMonthlyExpenses: () => { [key: string]: number };
}

export const BudgetContext = createContext<BudgetContextType>({
  budgets: [],
  expenses: [],
  addBudget: () => {},
  addExpense: () => {},
  deleteExpense: () => {},
  totalSpent: () => 0,
  getCategoryExpenses: () => ({}),
  getMonthlyExpenses: () => ({}),
});

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadData();
  }, []);

  // Save data to AsyncStorage whenever budgets or expenses change
  useEffect(() => {
    saveData();
  }, [budgets, expenses]);

  const loadData = async () => {
    try {
      const budgetsData = await AsyncStorage.getItem('budgets');
      const expensesData = await AsyncStorage.getItem('expenses');
      
      if (budgetsData) {
        const parsedBudgets = JSON.parse(budgetsData);
        setBudgets(parsedBudgets.map((budget: any) => ({
          ...budget,
          createdAt: new Date(budget.createdAt),
        })));
      }
      
      if (expensesData) {
        const parsedExpenses = JSON.parse(expensesData);
        setExpenses(parsedExpenses.map((expense: any) => ({
          ...expense,
          createdAt: new Date(expense.createdAt),
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
      await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addBudget = (budget: Budget) => {
    setBudgets(prev => [...prev, budget]);
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  const totalSpent = (budgetId: string): number => {
    return expenses
      .filter(expense => expense.budgetId === budgetId)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryExpenses = (): { [key: string]: number } => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return categoryTotals;
  };

  const getMonthlyExpenses = (): { [key: string]: number } => {
    const monthlyData: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const monthKey = new Date(expense.createdAt).toLocaleDateString('ne-NP', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
    });

    return monthlyData;
  };

  const value: BudgetContextType = {
    budgets,
    expenses,
    addBudget,
    addExpense,
    deleteExpense,
    totalSpent,
    getCategoryExpenses,
    getMonthlyExpenses,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
