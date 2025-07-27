export interface Expense {
  id: string;
  budgetId: string;
  description: string;
  amount: number;
  category: string;
  receiptImage?: string;
  createdAt: Date;
}

export const EXPENSE_CATEGORIES = [
  'खाना-पीना',
  'परिवहन',
  'मनोरंजन',
  'स्वास्थ्य',
  'शिक्षा',
  'कपड़े',
  'घरेलू सामान',
  'बिल और उपयोगिताएं',
  'अन्य'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
