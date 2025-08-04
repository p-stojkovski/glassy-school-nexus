# PostgreSQL Database Schema Design

## Overview

This document defines the normalized PostgreSQL database schema for the Glassy School Nexus application, designed to support the existing frontend data models while providing a robust foundation for scalability and data integrity.

## Schema Design Principles

1. **Normalization**: Follows 3NF to eliminate data redundancy
2. **Strong Typing**: Uses appropriate PostgreSQL data types
3. **Referential Integrity**: Foreign key constraints ensure data consistency
4. **Audit Trail**: Created/updated timestamps on all entities
5. **Soft Deletes**: Preserve historical data where needed
6. **Performance**: Strategic indexing for common query patterns

## Core Schema

### Users & Authentication

```sql
-- Users table for authentication and basic profile
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

### Physical Infrastructure

```sql
-- Classrooms/Physical Locations
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_classrooms_active ON classrooms(is_active);
CREATE INDEX idx_classrooms_capacity ON classrooms(capacity);
```

### Academic Structure

```sql
-- Teachers (extends users)
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    subject VARCHAR(100) NOT NULL,
    join_date DATE NOT NULL,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Classes/Courses
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) NOT NULL,
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    classroom_id UUID NOT NULL REFERENCES classrooms(id),
    max_students INTEGER NOT NULL CHECK (max_students > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Class Schedules (recurring weekly schedule)
CREATE TABLE class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_time_order CHECK (start_time < end_time)
);

-- Students (extends users)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    class_id UUID REFERENCES classes(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    join_date DATE NOT NULL,
    date_of_birth DATE NOT NULL,
    place_of_birth VARCHAR(255),
    address TEXT,
    
    -- Parent/Guardian Information
    parent_name VARCHAR(255),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Academic Information
    academic_level VARCHAR(50),
    gpa DECIMAL(3,2) CHECK (gpa >= 0 AND gpa <= 4.0),
    enrollment_date DATE NOT NULL,
    
    -- Discount Information
    has_discount BOOLEAN NOT NULL DEFAULT false,
    discount_type VARCHAR(20) CHECK (discount_type IN ('relatives', 'social_case', 'single_parent', 'free_of_charge')),
    discount_amount DECIMAL(10,2) CHECK (discount_amount >= 0),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for students
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_join_date ON students(join_date);
CREATE INDEX idx_students_discount ON students(has_discount, discount_type);
```

### Financial Management

```sql
-- Payment Obligations
CREATE TABLE payment_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    type VARCHAR(100) NOT NULL, -- 'Tuition Fee', 'Book Fee', etc.
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    period VARCHAR(50), -- 'Spring 2024', 'Fall 2024', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Records
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obligation_id UUID NOT NULL REFERENCES payment_obligations(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('cash', 'card', 'transfer', 'other')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for financial tables
CREATE INDEX idx_payment_obligations_student_id ON payment_obligations(student_id);
CREATE INDEX idx_payment_obligations_due_date ON payment_obligations(due_date);
CREATE INDEX idx_payment_obligations_status ON payment_obligations(status);
CREATE INDEX idx_payments_obligation_id ON payments(obligation_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

### Attendance Management

```sql
-- Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    homework_completed BOOLEAN,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one attendance record per student per class per date
    UNIQUE(student_id, class_id, date)
);

-- Indexes
CREATE INDEX idx_attendance_student_class_date ON attendance_records(student_id, class_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_status ON attendance_records(status);
CREATE INDEX idx_attendance_homework ON attendance_records(homework_completed);
```

### Grades & Assessments

```sql
-- Assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('homework', 'test', 'quiz', 'project', 'participation')),
    total_points DECIMAL(6,2) CHECK (total_points > 0),
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual Grades
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    value VARCHAR(10) NOT NULL, -- Can be numeric (90) or letter (A)
    comments TEXT,
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one grade per student per assessment
    UNIQUE(assessment_id, student_id)
);

-- Indexes
CREATE INDEX idx_assessments_class_id ON assessments(class_id);
CREATE INDEX idx_assessments_date ON assessments(date);
CREATE INDEX idx_assessments_type ON assessments(type);
CREATE INDEX idx_grades_assessment_id ON grades(assessment_id);
CREATE INDEX idx_grades_student_id ON grades(student_id);
```

### Private Lessons

```sql
-- Private Lessons
CREATE TABLE private_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    classroom_id UUID NOT NULL REFERENCES classrooms(id),
    subject VARCHAR(100) NOT NULL,
    lesson_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_lesson_time_order CHECK (start_time < end_time)
);

-- Private Lesson Payment Obligations (separate from regular obligations)
CREATE TABLE private_lesson_payment_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES private_lessons(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Only one payment obligation per lesson
    UNIQUE(lesson_id)
);

-- Private Lesson Payments
CREATE TABLE private_lesson_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES private_lessons(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('cash', 'card', 'transfer', 'other')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_private_lessons_student_id ON private_lessons(student_id);
CREATE INDEX idx_private_lessons_teacher_id ON private_lessons(teacher_id);
CREATE INDEX idx_private_lessons_date ON private_lessons(lesson_date);
CREATE INDEX idx_private_lessons_status ON private_lessons(status);
CREATE INDEX idx_private_lesson_payments_lesson_id ON private_lesson_payments(lesson_id);
```

## Triggers & Functions

### Automatic Timestamp Updates

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_schedules_updated_at BEFORE UPDATE ON class_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_obligations_updated_at BEFORE UPDATE ON payment_obligations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_lessons_updated_at BEFORE UPDATE ON private_lessons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_lesson_payment_obligations_updated_at BEFORE UPDATE ON private_lesson_payment_obligations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_lesson_payments_updated_at BEFORE UPDATE ON private_lesson_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Payment Status Auto-Calculation

```sql
-- Function to update payment obligation status based on payments
CREATE OR REPLACE FUNCTION update_payment_obligation_status()
RETURNS TRIGGER AS $$
DECLARE
    total_obligation DECIMAL(10,2);
    total_paid DECIMAL(10,2);
    due_date DATE;
    new_status VARCHAR(20);
BEGIN
    -- Get obligation details
    SELECT amount, due_date INTO total_obligation, due_date
    FROM payment_obligations 
    WHERE id = COALESCE(NEW.obligation_id, OLD.obligation_id);
    
    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM payments 
    WHERE obligation_id = COALESCE(NEW.obligation_id, OLD.obligation_id);
    
    -- Determine new status
    IF total_paid >= total_obligation THEN
        new_status := 'paid';
    ELSIF total_paid > 0 THEN
        new_status := 'partial';
    ELSIF due_date < CURRENT_DATE THEN
        new_status := 'overdue';
    ELSE
        new_status := 'pending';
    END IF;
    
    -- Update obligation status
    UPDATE payment_obligations 
    SET status = new_status 
    WHERE id = COALESCE(NEW.obligation_id, OLD.obligation_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers for payment status updates
CREATE TRIGGER update_obligation_status_on_payment_insert
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION update_payment_obligation_status();

CREATE TRIGGER update_obligation_status_on_payment_update
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_payment_obligation_status();

CREATE TRIGGER update_obligation_status_on_payment_delete
    AFTER DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_payment_obligation_status();
```

### Similar trigger for private lesson payments

```sql
CREATE OR REPLACE FUNCTION update_private_lesson_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    total_obligation DECIMAL(10,2);
    total_paid DECIMAL(10,2);
    due_date DATE;
    new_status VARCHAR(20);
    lesson_id_var UUID;
BEGIN
    lesson_id_var := COALESCE(NEW.lesson_id, OLD.lesson_id);
    
    -- Get obligation details for this lesson
    SELECT amount, due_date INTO total_obligation, due_date
    FROM private_lesson_payment_obligations 
    WHERE lesson_id = lesson_id_var;
    
    -- If no obligation exists, skip
    IF total_obligation IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM private_lesson_payments 
    WHERE lesson_id = lesson_id_var;
    
    -- Determine new status
    IF total_paid >= total_obligation THEN
        new_status := 'paid';
    ELSIF total_paid > 0 THEN
        new_status := 'partial';
    ELSIF due_date < CURRENT_DATE THEN
        new_status := 'overdue';
    ELSE
        new_status := 'pending';
    END IF;
    
    -- Update obligation status
    UPDATE private_lesson_payment_obligations 
    SET status = new_status 
    WHERE lesson_id = lesson_id_var;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers for private lesson payment status updates
CREATE TRIGGER update_private_lesson_obligation_status_on_payment_insert
    AFTER INSERT ON private_lesson_payments
    FOR EACH ROW EXECUTE FUNCTION update_private_lesson_payment_status();

CREATE TRIGGER update_private_lesson_obligation_status_on_payment_update
    AFTER UPDATE ON private_lesson_payments
    FOR EACH ROW EXECUTE FUNCTION update_private_lesson_payment_status();

CREATE TRIGGER update_private_lesson_obligation_status_on_payment_delete
    AFTER DELETE ON private_lesson_payments
    FOR EACH ROW EXECUTE FUNCTION update_private_lesson_payment_status();
```

## Views for Complex Queries

### Student Summary View
```sql
CREATE VIEW student_summary AS
SELECT 
    s.id,
    u.name,
    u.email,
    s.phone,
    s.status,
    c.name as class_name,
    t_user.name as teacher_name,
    s.has_discount,
    s.discount_type,
    s.discount_amount,
    COALESCE(SUM(po.amount), 0) as total_obligations,
    COALESCE(SUM(p.amount), 0) as total_paid,
    COALESCE(SUM(po.amount), 0) - COALESCE(SUM(p.amount), 0) as balance_due
FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN teachers t ON c.teacher_id = t.id
    LEFT JOIN users t_user ON t.user_id = t_user.id
    LEFT JOIN payment_obligations po ON s.id = po.student_id
    LEFT JOIN payments p ON po.id = p.obligation_id
GROUP BY s.id, u.name, u.email, s.phone, s.status, c.name, t_user.name, 
         s.has_discount, s.discount_type, s.discount_amount;
```

### Class Summary View
```sql
CREATE VIEW class_summary AS
SELECT 
    c.id,
    c.name,
    c.level,
    c.status,
    c.max_students,
    COUNT(s.id) as current_students,
    c.max_students - COUNT(s.id) as available_spots,
    u.name as teacher_name,
    cr.name as classroom_name,
    cr.capacity as classroom_capacity
FROM classes c
    JOIN teachers t ON c.teacher_id = t.id
    JOIN users u ON t.user_id = u.id
    JOIN classrooms cr ON c.classroom_id = cr.id
    LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
GROUP BY c.id, c.name, c.level, c.status, c.max_students, u.name, cr.name, cr.capacity;
```

## Migration Strategy

### Phase 1: Core Structure
1. Create users and authentication tables
2. Create classrooms, teachers, classes tables
3. Create students table with basic information

### Phase 2: Academic Features
1. Create class_schedules table
2. Create attendance_records table
3. Create assessments and grades tables

### Phase 3: Financial System
1. Create payment_obligations table
2. Create payments table
3. Add triggers for auto-status calculation

### Phase 4: Advanced Features
1. Create private_lessons tables
2. Create private lesson payment tables
3. Add complex views and reporting functions

### Phase 5: Optimization
1. Add performance indexes
2. Create materialized views for reporting
3. Add database-level constraints and validations

## Data Migration from localStorage

The migration from localStorage to PostgreSQL will require:

1. **Data Export**: Export all localStorage data using MockDataService
2. **Data Transformation**: Map JSON structures to normalized database records
3. **Relationship Resolution**: Resolve string IDs to proper UUID foreign keys
4. **Data Validation**: Ensure all constraints are satisfied
5. **Incremental Migration**: Support running both systems during transition

---

*This schema provides a robust foundation for the backend API while maintaining compatibility with the existing frontend data models.*