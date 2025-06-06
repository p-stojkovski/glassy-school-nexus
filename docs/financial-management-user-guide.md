# Financial Management User Guide

This guide provides step-by-step instructions for using the Financial Management feature in the Glassy School Nexus application.

## Accessing the Financial Management Feature

1. Log in to the Glassy School Nexus application
2. Click on the "Finance" option in the sidebar menu
3. You will be directed to the Financial Management page with three tabs:
   - Dashboard
   - Payment Obligations
   - Payments

## Financial Dashboard

The Dashboard is the central hub for monitoring the financial status of your school.

### Key Metrics

- **Total Obligations**: The total amount of all payment obligations assigned to students
- **Total Payments**: The total amount of payments received from students
- **Outstanding Balance**: The difference between total obligations and payments
- **Overdue Amount**: The total amount of overdue obligations

### Charts and Visualizations

- **Payment Status**: A pie chart showing the breakdown of payment statuses
- **Monthly Payments**: A bar chart showing payment trends over the last six months

### Activity Sections

- **Recent Payments**: The five most recent payments recorded in the system
- **Upcoming Due Dates**: The five closest upcoming payment obligations that are not yet paid

## Managing Payment Obligations

### Creating a New Payment Obligation

1. Click on the "Payment Obligations" tab
2. Select the "Add New Obligation" tab
3. Fill in the following details:
   - Student: Select from the dropdown
   - Obligation Type: Select the type of fee
   - Amount: Enter the amount due
   - Due Date: Select from the calendar
   - Period: Enter the academic period (e.g., "2023/2024")
   - Notes (optional): Add any relevant details
4. Click "Create Obligation" to save

### Batch Assigning Payment Obligations

You can efficiently assign the same payment obligation to multiple students at once:

1. Click on the "Payment Obligations" tab
2. Select the "Batch Assign" tab
3. Select students using the multi-selection dropdown:
   - Search for specific students by name or email
   - Filter by class to find groups of students
   - Use "Select all" to quickly select all filtered students
   - Selected students appear as badges in the selection area
4. Define the obligation details:
   - Choose an obligation type
   - Enter the amount (applied to each selected student)
   - Set a due date
   - Specify the period
   - Add optional notes
5. Click "Apply to Selected Students" to proceed
6. Review the summary of obligations to be created:
   - Number of students selected
   - Obligation details
   - Total batch amount
7. Click "Confirm Creation" to create obligations for all selected students
8. Review the confirmation screen showing the successfully created obligations

### Viewing and Filtering Obligations

1. Click on the "Payment Obligations" tab
2. Select the "View Obligations" tab
3. Use the search field to find specific students or obligation types
4. Use the Period and Student dropdowns to filter the list
5. Click "Clear Filters" to reset all filters

### Editing an Obligation

1. Find the obligation in the table
2. Click the three dots menu on the right
3. Select "Edit"
4. Make your changes in the form
5. Click "Update Obligation" to save

### Deleting an Obligation

1. Find the obligation in the table
2. Click the three dots menu on the right
3. Select "Delete"
4. Confirm the deletion in the dialog
5. Note: This will also delete any associated payments

## Recording and Managing Payments

### Recording a New Payment

1. Click on the "Payments" tab
2. Select the "Record Payment" tab
3. Fill in the following details:
   - Student: Select from the dropdown
   - Payment Obligation: Select the obligation this payment is for
   - Amount: Enter the payment amount (defaults to remaining balance)
   - Payment Date: Select from the calendar
   - Payment Method: Choose from cash, card, bank transfer, or other
   - Reference Number (optional): Enter a receipt or transaction number
   - Notes (optional): Add any relevant information
4. Click "Record Payment" to save

### Viewing Payment History

1. Click on the "Payments" tab
2. Select the "Payment History" tab
3. Use the search field to find payments by student or reference number
4. Use the Period and Student dropdowns to filter the list
5. Click "Clear Filters" to reset all filters

### Editing a Payment

1. Find the payment in the history table
2. Click the three dots menu on the right
3. Select "Edit"
4. Make your changes in the form
5. Click "Update Payment" to save

### Deleting a Payment

1. Find the payment in the history table
2. Click the three dots menu on the right
3. Select "Delete"
4. Confirm the deletion in the dialog
5. Note: This will update the status of the associated obligation

## Exporting Financial Data

1. Click the "Export Data" button in the top-right corner of the Financial Management page
2. Two CSV files will be downloaded:
   - `payment_obligations.csv` - Contains all obligation records
   - `payments.csv` - Contains all payment records
3. These files can be imported into spreadsheet software or accounting systems for further analysis or reporting

## Understanding Payment Status

Payment obligations can have one of four statuses:

- **Pending**: The obligation is not yet due and no payment or only partial payment has been made
- **Partial**: Some payment has been made, but the full amount has not been paid
- **Paid**: The full amount has been paid
- **Overdue**: The due date has passed and no payment or only partial payment has been made

The system automatically updates these statuses based on payments recorded and due dates.
