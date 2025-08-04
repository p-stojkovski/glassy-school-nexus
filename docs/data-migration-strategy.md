# Data Migration Strategy

## Overview

This document outlines the comprehensive strategy for migrating data from the current localStorage-based MockDataService to the PostgreSQL backend database. The migration must ensure zero data loss, minimal downtime, and seamless user experience during the transition.

## Current State Analysis

### Data Storage Patterns

#### MockDataService (Primary)
- **Domains**: students, teachers, classes, classrooms, attendance
- **Storage**: localStorage with JSON serialization
- **Caching**: In-memory singleton with lazy loading
- **Validation**: Structure validation before save/load
- **Backup**: Export/import JSON capabilities

#### Direct localStorage (Legacy)
- **Domains**: grades, private lessons
- **Storage**: Direct localStorage keys
- **Validation**: Basic JSON parse/stringify
- **Issues**: Inconsistent patterns, potential data corruption

#### In-Memory Only
- **Domains**: auth (demo user)
- **Storage**: Redux state only
- **Persistence**: None (resets on page refresh)

### Data Volume Estimates
Based on demo data analysis:
- **Students**: ~50-100 records per school
- **Teachers**: ~10-20 records per school
- **Classes**: ~15-30 records per school
- **Classrooms**: ~10-15 records per school
- **Payment Obligations**: ~200-500 records per school
- **Payments**: ~100-300 records per school
- **Attendance Records**: ~2000-5000 records per school
- **Grades**: ~1000-3000 records per school
- **Private Lessons**: ~50-200 records per school

## Migration Strategy Overview

### Three-Phase Approach

1. **Phase 1**: Parallel Operation (Dual Write)
2. **Phase 2**: Data Synchronization & Validation
3. **Phase 3**: Complete Cutover

### Migration Principles

- **Zero Data Loss**: All existing data must be preserved
- **Minimal Downtime**: System remains operational throughout migration
- **Rollback Capability**: Ability to revert at any stage
- **Data Integrity**: Referential integrity maintained
- **User Transparency**: Users experience minimal disruption

## Detailed Migration Plan

### Pre-Migration Phase (1 week)

#### 1. Data Audit & Backup
```typescript
// Data audit script
async function auditLocalStorageData(): Promise<DataAuditReport> {
  const report: DataAuditReport = {
    domains: {},
    totalRecords: 0,
    dataIntegrity: {
      orphanedReferences: [],
      missingReferences: [],
      duplicateIds: [],
      corruptedRecords: []
    },
    storageSize: 0
  };

  // Audit each domain
  for (const domain of DOMAINS) {
    const data = await mockDataService.loadDomainData(domain);
    report.domains[domain] = {
      recordCount: Array.isArray(data) ? data.length : 0,
      lastModified: getLastModified(domain),
      dataHealth: validateDataStructure(data)
    };
  }

  return report;
}
```

#### 2. Reference Integrity Check
- Validate all foreign key relationships
- Identify orphaned records
- Check for circular references
- Document data inconsistencies

#### 3. Backup Creation
- Export complete localStorage data
- Create timestamped backup files
- Verify backup integrity
- Store backups in multiple locations

### Phase 1: Parallel Operation (2-3 weeks)

#### 1.1 Backend API Implementation
- Deploy PostgreSQL database with full schema
- Implement all required API endpoints
- Setup authentication and authorization
- Configure monitoring and logging

#### 1.2 Data Adapter Layer
```typescript
interface DataAdapter {
  // Read operations - try API first, fallback to localStorage
  getStudents(options?: QueryOptions): Promise<Student[]>;
  getStudent(id: string): Promise<Student | null>;
  
  // Write operations - dual write to both systems
  createStudent(data: CreateStudentRequest): Promise<Student>;
  updateStudent(id: string, data: UpdateStudentRequest): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
}

class HybridDataAdapter implements DataAdapter {
  private apiClient: ApiClient;
  private localService: MockDataService;
  private migrationMode: 'localStorage' | 'hybrid' | 'api' = 'hybrid';

  async getStudents(options?: QueryOptions): Promise<Student[]> {
    try {
      // Try API first
      if (this.migrationMode !== 'localStorage') {
        return await this.apiClient.getStudents(options);
      }
    } catch (error) {
      console.warn('API failed, falling back to localStorage:', error);
    }
    
    // Fallback to localStorage
    return await this.localService.loadDomainData('students');
  }

  async createStudent(data: CreateStudentRequest): Promise<Student> {
    let apiResult: Student | null = null;
    let localResult: Student | null = null;

    // Try API first
    try {
      if (this.migrationMode !== 'localStorage') {
        apiResult = await this.apiClient.createStudent(data);
      }
    } catch (error) {
      console.error('API create failed:', error);
      // Continue with localStorage to maintain functionality
    }

    // Always write to localStorage during hybrid mode
    try {
      const studentData = apiResult || this.convertToLocalFormat(data);
      localResult = await this.localService.createStudent(studentData);
    } catch (error) {
      console.error('localStorage create failed:', error);
      // If API succeeded but localStorage failed, log for manual sync
      if (apiResult) {
        this.logSyncIssue('create', 'student', apiResult.id, error);
      }
      throw error;
    }

    return apiResult || localResult!;
  }
}
```

#### 1.3 Frontend Integration
- Update Redux slices to use DataAdapter
- Implement error handling and fallback logic
- Add migration status indicators
- Create manual sync capabilities

### Phase 2: Data Synchronization (1-2 weeks)

#### 2.1 Initial Data Migration Script
```sql
-- PostgreSQL migration script
WITH migrated_users AS (
  INSERT INTO users (id, name, email, role, avatar_url, created_at, updated_at)
  SELECT 
    gen_random_uuid(),
    json_data->>'name',
    json_data->>'email',
    CASE 
      WHEN json_data->>'role' = 'admin' THEN 'admin'
      WHEN json_data->>'role' = 'teacher' THEN 'teacher'
      ELSE 'student'
    END,
    json_data->>'avatar',
    COALESCE((json_data->>'createdAt')::timestamptz, NOW()),
    COALESCE((json_data->>'updatedAt')::timestamptz, NOW())
  FROM json_array_elements(@json_students) AS json_data
  RETURNING id, email
),
migrated_students AS (
  INSERT INTO students (
    id, user_id, phone, class_id, status, join_date, date_of_birth,
    place_of_birth, address, parent_name, parent_email, parent_phone,
    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
    academic_level, gpa, enrollment_date, has_discount, discount_type, discount_amount,
    created_at, updated_at
  )
  SELECT 
    (json_data->>'id')::uuid,
    u.id,
    json_data->>'phone',
    (json_data->>'classId')::uuid,
    COALESCE(json_data->>'status', 'active'),
    (json_data->>'joinDate')::date,
    (json_data->>'dateOfBirth')::date,
    json_data->>'placeOfBirth',
    json_data->>'address',
    json_data->'emergencyContact'->>'name',
    json_data->>'parentEmail',
    json_data->>'parentContact',
    json_data->'emergencyContact'->>'name',
    json_data->'emergencyContact'->>'relationship',
    json_data->'emergencyContact'->>'phone',
    json_data->'academicInfo'->>'level',
    (json_data->'academicInfo'->>'gpa')::decimal,
    (json_data->'academicInfo'->>'enrollmentDate')::date,
    (json_data->>'hasDiscount')::boolean,
    json_data->>'discountType',
    (json_data->>'discountAmount')::decimal,
    COALESCE((json_data->>'createdAt')::timestamptz, NOW()),
    NOW()
  FROM json_array_elements(@json_students) AS json_data
  JOIN migrated_users u ON u.email = json_data->>'email'
  RETURNING id
)
SELECT COUNT(*) as migrated_count FROM migrated_students;
```

#### 2.2 Incremental Synchronization
- Identify changes since last sync
- Apply delta updates to database
- Handle conflict resolution
- Validate data consistency

#### 2.3 Data Validation & Integrity Checks
```typescript
interface DataValidationResult {
  domain: string;
  totalRecords: number;
  validRecords: number;
  issues: DataIssue[];
  integrityChecks: IntegrityCheckResult[];
}

async function validateMigratedData(): Promise<DataValidationResult[]> {
  const results: DataValidationResult[] = [];

  for (const domain of DOMAINS) {
    const localData = await mockDataService.loadDomainData(domain);
    const apiData = await apiClient.getDomainData(domain);
    
    const result = {
      domain,
      totalRecords: localData.length,
      validRecords: 0,
      issues: [],
      integrityChecks: []
    };

    // Compare record counts
    if (localData.length !== apiData.length) {
      result.issues.push({
        type: 'count_mismatch',
        message: `Local: ${localData.length}, API: ${apiData.length}`
      });
    }

    // Validate each record
    for (const localRecord of localData) {
      const apiRecord = apiData.find(r => r.id === localRecord.id);
      
      if (!apiRecord) {
        result.issues.push({
          type: 'missing_record',
          recordId: localRecord.id,
          message: 'Record exists locally but not in API'
        });
        continue;
      }

      const fieldComparison = compareRecords(localRecord, apiRecord);
      if (fieldComparison.differences.length > 0) {
        result.issues.push({
          type: 'data_mismatch',
          recordId: localRecord.id,
          differences: fieldComparison.differences
        });
      } else {
        result.validRecords++;
      }
    }

    results.push(result);
  }

  return results;
}
```

### Phase 3: Complete Cutover (1 week)

#### 3.1 Final Synchronization
- Perform final data sync
- Validate all data integrity
- Resolve any remaining conflicts
- Create final backup point

#### 3.2 System Cutover
```typescript
class MigrationManager {
  private currentMode: MigrationMode = 'hybrid';

  async performCutover(): Promise<CutoverResult> {
    try {
      // 1. Stop accepting new writes temporarily
      await this.setMaintenanceMode(true);
      
      // 2. Perform final sync
      const syncResult = await this.performFinalSync();
      if (!syncResult.success) {
        throw new Error('Final sync failed: ' + syncResult.error);
      }

      // 3. Validate data integrity
      const validationResult = await this.validateAllData();
      if (validationResult.criticalIssues.length > 0) {
        throw new Error('Critical data issues found');
      }

      // 4. Switch to API-only mode
      await this.setMigrationMode('api');
      
      // 5. Test system functionality
      const healthCheck = await this.performHealthCheck();
      if (!healthCheck.success) {
        // Rollback
        await this.setMigrationMode('hybrid');
        throw new Error('Health check failed after cutover');
      }

      // 6. Clean up localStorage (optional)
      await this.cleanupLocalStorage();

      // 7. Resume normal operations
      await this.setMaintenanceMode(false);

      return {
        success: true,
        migratedRecords: syncResult.totalRecords,
        completedAt: new Date(),
        issues: validationResult.nonCriticalIssues
      };

    } catch (error) {
      // Rollback procedures
      await this.rollbackCutover();
      throw error;
    }
  }

  private async rollbackCutover(): Promise<void> {
    try {
      await this.setMigrationMode('localStorage');
      await this.setMaintenanceMode(false);
      console.log('Rollback completed successfully');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
      // Emergency procedures
      await this.initiateEmergencyRecovery();
    }
  }
}
```

#### 3.3 Post-Cutover Validation
- Comprehensive system testing
- User acceptance testing
- Performance validation
- Data consistency verification

## Data Transformation Logic

### Student Data Transformation
```typescript
interface LocalStorageStudent {
  id: string;
  name: string;
  email: string;
  // ... other localStorage format fields
}

interface ApiStudent {
  id: string;
  userId: string;
  name: string;
  email: string;
  // ... other API format fields
}

class StudentDataTransformer {
  transformToApi(localStudent: LocalStorageStudent): CreateStudentRequest {
    return {
      // User information
      user: {
        name: localStudent.name,
        email: localStudent.email,
        role: 'student',
        avatarUrl: localStudent.avatar
      },
      
      // Student-specific information
      phone: localStudent.phone,
      classId: localStudent.classId ? this.convertId(localStudent.classId) : null,
      status: localStudent.status || 'active',
      joinDate: this.parseDate(localStudent.joinDate),
      dateOfBirth: this.parseDate(localStudent.dateOfBirth),
      placeOfBirth: localStudent.placeOfBirth,
      address: localStudent.address,
      
      // Parent information
      parentInfo: {
        name: this.extractParentName(localStudent.parentContact),
        email: localStudent.parentEmail,
        phone: this.extractParentPhone(localStudent.parentContact)
      },
      
      // Emergency contact
      emergencyContact: localStudent.emergencyContact ? {
        name: localStudent.emergencyContact.name,
        relationship: localStudent.emergencyContact.relationship,
        phone: localStudent.emergencyContact.phone
      } : null,
      
      // Academic information
      academicInfo: localStudent.academicInfo ? {
        level: localStudent.academicInfo.level,
        gpa: localStudent.academicInfo.gpa,
        enrollmentDate: this.parseDate(localStudent.academicInfo.enrollmentDate)
      } : null,
      
      // Discount information
      discountInfo: {
        hasDiscount: localStudent.hasDiscount || false,
        type: localStudent.discountType,
        amount: localStudent.discountAmount
      }
    };
  }

  transformFromApi(apiStudent: ApiStudent): LocalStorageStudent {
    // Reverse transformation for backward compatibility
    return {
      id: apiStudent.id,
      name: apiStudent.name,
      email: apiStudent.email,
      // ... map all fields back to localStorage format
    };
  }
}
```

## Error Handling & Recovery

### Error Categories

#### 1. Transient Errors
- Network connectivity issues
- Database connection timeouts
- Temporary API unavailability

**Recovery Strategy**:
- Retry with exponential backoff
- Queue operations for later execution
- Maintain localStorage as fallback

#### 2. Data Consistency Errors
- Duplicate records
- Missing foreign key references
- Data format mismatches

**Recovery Strategy**:
- Conflict resolution algorithms
- Manual review and correction
- Data repair scripts

#### 3. Critical System Errors
- Database corruption
- Complete API failure
- Security breaches

**Recovery Strategy**:
- Immediate rollback to localStorage
- Emergency recovery procedures
- Data restoration from backups

### Recovery Procedures

#### Automatic Recovery
```typescript
class AutoRecoveryManager {
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // ms

  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    context: string
  ): Promise<T> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed for ${context}:`, error);
        
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelays[attempt]);
          continue;
        }
        
        // Final attempt failed, use fallback
        console.error(`All attempts failed for ${context}, using fallback`);
        return await fallback();
      }
    }
    
    throw new Error('This should never be reached');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### Manual Recovery Tools
- Data comparison utilities
- Conflict resolution interfaces
- Manual sync triggers
- Data repair scripts

## Monitoring & Observability

### Migration Metrics
- **Records Migrated**: Count by domain and timestamp
- **Error Rates**: Categorized by error type and severity
- **Performance Metrics**: Migration speed, API response times
- **Data Consistency**: Validation pass/fail rates
- **User Impact**: Error reports, support tickets

### Monitoring Dashboard
```typescript
interface MigrationMetrics {
  overview: {
    totalRecords: number;
    migratedRecords: number;
    failedRecords: number;
    migrationProgress: number; // percentage
  };
  
  byDomain: Record<string, {
    total: number;
    migrated: number;
    failed: number;
    lastSyncTime: Date;
  }>;
  
  errorSummary: {
    criticalErrors: number;
    warnings: number;
    transientErrors: number;
    resolvedErrors: number;
  };
  
  performance: {
    avgMigrationSpeed: number; // records per minute
    apiResponseTime: number; // ms
    syncOperationTime: number; // ms
  };
}
```

### Alerting Rules
- **Critical**: Data loss detected, system unavailable
- **Warning**: High error rate, slow performance
- **Info**: Migration milestones, sync completion

## Testing Strategy

### Unit Tests
- Data transformation functions
- Error handling logic
- Validation algorithms
- Recovery procedures

### Integration Tests
- End-to-end migration workflows
- API compatibility
- Data consistency validation
- Rollback procedures

### User Acceptance Tests
- Frontend functionality unchanged
- Performance acceptable
- Data accuracy verified
- User workflows functional

## Communication Plan

### Stakeholder Updates
- **Daily**: Progress reports during active migration
- **Weekly**: Status summaries during preparation
- **Immediate**: Critical issue notifications
- **Post-Migration**: Final report and lessons learned

### User Communication
- **Pre-Migration**: Feature announcement, timeline
- **During Migration**: Status updates, any temporary limitations
- **Post-Migration**: Completion notification, new features available

## Success Criteria

### Technical Success
- [ ] 100% data migration with zero loss
- [ ] All functional tests passing
- [ ] Performance metrics within acceptable ranges
- [ ] Security validation complete
- [ ] Rollback capability tested and verified

### Business Success
- [ ] No user-reported data inconsistencies
- [ ] System availability > 99.9% during migration
- [ ] User workflows unchanged or improved
- [ ] Support ticket volume normal or decreased
- [ ] Stakeholder approval for go-live

### Post-Migration Goals
- [ ] localStorage cleanup completed
- [ ] Performance optimizations applied
- [ ] Monitoring and alerting functional
- [ ] Documentation updated
- [ ] Team trained on new system

---

## Conclusion

This comprehensive data migration strategy ensures a safe, reliable transition from localStorage to PostgreSQL while maintaining system availability and data integrity. The phased approach allows for validation at each step and provides multiple rollback options if issues arise.

The strategy emphasizes monitoring, testing, and user communication to ensure a successful migration that meets both technical and business requirements. Regular review and adjustment of the plan will be necessary as the migration progresses and new challenges emerge.

*This migration strategy should be reviewed and approved by all stakeholders before implementation begins.*