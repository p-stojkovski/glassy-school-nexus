# Student Table Kebab Menu Actions

## Overview
Replace the current individual action buttons (View, Edit, Delete) in the student management table with a vertical three-dot kebab menu to provide a cleaner, more space-efficient interface while maintaining all existing functionality.

## User Story
As a school administrator, I want the student table action buttons to be consolidated into a kebab menu so that the table appears less cluttered and I can perform the same actions (view, edit, delete) through an intuitive dropdown interface.

## User Journey
1. Administrator navigates to the Student Management page
2. Views the student table with kebab menu buttons in the Actions column
3. Clicks on the three-dot menu button for a specific student
4. Sees dropdown menu with "View Details", "Edit Student", and "Delete Student" options
5. Selects desired action from the menu
6. System performs the selected action (same behavior as current buttons)

## Acceptance Criteria

### Scenario 1: Kebab Menu Display
- Given I am on the Student Management page
- When I view the student table
- Then I should see a three-dot vertical menu button in the Actions column for each student
- And the current individual View/Edit/Delete buttons should be replaced

### Scenario 2: Menu Functionality
- Given I click on a kebab menu button for a student
- When the dropdown menu opens
- Then I should see three options: "View Details", "Edit Student", and "Delete Student"
- And each option should have appropriate icons (Eye, Edit, Trash)
- And the menu should be styled consistently with the app's glass theme

### Scenario 3: Action Execution
- Given the kebab menu is open for a student
- When I click on "View Details"
- Then the student profile page should open (same as current View button)
- When I click on "Edit Student" 
- Then the student edit form should open (same as current Edit button)
- When I click on "Delete Student"
- Then the delete confirmation dialog should appear (same as current Delete button)

### Scenario 4: Menu Interaction
- Given the kebab menu is open
- When I click outside the menu or press Escape
- Then the menu should close without performing any action
- And when I click on another kebab menu
- Then any previously open menu should close

### Scenario 5: Visual Consistency
- Given the kebab menu is implemented
- When I compare it with the private lessons kebab menu
- Then both should have consistent styling and behavior
- And the menu should follow the app's glass theme with proper transparency and borders

## Development Tasks

### Phase 1: Core Implementation
1. **Update StudentTable Component** - Replace action buttons with kebab menu using existing dropdown components
   - Import DropdownMenu components from shadcn/ui
   - Import MoreVertical icon from lucide-react
   - Replace the current action buttons section (lines 246-273) with kebab menu
   - Use same styling pattern as PrivateLessonCard component

2. **Implement Menu Items** - Create proper menu structure with icons
   - Add Eye icon for "View Details" action
   - Add Edit icon for "Edit Student" action  
   - Add Trash2 icon for "Delete Student" action
   - Apply appropriate color styling for each action type

3. **Style Menu for Glass Theme** - Ensure visual consistency with app design
   - Use glass theme colors: `bg-gray-900/95 border-white/20 text-white`
   - Apply proper hover states matching private lesson card pattern
   - Use red styling for delete action: `text-red-400 focus:text-red-300 focus:bg-red-500/10`

### Phase 2: Integration & Polish
1. **Menu Positioning** - Ensure proper alignment and accessibility
   - Set menu alignment to "end" to align with right side of table
   - Test menu positioning with different screen sizes
   - Ensure menu doesn't overflow viewport boundaries

2. **Keyboard Navigation** - Implement accessibility features
   - Ensure proper focus management
   - Test keyboard navigation through menu items
   - Verify screen reader compatibility

3. **Testing & Validation** - Verify functionality across scenarios
   - Test all three menu actions function identically to current buttons
   - Verify menu closes properly on outside clicks
   - Test responsive behavior on mobile devices
   - Validate consistent behavior with private lessons kebab menu

## Technical Considerations

### Integration Points
- **Existing Props**: The component already receives `onEdit`, `onDelete`, and `onView` callbacks - no prop changes needed
- **Icon Dependencies**: Need to import additional icons (Eye, Edit, Trash2) from lucide-react
- **Component Imports**: Import DropdownMenu components from existing shadcn/ui implementation

### Data Model Changes
- **No Backend Changes**: This is purely a UI enhancement, no data model changes required
- **Props Interface**: StudentTableProps interface remains unchanged

### Component Reuse Opportunities
- **Dropdown Components**: Leverage existing DropdownMenu, DropdownMenuContent, DropdownMenuItem, etc.
- **Icon System**: Use established lucide-react icon pattern
- **Styling Patterns**: Follow PrivateLessonCard kebab menu implementation as reference

### Performance and Accessibility
- **Performance**: Minimal impact as only changing UI components, not data handling
- **Accessibility**: DropdownMenu components are built on Radix UI primitives with built-in accessibility
- **Responsive Design**: Kebab menu is more mobile-friendly than multiple buttons
- **Visual Hierarchy**: Single menu button reduces visual clutter while maintaining functionality

### Code References
- **Pattern Reference**: `/src/domains/privateLessons/components/PrivateLessonCard.tsx` (lines 114-172)
- **Components**: `/src/components/ui/dropdown-menu.tsx`
- **Target File**: `/src/domains/students/components/list/StudentTable.tsx` (lines 246-273)

## Definition of Done
- [ ] Kebab menu replaces individual action buttons in student table
- [ ] All three actions (view, edit, delete) function identically to current implementation
- [ ] Menu styling matches glass theme and private lesson card pattern
- [ ] Menu positioning and accessibility work correctly
- [ ] Responsive design works on all screen sizes
- [ ] No breaking changes to existing component props or behavior
- [ ] Visual consistency maintained with existing app patterns