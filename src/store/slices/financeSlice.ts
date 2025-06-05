
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  description: string;
  createdDate: string;
}

interface FinanceState {
  invoices: Invoice[];
  loading: boolean;
  totalRevenue: number;
  pendingAmount: number;
}

const initialState: FinanceState = {
  invoices: [],
  loading: false,
  totalRevenue: 0,
  pendingAmount: 0,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.invoices = action.payload;
    },
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.push(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    setFinanceStats: (state, action: PayloadAction<{ totalRevenue: number; pendingAmount: number }>) => {
      state.totalRevenue = action.payload.totalRevenue;
      state.pendingAmount = action.payload.pendingAmount;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setInvoices, addInvoice, updateInvoice, setFinanceStats, setLoading } = financeSlice.actions;
export default financeSlice.reducer;
