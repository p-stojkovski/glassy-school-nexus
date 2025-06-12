
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

export interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  description: string;
  createdDate: string;
}

// New interfaces for enhanced financial management
export interface PaymentObligation {
  id: string;
  studentId: string;
  studentName: string; // For easier display
  type: string; // "tuition", "materials", "activity", etc.
  amount: number;
  dueDate: string; // ISO date string
  period: string; // "Fall 2023", "Spring 2024", etc.
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  obligationId: string;
  studentId: string;
  studentName: string; // For easier display
  amount: number;
  date: string; // ISO date string
  method: 'cash' | 'card' | 'transfer' | 'other';
  reference?: string; // Receipt/transaction number
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FinanceState {
  invoices: Invoice[];
  obligations: PaymentObligation[];
  payments: Payment[];
  loading: boolean;
  totalRevenue: number;
  pendingAmount: number;
  selectedPeriod: string | null;
  selectedStudentId: string | null;
  error: string | null;
}

// Load initial data from localStorage if available
const loadInitialObligations = (): PaymentObligation[] =>
  loadFromStorage<PaymentObligation[]>('paymentObligations') || [];

const loadInitialPayments = (): Payment[] =>
  loadFromStorage<Payment[]>('payments') || [];

// Get current date for obligation status updates
const getCurrentDate = (): string => new Date().toISOString().split('T')[0];

// Update obligation statuses based on payments and due dates
const updateObligationStatuses = (obligations: PaymentObligation[], payments: Payment[]): PaymentObligation[] => {
  const currentDate = getCurrentDate();
  
  return obligations.map(obligation => {
    // Find all payments for this obligation
    const obligationPayments = payments.filter(payment => payment.obligationId === obligation.id);
    const totalPaid = obligationPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    let status: 'pending' | 'partial' | 'paid' | 'overdue';
    
    if (totalPaid >= obligation.amount) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    } else if (String(obligation.dueDate).localeCompare(currentDate) < 0) {
      status = 'overdue';
    } else {
      status = 'pending';
    }
    
    return {
      ...obligation,
      status
    };
  });
};

const initialState: FinanceState = {
  invoices: [],
  obligations: loadInitialObligations(),
  payments: loadInitialPayments(),
  loading: false,
  totalRevenue: 0,
  pendingAmount: 0,
  selectedPeriod: null,
  selectedStudentId: null,
  error: null,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    // Legacy invoice reducers
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
    
    // New financial management reducers
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setSelectedPeriod: (state, action: PayloadAction<string | null>) => {
      state.selectedPeriod = action.payload;
    },
    
    setSelectedStudent: (state, action: PayloadAction<string | null>) => {
      state.selectedStudentId = action.payload;
    },
      // Payment Obligation CRUD operations
    createObligation: (state, action: PayloadAction<PaymentObligation>) => {
      state.obligations.push(action.payload);
      // Calculate status when creating a new obligation
      state.obligations = updateObligationStatuses(state.obligations, state.payments);
      saveToStorage('paymentObligations', state.obligations);
    },
    
    updateObligation: (state, action: PayloadAction<PaymentObligation>) => {
      const index = state.obligations.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.obligations[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
        state.obligations = updateObligationStatuses(state.obligations, state.payments);
        saveToStorage('paymentObligations', state.obligations);
      }
    },
    
    deleteObligation: (state, action: PayloadAction<string>) => {
      state.obligations = state.obligations.filter(o => o.id !== action.payload);
      // Also delete related payments
      state.payments = state.payments.filter(p => p.obligationId !== action.payload);
      saveToStorage('paymentObligations', state.obligations);
      saveToStorage('payments', state.payments);
    },
    
    // Payment CRUD operations
    createPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
      // Update obligation status after payment
      state.obligations = updateObligationStatuses(state.obligations, state.payments);
      saveToStorage('payments', state.payments);
      saveToStorage('paymentObligations', state.obligations);
    },
    
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
        // Update obligation status after payment change
        state.obligations = updateObligationStatuses(state.obligations, state.payments);
        saveToStorage('payments', state.payments);
        saveToStorage('paymentObligations', state.obligations);
      }
    },
    
    deletePayment: (state, action: PayloadAction<string>) => {
      state.payments = state.payments.filter(p => p.id !== action.payload);
      // Update obligation status after payment deletion
      state.obligations = updateObligationStatuses(state.obligations, state.payments);
      saveToStorage('payments', state.payments);
      saveToStorage('paymentObligations', state.obligations);
    },
    
    // Add payments in batch
    addPaymentsBatch: (state, action: PayloadAction<Payment[]>) => {
      state.payments = [...state.payments, ...action.payload];
      // Update obligation statuses after batch payment
      state.obligations = updateObligationStatuses(state.obligations, state.payments);
      saveToStorage('payments', state.payments);
      saveToStorage('paymentObligations', state.obligations);
    },
    
    // Clear all data (for testing/demo purposes)
    clearAllFinancialData: (state) => {
      state.obligations = [];
      state.payments = [];
      localStorage.removeItem('paymentObligations');
      localStorage.removeItem('payments');
    },
    
    // Update all obligation statuses (run periodically)
    refreshObligationStatuses: (state) => {
      state.obligations = updateObligationStatuses(state.obligations, state.payments);
      saveToStorage('paymentObligations', state.obligations);
    }
  },
});

export const { 
  setInvoices, 
  addInvoice, 
  updateInvoice, 
  setFinanceStats, 
  setLoading,
  setError,
  setSelectedPeriod,
  setSelectedStudent,
  createObligation,
  updateObligation,
  deleteObligation,
  createPayment,
  updatePayment,
  deletePayment,
  addPaymentsBatch,
  clearAllFinancialData,
  refreshObligationStatuses
} = financeSlice.actions;

// Selectors
export const selectAllObligations = (state: RootState) => state.finance.obligations;
export const selectAllPayments = (state: RootState) => state.finance.payments;
export const selectError = (state: RootState) => state.finance.error;
export const selectSelectedPeriod = (state: RootState) => state.finance.selectedPeriod;
export const selectSelectedStudentId = (state: RootState) => state.finance.selectedStudentId;

export const selectObligationsByStudentId = (state: RootState, studentId: string) => 
  state.finance.obligations.filter(obligation => obligation.studentId === studentId);

export const selectPaymentsByStudentId = (state: RootState, studentId: string) => 
  state.finance.payments.filter(payment => payment.studentId === studentId);

export const selectPaymentsByObligationId = (state: RootState, obligationId: string) => 
  state.finance.payments.filter(payment => payment.obligationId === obligationId);

export const selectObligationsByPeriod = (state: RootState, period: string) => 
  state.finance.obligations.filter(obligation => obligation.period === period);

export const selectPaymentsByPeriod = (state: RootState, period: string) => {
  const obligationIds = state.finance.obligations
    .filter(obligation => obligation.period === period)
    .map(obligation => obligation.id);
  
  return state.finance.payments.filter(payment => 
    obligationIds.includes(payment.obligationId)
  );
};

// Calculate total outstanding balance for a student
export const selectStudentOutstandingBalance = (state: RootState, studentId: string): number => {
  const obligations = selectObligationsByStudentId(state, studentId);
  const payments = selectPaymentsByStudentId(state, studentId);
  
  const totalObligations = obligations.reduce((sum, obligation) => sum + obligation.amount, 0);
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return totalObligations - totalPayments;
};

// Calculate total outstanding balance for the whole school
export const selectTotalOutstandingBalance = (state: RootState): number => {
  const totalObligations = state.finance.obligations.reduce((sum, obligation) => sum + obligation.amount, 0);
  const totalPayments = state.finance.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return totalObligations - totalPayments;
};

export default financeSlice.reducer;
