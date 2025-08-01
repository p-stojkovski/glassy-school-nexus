# Student Form Field Organization into Sections

## Overview
Reorganize the student form fields in the sidebar into logical sections to better separate student and parent information, improving form visibility, accessibility, and user experience during student registration and editing processes.

## User Story
As a school administrator, I want the student form fields organized into clear sections (Student Information and Parent/Guardian Information) so that I can efficiently navigate and complete student registration with better visual organization and reduced cognitive load.

## User Journey
1. **Form Access**: Administrator clicks "Add Student" or "Edit Student" to open the sidebar form
2. **Section Navigation**: Form displays two collapsible sections:
   - Student Information (expanded by default)
   - Parent/Guardian Information (collapsed by default for new students, expanded if data exists)
3. **Field Completion**: Administrator fills out fields within each section
4. **Section Management**: Administrator can collapse/expand sections as needed during data entry
5. **Form Submission**: All fields across sections are validated and submitted together

## Acceptance Criteria

### Scenario 1: Adding New Student with Sectioned Form
- Given I am on the Student Management page
- When I click "Add Student" to open the form sidebar
- Then I should see the form organized into two distinct sections:
  - "Student Information" section (expanded by default)
  - "Parent/Guardian Information" section (collapsed by default)
- And each section should have a clear header with expand/collapse functionality
- And the Student Information section should contain: Name, Email, Phone, Status, Date of Birth, Place of Birth, Notes
- And the Parent/Guardian Information section should contain: Parent Contact, Parent Email

### Scenario 2: Editing Existing Student with Pre-filled Data
- Given I am editing an existing student with parent information
- When the form sidebar opens
- Then both sections should be expanded by default since data exists
- And all existing field values should be properly populated in their respective sections
- And I should be able to collapse either section to focus on specific information

### Scenario 3: Section Accessibility and Navigation
- Given the sectioned student form is open
- When I interact with section headers
- Then I should be able to expand/collapse sections using keyboard navigation (Enter/Space)
- And section headers should have proper ARIA labels for screen readers
- And collapsed sections should show a visual indicator of contained data if fields have values

### Scenario 4: Form Validation Across Sections
- Given I have partially completed fields across both sections
- When I attempt to submit the form with missing required fields
- Then validation errors should appear in their respective sections
- And if a section is collapsed with validation errors, it should automatically expand
- And the first field with an error should receive focus

### Scenario 5: Responsive Design on Mobile
- Given I am using the form on a mobile device
- When the sidebar opens with sectioned content
- Then sections should remain properly organized and functional
- And section headers should be touch-friendly with adequate spacing
- And the form should maintain scrollability within the sidebar

## Development Tasks

### Phase 1: Core Section Implementation
1. **Create Section Component Structure**
   - Create reusable `FormSection` component with collapsible functionality
   - Implement section header with expand/collapse icon and accessibility features
   - Add smooth transition animations for expand/collapse actions
   - Ensure component works with the existing gradient sidebar styling

2. **Refactor StudentForm Component**
   - Organize existing form fields into logical groupings
   - Wrap field groups in FormSection components
   - Implement section state management (expanded/collapsed)
   - Maintain existing form validation and submission logic

3. **Student Information Section Implementation**
   - Group fields: name, email, phone, status, dateOfBirth, placeOfBirth, notes
   - Set as expanded by default for new students
   - Ensure proper field spacing and visual hierarchy within section

4. **Parent/Guardian Information Section Implementation**
   - Group fields: parentContact, parentEmail
   - Set as collapsed by default for new students, expanded if editing existing student with parent data
   - Maintain required field validation for parentEmail

### Phase 2: Enhanced UX and Accessibility
1. **Accessibility Enhancements**
   - Add proper ARIA labels and roles for section headers and content
   - Implement keyboard navigation support (Tab, Enter, Space)
   - Ensure screen reader compatibility with section state announcements
   - Add focus management when sections expand/collapse

2. **Visual Indicators and Polish**
   - Add visual indicators on collapsed sections when they contain data
   - Implement smooth animations consistent with existing app design
   - Add section icons for visual identification
   - Ensure consistent spacing and alignment with existing form styling

3. **Smart Section Behavior**
   - Auto-expand sections with validation errors during form submission
   - Persist section state in component state during form session
   - Add subtle visual feedback for section interactions
   - Implement proper focus management after section state changes

### Phase 3: Integration and Testing
1. **Form Integration Testing**
   - Verify all existing form functionality remains intact
   - Test form submission with fields across multiple sections
   - Validate proper error handling and display across sections
   - Ensure proper integration with existing useStudentForm hook

2. **Component Reusability Setup**
   - Design FormSection component for potential reuse in other domain forms
   - Document component API and usage patterns
   - Consider extraction to common components if beneficial
   - Plan for potential use in teacher, class, or other entity forms

## Technical Considerations

### Component Architecture
- **FormSection Component**: Reusable collapsible section with header and content area
- **State Management**: Use React useState for section expand/collapse state
- **Integration**: Maintain compatibility with existing React Hook Form and Zod validation
- **Styling**: Consistent with existing gradient sidebar and form field styling

### Data Flow
- Form data structure remains unchanged - only UI organization changes
- Validation logic continues to work across all fields regardless of section
- Section state is UI-only and doesn't affect data persistence

### Accessibility Compliance
- WCAG 2.1 AA compliance for keyboard navigation and screen readers
- Proper semantic HTML structure with headings and regions
- Focus management for enhanced keyboard navigation experience

### Performance Considerations
- Lightweight section components with minimal re-renders
- Efficient expand/collapse animations using CSS transforms
- No impact on existing form performance characteristics

## Definition of Done
- [ ] StudentForm displays fields organized into two logical sections
- [ ] Sections are collapsible with smooth expand/collapse animations
- [ ] Student Information section expands by default, Parent section behavior depends on context
- [ ] All existing form validation and submission functionality works unchanged
- [ ] Sections auto-expand when containing validation errors
- [ ] Component meets accessibility standards with proper ARIA labels and keyboard navigation
- [ ] Form maintains responsive design across all screen sizes
- [ ] Visual styling consistent with existing app design patterns
- [ ] No breaking changes to existing student management workflow
- [ ] Form performance remains optimal with section functionality added

## Files to Modify
- `/src/domains/students/components/forms/StudentForm.tsx` - Main form refactoring
- Create new component: `/src/components/common/FormSection.tsx` - Reusable section component

## Future Considerations
- Potential application of sectioned forms to other domain entities (teachers, classes)
- Enhanced section features like progress indicators or field count summaries
- User preferences for default section states
- Additional sections for future student data expansion (academic history, medical information, etc.)