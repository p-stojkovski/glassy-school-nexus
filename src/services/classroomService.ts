
import { Classroom } from '../store/slices/classroomsSlice';

class ClassroomService {
  async getClassrooms(): Promise<Classroom[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: '1',
        name: 'Room A-101',
        location: 'Building A, First Floor',
        capacity: 30,
        status: 'active',
        createdDate: '2024-01-15',
        lastUpdated: '2024-01-15',
      },
      {
        id: '2',
        name: 'Room B-205',
        location: 'Building B, Second Floor',
        capacity: 25,
        status: 'active',
        createdDate: '2024-01-20',
        lastUpdated: '2024-01-20',
      },
      {
        id: '3',
        name: 'Lab C-301',
        location: 'Building C, Third Floor',
        capacity: 20,
        status: 'maintenance',
        createdDate: '2024-02-01',
        lastUpdated: '2024-02-01',
      },
      {
        id: '4',
        name: 'Auditorium',
        location: 'Main Building, Ground Floor',
        capacity: 150,
        status: 'active',
        createdDate: '2024-01-10',
        lastUpdated: '2024-01-10',
      },
    ];
  }

  async addClassroom(classroomData: Omit<Classroom, 'id' | 'createdDate' | 'lastUpdated'>): Promise<Classroom> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const now = new Date().toISOString().split('T')[0];
    return {
      ...classroomData,
      id: Date.now().toString(),
      createdDate: now,
      lastUpdated: now,
    };
  }

  async updateClassroom(classroomData: Classroom): Promise<Classroom> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      ...classroomData,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  }

  async deleteClassroom(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Simulate checking for linked classes
    console.log(`Deleting classroom ${id}`);
  }

  async checkClassroomUsage(id: string): Promise<{ hasUpcomingClasses: boolean; classCount: number }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate checking usage
    const hasUpcomingClasses = Math.random() > 0.7; // 30% chance of having classes
    const classCount = hasUpcomingClasses ? Math.floor(Math.random() * 5) + 1 : 0;
    
    return { hasUpcomingClasses, classCount };
  }
}

export default new ClassroomService();
