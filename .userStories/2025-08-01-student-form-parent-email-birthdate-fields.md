# Student Form Enhancement: Parent/Guardian Email and Student Birth Information

## Overview
Enhance the student registration and management system by adding two critical fields: parent/guardian email address and student date of birth with place of birth. This feature will improve parent communication capabilities and provide essential demographic information for academic records and compliance requirements.

## User Story
As a school administrator, I want to capture parent/guardian email addresses and student birth information (date and place) during student registration so that I can maintain complete student records, enable digital parent communication, and meet regulatory reporting requirements.

## User Journey
### Adding New Student
1. Administrator clicks "Add Student" button
2. Student form opens in side sheet
3. Administrator fills in existing required fields (name, enrollment status)
4. Administrator enters parent/guardian email in dedicated field
5. Administrator enters student's date of birth using date picker
6. Administrator enters student's place of birth in text field
7. Administrator completes remaining optional fields
8. Administrator clicks "Add Student" to save
9. System validates all fields and saves student with new information
10. Success message confirms student creation

### Editing Existing Student
1. Administrator selects student from table and clicks edit
2. Form opens pre-populated with existing data including new fields
3. Administrator updates parent/guardian email or birth information as needed
4. System validates changes and updates student record
5. Success message confirms updates

## Acceptance Criteria

### Scenario 1: Adding New Student with Complete Information
- Given I am on the student management page
- When I click "Add Student" button
- Then a form opens with all fields including:
  - Parent/Guardian Email (required field with email validation)
  - Date of Birth (required field with date picker)
  - Place of Birth (optional text field)
- And when I fill in all required fields with valid data
- And I click "Add Student"
- Then the student is created successfully
- And the new fields are saved to localStorage
- And I see a success toast notification

### Scenario 2: Form Validation for New Fields
- Given I am filling out the student form
- When I enter an invalid email format in Parent/Guardian Email field
- Then I see an error message "Invalid email format"
- And when I select a future date for Date of Birth
- Then I see an error message "Birth date cannot be in the future"
- And when I leave the required Parent/Guardian Email field empty
- Then I see an error message "Parent/Guardian email is required"
- And the form cannot be submitted until all validation errors are resolved

### Scenario 3: Editing Existing Student Data
- Given I have a student with existing parent contact information
- When I edit the student and access the new Parent/Guardian Email field
- Then the field should be empty (new field, no existing data)
- And when I update the Parent/Guardian Email field
- Then the change is saved successfully
- And the existing parentContact field remains unchanged for backward compatibility

### Scenario 4: Data Migration and Compatibility
- Given I have existing students with parentContact data in "Name - Phone" format
- When I view or edit these students
- Then the existing parentContact field remains intact
- And the new Parent/Guardian Email field is available for entry
- And both fields can coexist without data loss

### Scenario 5: Student Profile Display
- Given a student has parent email and birth information saved
- When I view the student's profile page
- Then I can see the parent/guardian email displayed
- And I can see the student's date of birth and place of birth
- And all information is properly formatted and accessible

## Development Tasks

### Phase 1: Data Model and Schema Updates
1. **Update Student Interface and Types**
   - Add `parentGuardianEmail: string` to Student interface in studentsSlice.ts
   - Add `dateOfBirth: string` to Student interface (ISO date format)
   - Add `placeOfBirth?: string` optional field to Student interface
   - Update all TypeScript types and selectors

2. **Update Mock Data Schema**
   - Add new fields to students.json mock data for consistency
   - Ensure MockDataService handles new fields properly
   - Update data validation in localStorage persistence

3. **Form Schema and Validation**
   - Update Zod schema in StudentForm.tsx to include:
     - `parentGuardianEmail: z.string().email().min(1, "Parent/Guardian email is required")`
     - `dateOfBirth: z.string().min(1, "Date of birth is required").refine((date) => new Date(date) <= new Date(), "Birth date cannot be in the future")`
     - `placeOfBirth: z.string().optional()`

### Phase 2: Form UI Implementation
1. **Add Parent/Guardian Email Field**
   - Add FormField component for parent/guardian email
   - Position between existing parentContact and notes fields
   - Use email input type with appropriate validation styling
   - Add clear label and placeholder text

2. **Add Date of Birth Field**
   - Implement date picker using shadcn/ui date picker component
   - Add proper date validation and formatting
   - Position logically in form layout (after personal info, before contact)
   - Handle edge cases (invalid dates, future dates)

3. **Add Place of Birth Field**
   - Add text input field for place of birth
   - Position after date of birth field
   - Make field optional with appropriate placeholder
   - Consider character limits for data consistency

4. **Form Layout and UX**
   - Reorganize form fields in logical groups:
     - Personal Info: Name, Date of Birth, Place of Birth
     - Contact Info: Email, Phone
     - Parent/Guardian Info: Parent Contact, Parent/Guardian Email
     - Administrative: Status, Notes
   - Ensure responsive design on mobile devices
   - Maintain consistent styling with existing form elements

### Phase 3: Integration and Data Handling
1. **Update Form Submission Logic**
   - Modify useStudentForm hook to handle new fields
   - Update both add and update student operations
   - Ensure proper data transformation and persistence
   - Add error handling for new field validation

2. **Update Student Profile Display**
   - Add parent/guardian email to student profile page
   - Display date of birth with proper formatting
   - Show place of birth if available
   - Ensure information is clearly organized and accessible

3. **Update Student Table and Lists**
   - Consider adding birth date column option
   - Update student information tooltips/details
   - Ensure search functionality works with new fields
   - Maintain table performance with additional data

### Phase 4: Testing and Quality Assurance
1. **Form Validation Testing**
   - Test email validation with various formats
   - Test date validation with edge cases
   - Test required field enforcement
   - Test form submission with partial data

2. **Data Persistence Testing**
   - Verify localStorage saves new fields correctly
   - Test data retrieval and form pre-population
   - Ensure backward compatibility with existing data
   - Test demo data reset functionality

3. **UI/UX Testing**
   - Test responsive design across screen sizes
   - Verify form accessibility with screen readers
   - Test keyboard navigation and focus management
   - Ensure consistent styling and user experience

## Technical Considerations

### Data Migration Strategy
- New fields will be optional during transition period
- Existing students will have empty values for new fields until updated
- No data migration script needed - fields populate as users edit records
- Maintain backward compatibility with existing parentContact field

### Form Performance
- Date picker component may impact form load time
- Consider lazy loading for date picker if performance issues arise
- Maintain form validation performance with additional fields
- Test with large datasets in localStorage

### Validation Requirements
- Email validation must handle international email formats
- Date validation should prevent clearly invalid dates (future dates, dates before 1900)
- Place of birth should accept international location formats
- Consider maximum character limits for data consistency

### Accessibility Requirements
- Date picker must be keyboard accessible
- All form fields need proper ARIA labels
- Error messages must be announced by screen readers
- Form must work without JavaScript for basic functionality

### Mobile Considerations
- Date picker must work well on mobile devices
- Form layout should adapt to smaller screens
- Touch targets must meet accessibility guidelines
- Consider native date input fallback for mobile browsers

## Integration Points

### Existing Components
- StudentForm.tsx - Primary integration point for new fields
- Student interface in studentsSlice.ts - Data model updates needed
- useStudentForm.ts hook - Form logic updates required
- StudentProfile page - Display integration needed

### Data Storage
- localStorage via MockDataService - Schema updates needed
- Redux store - State management updates required
- Mock data files - Sample data updates for consistency

### External Dependencies
- React Hook Form - Form state management for new fields
- Zod validation - Schema validation for new field types
- shadcn/ui date picker - Date selection component needed
- Existing styling system - Maintain design consistency

## Definition of Done
- [ ] Parent/Guardian Email field added with email validation
- [ ] Date of Birth field added with date picker and validation
- [ ] Place of Birth optional field added
- [ ] Form validation prevents invalid email formats and future birth dates
- [ ] All new fields save to localStorage correctly
- [ ] Student profile displays new information appropriately
- [ ] Form maintains responsive design across all screen sizes
- [ ] Accessibility requirements met for all new form elements
- [ ] Existing student data remains intact and functional
- [ ] Demo mode works correctly with new fields
- [ ] Success/error messaging works for all new field scenarios
- [ ] Code follows existing patterns and TypeScript standards