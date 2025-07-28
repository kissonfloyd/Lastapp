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
  getCategoryExpenses: (category: string) => Expense[];
  getMonthlyExpenses: () => { [key: string]: number };
}

export const BudgetContext = createContext<BudgetContextType>({
  budgets: [],
  expenses: [],
  addBudget: () => {},
  addExpense: () => {},
  deleteExpense: () => {},
  totalSpent: () => 0,
  getCategoryExpenses: () => [],
  getMonthlyExpenses: () => ({}),
});

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Storage keys
  const BUDGETS_KEY = 'smart_budget_tracker_budgets';
  const EXPENSES_KEY = 'smart_budget_tracker_expenses';

  // Load data on app start
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever budgets or expenses change
  useEffect(() => {
    saveBudgets();
  }, [budgets]);

  useEffect(() => {
    saveExpenses();
  }, [expenses]);

  const loadData = async () => {
    try {
      const budgetsData = await AsyncStorage.getItem(BUDGETS_KEY);
      const expensesData = await AsyncStorage.getItem(EXPENSES_KEY);

      if (budgetsData) {
        const parsedBudgets = JSON.parse(budgetsData).map((budget: any) => ({
          ...budget,
          createdAt: new Date(budget.createdAt),
        }));
        setBudgets(parsedBudgets);
      }

      if (expensesData) {
        const parsedExpenses = JSON.parse(expensesData).map((expense: any) => ({
          ...expense,
          createdAt: new Date(expense.createdAt),
        }));
        setExpenses(parsedExpenses);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveBudgets = async () => {
    try {
      if (budgets.length > 0) {
        await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
      }
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  };

  const saveExpenses = async () => {
    try {
      if (expenses.length > 0) {
        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      }
    } catch (error) {
      console.error('Error saving expenses:', error);
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

  const getCategoryExpenses = (category: string): Expense[] => {
    return expenses.filter(expense => expense.category === category);
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
