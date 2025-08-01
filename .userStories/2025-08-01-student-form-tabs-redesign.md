# Student Form Tabs Redesign

## Overview
Transform the student create/edit form from accordion-style collapsible sections to a tabbed interface matching the design and UX of the existing View student page. This improvement will enhance usability by providing better visual organization and reducing cognitive load for users filling out student information.

## User Story
As a school administrator, I want the student create/edit form to use tabs instead of collapsible sections so that I can more easily navigate between different types of student information and have a consistent experience with the student profile view.

## User Journey
### Creating a New Student
1. Administrator navigates to "Add New Student" page
2. Form displays with three tabs: "Student Information", "Parent/Guardian Information", "Financial Information"
3. "Student Information" tab is active by default
4. Administrator fills in required fields (name, date of birth, status)
5. Administrator clicks "Parent/Guardian Information" tab to add parent details
6. Administrator clicks "Financial Information" tab to set up discounts if needed
7. Administrator can navigate freely between tabs to review/modify information
8. Tab headers show visual indicators for completed sections and validation errors
9. Administrator clicks "Add Student" button to save

### Editing an Existing Student
1. Administrator navigates to edit student from student list or profile
2. Form displays with three tabs pre-populated with existing data
3. Tab with validation errors (if any) is automatically selected
4. Administrator can navigate between tabs to update different sections
5. Tab headers show visual indicators for sections with data and any errors
6. Administrator clicks "Update Student" button to save changes

## Acceptance Criteria

### Scenario 1: Tab Navigation and Layout
- Given I am on the student create/edit form
- When the page loads
- Then I should see three tabs: "Student Information", "Parent/Guardian Information", "Financial Information"
- And the "Student Information" tab should be active by default
- And tab headers should match the styling of the student profile page tabs
- And tab content should display the appropriate form fields for each section

### Scenario 2: Tab Content Organization
- Given I am viewing the student form tabs
- When I click on the "Student Information" tab
- Then I should see: name, email, phone, status, date of birth, place of birth, and notes fields
- When I click on the "Parent/Guardian Information" tab
- Then I should see: parent contact and parent email fields
- When I click on the "Financial Information" tab
- Then I should see: discount type and discount amount fields

### Scenario 3: Visual Indicators for Tab States
- Given I am on the student form with tabs
- When a tab contains validation errors
- Then the tab header should display a red error indicator
- When a tab contains data (for edit mode or partially filled forms)
- Then the tab header should display a visual data indicator
- When I switch between tabs
- Then the active tab should be clearly highlighted with consistent styling

### Scenario 4: Form Validation Across Tabs
- Given I am filling out the student form
- When I submit the form with validation errors in any tab
- Then the tab containing errors should be automatically selected
- And error messages should display within the active tab content
- And the tab header should show an error indicator

### Scenario 5: Data Persistence Between Tabs
- Given I am filling out the student form
- When I enter data in one tab and switch to another tab
- Then the data should be preserved when I return to the original tab
- And unsaved changes warning should work across all tabs

### Scenario 6: Responsive Design
- Given I am viewing the student form on different screen sizes
- When the viewport is mobile-sized
- Then tabs should remain functional and properly styled
- And tab content should be responsive within each tab panel

### Scenario 7: Edit Mode Data Loading
- Given I am editing an existing student
- When the form loads
- Then all tabs should be populated with the student's existing data
- And tabs with existing data should show appropriate visual indicators
- And the form should maintain the same tab behavior as create mode

## Development Tasks

### Phase 1: Core Tab Implementation
1. **Create TabbedStudentForm Component**
   - Create new component `TabbedStudentFormContent.tsx` in `src/domains/students/components/forms/`
   - Implement tabs using shadcn/ui Tabs components
   - Structure tabs: Student Information, Parent/Guardian Information, Financial Information
   - Import and organize existing form fields into appropriate tab content areas

2. **Implement Tab Content Components**
   - Create `StudentInformationTab.tsx` for basic student details (name, email, phone, status, DOB, POB, notes)
   - Create `ParentGuardianTab.tsx` for parent contact information
   - Create `FinancialInformationTab.tsx` for discount-related fields
   - Maintain existing form validation schema and field organization

3. **Update Tab Navigation Logic**
   - Implement active tab state management
   - Add tab switching functionality
   - Ensure form data persists across tab changes
   - Handle default tab selection (Student Information first)

### Phase 2: Visual Indicators and UX Enhancements
4. **Add Tab State Visual Indicators**
   - Implement error indicators in tab headers (red dot/icon for validation errors)
   - Add data indicators for tabs with content (yellow dot for populated fields)
   - Style active tab to match student profile page design
   - Apply consistent hover and focus states

5. **Error Handling and Auto-Navigation**
   - Auto-select tab with validation errors on form submission
   - Display error messages within the active tab content
   - Maintain error state indicators in tab headers
   - Ensure error clearing works properly when switching tabs

6. **Form Integration and Styling**
   - Apply consistent styling to match existing glass card design
   - Ensure tab content spacing and layout consistency
   - Maintain responsive design across all screen sizes
   - Style tab list to match the student profile page aesthetic

### Phase 3: Integration and Compatibility
7. **Update Form Wrapper Components**
   - Modify `StudentFormContent.tsx` to use new tabbed component
   - Maintain backward compatibility with existing `StudentForm.tsx`
   - Ensure proper integration with `StudentFormPage.tsx`
   - Test both create and edit modes

8. **Hook and State Management Updates**
   - Update `useStudentFormPage` hook if needed for tab state
   - Ensure unsaved changes warning works across tabs
   - Maintain existing form submission and cancellation logic
   - Test data persistence and validation across tab switches

### Phase 4: Testing and Polish
9. **Responsive Design and Accessibility**
   - Test tab functionality on mobile and tablet devices
   - Ensure keyboard navigation works properly
   - Verify screen reader compatibility
   - Test tab content scrolling behavior

10. **Integration Testing**
    - Test create new student flow with tabs
    - Test edit existing student flow with tabs
    - Verify form validation works across all tabs
    - Test unsaved changes warning functionality
    - Ensure consistent styling with student profile page

## Technical Considerations

### Component Architecture
- Leverage existing shadcn/ui Tabs components for consistency with student profile page
- Maintain current form validation using React Hook Form + Zod schema
- Preserve existing field components and styling patterns
- Keep form data structure unchanged for API compatibility

### State Management
- Tab state managed locally within the form component
- Form data continues to use React Hook Form's built-in state management
- Error states managed through existing validation patterns
- Unsaved changes detection works across all tabs

### Design Consistency
- Match tab styling from `StudentProfilePage.tsx` (tabs list and trigger styles)
- Use consistent glass card container styling
- Maintain existing field styling and spacing
- Apply same icon usage pattern (User, Phone, DollarSign icons in tab headers)

### Data Flow
- No changes to existing form submission or data persistence logic
- Tab content components receive form control props from parent
- Validation schema remains unchanged
- Form submission and cancellation behavior preserved

### Performance Considerations
- All tab content rendered simultaneously for seamless switching
- No lazy loading needed for this form size
- Existing form optimization patterns maintained
- Tab switching provides immediate feedback

## Definition of Done
- [ ] Three tabs implemented: Student Information, Parent/Guardian Information, Financial Information
- [ ] Tab styling matches student profile page design
- [ ] Visual indicators show tab states (errors, data presence)
- [ ] Form validation works across all tabs with auto-navigation to error tabs
- [ ] Data persists when switching between tabs
- [ ] Unsaved changes warning functions across all tabs
- [ ] Both create and edit modes work properly
- [ ] Responsive design maintains functionality on all screen sizes
- [ ] Accessibility standards met for keyboard navigation and screen readers
- [ ] Integration with existing StudentFormPage component seamless
- [ ] All existing functionality preserved (validation, submission, cancellation)
- [ ] Performance equivalent to or better than current accordion design