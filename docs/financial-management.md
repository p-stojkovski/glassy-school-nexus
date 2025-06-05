# Financial Management Feature

This document provides an overview of the Financial Management feature in the Glassy School Nexus application.

## Overview

The Financial Management feature allows school administrators to:

1. Track student payment obligations
2. Record and manage payments
3. View financial dashboards and summary statistics
4. Export financial data for external analysis

## Key Components

### 1. Payment Obligations

Payment obligations represent financial requirements that students must fulfill, such as:
- Tuition fees
- Registration fees
- Book fees
- Activity fees
- Technology fees

Each obligation includes:
- Student information
- Amount due
- Due date
- Payment status (pending, partial, paid, overdue)
- Period (academic year or semester)

### 2. Payments

Payments record the transactions made by students against their obligations. Each payment includes:
- Student information
- Associated obligation
- Amount paid
- Payment date
- Payment method (cash, card, bank transfer, other)
- Reference number (optional)
- Notes

### 3. Financial Dashboard

The dashboard provides at-a-glance information about the school's financial status:
- Total obligations amount
- Total payments received
- Outstanding balance
- Overdue amount
- Payment status breakdown
- Monthly payment trends
- Recent payment activity
- Upcoming due dates

## Data Storage

This implementation uses localStorage for data persistence. All financial data is stored locally in the browser and persists between sessions. No data is sent to any server.

- Payment obligations are stored in `localStorage.paymentObligations`
- Payments are stored in `localStorage.payments`

## Usage

### Managing Payment Obligations

1. Navigate to the Finance page
2. Select the "Payment Obligations" tab
3. Use the "Add New Obligation" tab to create new obligations
4. Use the table view to:
   - Filter obligations by period, student, or search terms
   - Edit existing obligations
   - Delete obligations (this will also remove associated payments)

### Recording Payments

1. Navigate to the Finance page
2. Select the "Payments" tab
3. Use the "Record Payment" tab to add new payments
4. Select a student and their obligation to make a payment against
5. The system will suggest the remaining amount, but you can adjust it for partial payments
6. Use the Payment History view to see, edit, or delete existing payments

### Financial Analytics

1. Navigate to the Finance page
2. The "Dashboard" tab shows key financial metrics and charts
3. Use the Export Data button in the header to download financial data as CSV files

## Technical Implementation

The Financial Management feature is built using:
- React for the UI components
- Redux for state management
- React Hook Form for form handling
- Recharts for data visualization
- TypeScript for type safety

All data is persisted to localStorage and automatically loaded when the application starts.

## Note about Demo Mode

This feature runs in demo mode, meaning all data is stored locally in the browser. This is indicated by the Demo Mode notification banner.
