# Student Discount Management Feature

## Overview
Add comprehensive discount management functionality to the student management system, allowing administrators to assign discounts based on various categories (relatives, social case, single parent, free of charge) with corresponding discount amounts in denars. This feature integrates with the existing financial management system to ensure accurate payment calculations.

## User Story
As a **school administrator**, I want to **assign discount categories and amounts to students** so that **I can provide financial assistance based on specific criteria and ensure accurate payment calculations**.

## User Journey
1. Administrator opens student form (Add New Student or Edit Existing Student)
2. Administrator scrolls to the "Financial Information" section (new section)
3. Administrator selects a discount type from dropdown menu
4. If discount type is not "free of charge", administrator enters discount amount in denars
5. If "free of charge" is selected, amount field is automatically disabled and set to 0
6. Administrator completes other student information and saves
7. System validates discount information and saves to localStorage
8. Discount information appears in student profiles and affects financial calculations

## Acceptance Criteria

### Scenario 1: Adding discount to new student
- **Given** I am adding a new student
- **When** I open the student form
- **Then** I should see a "Financial Information" section with discount fields
- **And** the discount type dropdown should contain options: "None", "Relatives", "Social Case", "Single Parent", "Free of Charge"
- **And** the discount amount field should be enabled and accept numeric input

### Scenario 2: Selecting "Free of Charge" discount
- **Given** I am in the student form with discount fields visible
- **When** I select "Free of Charge" from the discount type dropdown
- **Then** the discount amount field should be disabled
- **And** the discount amount should be automatically set to 0
- **And** a visual indicator should show that this student receives free education

### Scenario 3: Selecting other discount types
- **Given** I am in the student form with discount fields visible
- **When** I select "Relatives", "Social Case", or "Single Parent"
- **Then** the discount amount field should remain enabled
- **And** I should be able to enter a discount amount in denars
- **And** the field should validate that the amount is a positive number

### Scenario 4: Editing existing student discount
- **Given** I am editing an existing student with an assigned discount
- **When** I open the student form
- **Then** the current discount type and amount should be pre-populated
- **And** I should be able to modify both the type and amount
- **And** validation rules should apply as in new student scenarios

### Scenario 5: Removing discount from student
- **Given** I am editing a student with an existing discount
- **When** I select "None" from the discount type dropdown
- **Then** the discount amount field should be cleared and disabled
- **And** the student should no longer have any discount applied

### Scenario 6: Form validation
- **Given** I have selected a discount type that requires an amount
- **When** I leave the discount amount field empty or enter an invalid value
- **Then** I should see a validation error message
- **And** I should not be able to submit the form until the error is resolved

### Scenario 7: Student table display
- **Given** students have various discount types assigned
- **When** I view the student table
- **Then** I should see a discount indicator/badge for students with discounts
- **And** the indicator should show the discount type (R for Relatives, S for Social Case, SP for Single Parent, F for Free of Charge)

### Scenario 8: Financial integration
- **Given** a student has a discount assigned
- **When** payment obligations are created for this student
- **Then** the discount should be factored into payment calculations
- **And** the original amount, discount, and final amount should be clearly displayed

## Development Tasks

### Phase 1: Data Model and State Management
1. **Update Student Interface** - Add discount fields to Student type in studentsSlice.ts
   - Add `discountType?: 'none' | 'relatives' | 'social_case' | 'single_parent' | 'free_of_charge'`
   - Add `discountAmount?: number` (amount in denars)
   - Update mock data to include discount examples
   - Ensure backward compatibility with existing student records

2. **Create Discount Enum** - Add discount types to enums.ts
   - Create `DiscountType` enum with all discount categories
   - Ensure consistency across the application

3. **Update Mock Data Service** - Extend MockDataService to handle discount data
   - Update student data structure in mock JSON files
   - Add sample students with various discount types for testing
   - Ensure data persistence includes discount information

### Phase 2: Form Components and Validation
4. **Create Discount Form Components** - Build reusable discount selection components
   - `DiscountTypeSelect` component with proper styling
   - `DiscountAmountInput` component with conditional enabling/disabling
   - Integration with React Hook Form and Zod validation

5. **Update Student Form** - Integrate discount fields into existing StudentForm
   - Add new "Financial Information" FormSection
   - Implement conditional logic for amount field based on discount type
   - Add proper form validation with Zod schema updates
   - Ensure proper error handling and user feedback

6. **Form Validation Logic** - Implement comprehensive validation rules
   - Discount amount must be positive number when required
   - Amount field disabled when "free of charge" selected
   - Proper error messages for validation failures
   - Integration with existing form validation patterns

### Phase 3: UI/UX Implementation
7. **Student Table Enhancement** - Add discount indicators to student table
   - Create `DiscountBadge` component for table display
   - Add discount column or integrate with existing columns
   - Implement hover tooltips showing discount details
   - Maintain table performance and responsive design

8. **Student Profile Integration** - Display discount information in student profiles
   - Add discount section to student profile page
   - Show discount type, amount, and effective savings
   - Integrate with existing student profile layout patterns

9. **Visual Design Components** - Create consistent visual elements
   - Discount type icons and color coding
   - Badge components for different discount types
   - Consistent styling with existing app theme
   - Accessibility compliance for color-blind users

### Phase 4: Financial System Integration
10. **Payment Calculation Updates** - Integrate discounts with financial management
    - Update payment obligation creation to consider student discounts
    - Modify financial calculations to apply discounts automatically
    - Ensure discount information is preserved in payment records

11. **Financial Reports Enhancement** - Update financial reporting to include discount data
    - Add discount columns to financial exports
    - Update financial dashboard to show discount summaries
    - Create discount-specific reporting functionality

12. **Obligation Management Updates** - Update existing payment obligation workflows
    - Show original amount, discount, and final amount in payment forms
    - Update payment obligation display components
    - Ensure discount information is visible in financial management pages

### Phase 5: Testing and Documentation
13. **Data Migration Handling** - Ensure smooth transition for existing data
    - Add default discount values for existing students
    - Create data migration utility if needed
    - Test backward compatibility thoroughly

14. **Form Integration Testing** - Comprehensive testing of form workflows
    - Test all discount type selections and validations
    - Verify form submission and data persistence
    - Test edit scenarios and data pre-population

15. **Financial Integration Testing** - Verify discount calculations work correctly
    - Test payment obligation creation with discounts
    - Verify financial dashboard calculations include discounts
    - Test edge cases and error scenarios

## Technical Considerations

### Data Structure Changes
- **Student Interface Updates**: Add optional discount fields to maintain backward compatibility
- **Storage Strategy**: Extend localStorage schema to include discount data
- **Migration Path**: Provide default values for existing student records

### Form Architecture
- **Conditional Field Logic**: Implement clean conditional rendering for amount field
- **Validation Strategy**: Extend existing Zod schemas with discount validation rules
- **Component Reusability**: Create modular discount components for potential future use

### Financial System Integration
- **Calculation Logic**: Integrate discount calculations into existing payment systems
- **Data Consistency**: Ensure discount information flows correctly through financial workflows
- **Reporting Accuracy**: Update all financial reports to account for discounts

### Performance Considerations
- **Table Performance**: Ensure discount indicators don't impact student table rendering performance
- **Data Loading**: Optimize discount data loading and caching strategies
- **Form Performance**: Maintain responsive form interactions with conditional logic

### Accessibility and UX
- **Form Accessibility**: Ensure discount fields are properly labeled and accessible
- **Visual Indicators**: Provide clear visual feedback for discount status
- **Error Handling**: Implement clear error messages and validation feedback
- **Mobile Responsiveness**: Ensure discount forms work well on mobile devices

## Definition of Done
- [ ] Student form includes functional discount type and amount fields
- [ ] "Free of charge" selection automatically disables and clears amount field
- [ ] Form validation prevents submission with invalid discount data
- [ ] Student table displays discount indicators for applicable students
- [ ] Existing student data is preserved and compatible with new discount fields
- [ ] Discount information integrates with financial calculation systems
- [ ] All new components follow established styling and accessibility patterns
- [ ] Data persists correctly in localStorage with proper error handling
- [ ] Mobile responsive design works across all screen sizes
- [ ] Demo mode includes sample students with various discount types
- [ ] Financial reports and dashboards account for discount amounts
- [ ] Component library includes reusable discount-related components

## Priority Assessment
**High Priority** - This feature directly impacts the school's financial management capabilities and provides essential functionality for managing student assistance programs. The integration with existing financial systems makes this a critical enhancement for accurate payment tracking and reporting.

## Related Features
- Financial Management System (payment obligations, payment tracking)
- Student Profile Management (profile display, data persistence)
- Reporting System (financial dashboards, data export)
- Form Management (validation, error handling, user experience)