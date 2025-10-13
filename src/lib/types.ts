import { Bell, BookOpen, Car, HeartPulse, ShoppingCart, Wallet } from "lucide-react";

export type Category = 'Patients' | 'Grocery' | 'Reading' | 'Travel' | 'Finance' | 'General';

export const categories: { name: Category, icon: React.ElementType }[] = [
    { name: 'Patients', icon: HeartPulse },
    { name: 'Grocery', icon: ShoppingCart },
    { name: 'Reading', icon: BookOpen },
    { name: 'Travel', icon: Car },
    { name: 'Finance', icon: Wallet },
    { name: 'General', icon: Bell },
];

export interface Reminder {
  id: string;
  text: string;
  dateTime: string; // ISO string
  category: Category;
  completed: boolean;
  notified: boolean;
}
