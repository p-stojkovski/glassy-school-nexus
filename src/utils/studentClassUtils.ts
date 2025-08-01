interface Student {
  id: string;
  classId?: string;
  [key: string]: any;
}

interface Class {
  id: string;
  name: string;
  level?: string;
  subject?: string;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  [key: string]: any;
}

/**
 * Finds the class associated with a specific student
 * @param studentId The ID of the student
 * @param classes Array of all available classes
 * @param students Array of all students (optional, for validation)
 * @returns The class object if found, null otherwise
 */
export function getClassForStudent(
  studentId: string, 
  classes: Class[], 
  students?: Student[]
): Class | null {
  if (!studentId || !classes || classes.length === 0) {
    return null;
  }

  // If students array is provided, find the student first
  if (students) {
    const student = students.find(s => s.id === studentId);
    if (!student || !student.classId) {
      return null;
    }
    return classes.find(c => c.id === student.classId) || null;
  }

  // Fallback: check if student is in any class's studentIds
  return classes.find(c => 
    c.studentIds && c.studentIds.includes(studentId)
  ) || null;
}

/**
 * Gets all students enrolled in a specific class
 * @param classId The ID of the class
 * @param students Array of all students
 * @returns Array of students in the class
 */
export function getStudentsForClass(classId: string, students: Student[]): Student[] {
  if (!classId || !students || students.length === 0) {
    return [];
  }

  return students.filter(student => student.classId === classId);
}

/**
 * Validates that student-class assignments are consistent
 * @param students Array of all students
 * @param classes Array of all classes
 * @returns Object with validation results and issues found
 */
export function validateClassAssignments(
  students: Student[], 
  classes: Class[]
): {
  isValid: boolean;
  issues: string[];
  orphanedStudents: Student[];
  inconsistentAssignments: Array<{ student: Student; issue: string }>;
} {
  const issues: string[] = [];
  const orphanedStudents: Student[] = [];
  const inconsistentAssignments: Array<{ student: Student; issue: string }> = [];

  // Check for students with invalid classId references
  students.forEach(student => {
    if (student.classId) {
      const classExists = classes.find(c => c.id === student.classId);
      if (!classExists) {
        orphanedStudents.push(student);
        issues.push(`Student ${student.name} (${student.id}) references non-existent class ${student.classId}`);
      } else {
        // Check if the class's studentIds includes this student
        if (classExists.studentIds && !classExists.studentIds.includes(student.id)) {
          inconsistentAssignments.push({
            student,
            issue: `Student assigned to class ${student.classId} but not in class's studentIds`
          });
          issues.push(`Inconsistent assignment: Student ${student.name} not in class ${classExists.name}'s student list`);
        }
      }
    }
  });

  // Check for classes with studentIds that don't exist
  classes.forEach(classItem => {
    if (classItem.studentIds) {
      classItem.studentIds.forEach(studentId => {
        const studentExists = students.find(s => s.id === studentId);
        if (!studentExists) {
          issues.push(`Class ${classItem.name} references non-existent student ${studentId}`);
        }
      });
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    orphanedStudents,
    inconsistentAssignments
  };
}

/**
 * Gets a formatted display name for a class
 * @param classItem The class object
 * @returns Formatted class name with level if available
 */
export function getClassDisplayName(classItem: Class | null): string {
  if (!classItem) {
    return 'No Class';
  }

  if (classItem.level) {
    return `${classItem.name} (${classItem.level})`;
  }

  return classItem.name;
}

/**
 * Checks if a student is enrolled in any class
 * @param studentId The ID of the student
 * @param classes Array of all classes
 * @param students Array of all students (optional)
 * @returns True if student is enrolled, false otherwise
 */
export function isStudentEnrolled(
  studentId: string, 
  classes: Class[], 
  students?: Student[]
): boolean {
  return getClassForStudent(studentId, classes, students) !== null;
}

/**
 * Groups students by their class assignments
 * @param students Array of all students
 * @param classes Array of all classes
 * @returns Map of classId to array of students
 */
export function groupStudentsByClass(
  students: Student[], 
  classes: Class[]
): Map<string, Student[]> {
  const grouped = new Map<string, Student[]>();
  
  // Initialize with all classes
  classes.forEach(classItem => {
    grouped.set(classItem.id, []);
  });
  
  // Add unassigned category
  grouped.set('unassigned', []);

  // Group students
  students.forEach(student => {
    if (student.classId && grouped.has(student.classId)) {
      grouped.get(student.classId)!.push(student);
    } else {
      grouped.get('unassigned')!.push(student);
    }
  });

  return grouped;
}

// Import the DiscountType enum for type safety
import { DiscountType } from '@/types/enums';

/**
 * Format discount type for display
 */
export const formatDiscountType = (discountType: DiscountType): string => {
  switch (discountType) {
    case DiscountType.Relatives:
      return 'Relatives';
    case DiscountType.SocialCase:
      return 'Social Case';
    case DiscountType.SingleParent:
      return 'Single Parent';
    case DiscountType.FreeOfCharge:
      return 'Free of Charge';
    default:
      return 'Unknown';
  }
};

/**
 * Format discount information for display
 */
export const formatDiscountInfo = (discountType?: DiscountType, discountAmount?: number): string => {
  if (!discountType) return 'No discount';
  
  const typeLabel = formatDiscountType(discountType);
  
  if (discountType === DiscountType.FreeOfCharge) {
    return typeLabel;
  }
  
  if (discountAmount && discountAmount > 0) {
    return `${typeLabel} (${discountAmount} MKD)`;
  }
  
  return typeLabel;
};