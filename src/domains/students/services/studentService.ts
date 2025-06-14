
import { Student } from '../studentsSlice';

class StudentService {
  async getStudents(): Promise<Student[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        classId: '1',
        status: 'active',
        joinDate: '2024-01-15',
        parentContact: '+1 (555) 123-4568',
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob.smith@email.com',
        phone: '+1 (555) 234-5678',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        classId: '1',
        status: 'active',
        joinDate: '2024-01-20',
        parentContact: '+1 (555) 234-5679',
      },
      {
        id: '3',
        name: 'Carol Williams',
        email: 'carol.williams@email.com',
        phone: '+1 (555) 345-6789',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        classId: '2',
        status: 'active',
        joinDate: '2024-02-01',
        parentContact: '+1 (555) 345-6790',
      },
    ];
  }

  async addStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      ...studentData,
      id: Date.now().toString(),
    };
  }

  async updateStudent(studentData: Student): Promise<Student> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return studentData;
  }

  async deleteStudent(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
  }
}

export default new StudentService();
