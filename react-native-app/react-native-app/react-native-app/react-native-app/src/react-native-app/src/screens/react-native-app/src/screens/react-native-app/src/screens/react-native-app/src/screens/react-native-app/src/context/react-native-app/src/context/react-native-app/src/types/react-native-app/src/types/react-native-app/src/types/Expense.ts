export type ExpenseCategory = 
  | 'खाना-पीना' 
  | 'यातायात' 
  | 'खरीदारी' 
  | 'मनोरंजन' 
  | 'बिल' 
  | 'स्वास्थ्य' 
  | 'शिक्षा' 
  | 'अन्य';

export interface Expense {
  id: string;
  budgetId: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  receiptImage?: string | null;
  createdAt: Date;
}
