
import { Class } from '../store/slices/classesSlice';

class ClassService {
  async getClasses(): Promise<Class[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: '1',
        name: 'Mathematics Advanced',
        teacher: {
          id: '1',
          name: 'Dr. Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        },
        room: 'Room 101',
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '10:30' },
          { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
          { day: 'Friday', startTime: '09:00', endTime: '10:30' },
        ],
        status: 'active',
        studentCount: 28,
        color: '#3B82F6',
      },
      {
        id: '2',
        name: 'Physics Laboratory',
        teacher: {
          id: '2',
          name: 'Prof. Michael Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        },
        room: 'Lab 205',
        schedule: [
          { day: 'Tuesday', startTime: '14:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '14:00', endTime: '16:00' },
        ],
        status: 'active',
        studentCount: 24,
        color: '#10B981',
      },
      {
        id: '3',
        name: 'English Literature',
        teacher: {
          id: '3',
          name: 'Ms. Emily Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        },
        room: 'Room 302',
        schedule: [
          { day: 'Monday', startTime: '11:00', endTime: '12:30' },
          { day: 'Wednesday', startTime: '11:00', endTime: '12:30' },
        ],
        status: 'active',
        studentCount: 32,
        color: '#8B5CF6',
      },
    ];
  }

  async addClass(classData: Omit<Class, 'id'>): Promise<Class> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      ...classData,
      id: Date.now().toString(),
    };
  }

  async updateClass(classData: Class): Promise<Class> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return classData;
  }

  async deleteClass(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
  }
}

export default new ClassService();
