-- Drop existing tables to avoid column mismatches
DROP TABLE IF EXISTS public.attendance;
DROP TABLE IF EXISTS public.locations;
DROP TABLE IF EXISTS public.employees;

-- Create Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT,
  color TEXT,
  department TEXT,
  position TEXT,
  email TEXT,
  phone TEXT,
  status TEXT,
  joinDate TEXT
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "empId" TEXT REFERENCES public.employees(id),
  "checkIn" TEXT,
  "checkOut" TEXT,
  hours TEXT,
  location TEXT,
  status TEXT
);

-- Create Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  lat FLOAT,
  lng FLOAT,
  radius INTEGER,
  employees INTEGER,
  status TEXT
);

-- Seed Employees
INSERT INTO public.employees (id, name, initials, color, department, position, email, phone, status, joinDate)
VALUES 
  ('EMP001', 'Sarah Johnson', 'SJ', '#8B5CF6', 'Engineering', 'Senior Developer', 'sarah@geolock.com', '+1 555-0101', 'Active', '2022-01-15'),
  ('EMP002', 'Michael Chen', 'MC', '#06B6D4', 'Product', 'Product Manager', 'michael@geolock.com', '+1 555-0102', 'Active', '2021-03-20'),
  ('EMP003', 'Emily Davis', 'ED', '#F59E0B', 'Design', 'UI/UX Designer', 'emily@geolock.com', '+1 555-0103', 'Active', '2023-07-01'),
  ('EMP004', 'James Wilson', 'JW', '#EF4444', 'Sales', 'Sales Executive', 'james@geolock.com', '+1 555-0104', 'Active', '2020-11-10'),
  ('EMP005', 'Lisa Anderson', 'LA', '#10B981', 'HR', 'HR Manager', 'lisa@geolock.com', '+1 555-0105', 'Active', '2019-06-05'),
  ('EMP006', 'Robert Martinez', 'RM', '#3B82F6', 'Engineering', 'Backend Developer', 'robert@geolock.com', '+1 555-0106', 'Active', '2022-09-12'),
  ('EMP007', 'Anna Thompson', 'AT', '#EC4899', 'Marketing', 'Marketing Lead', 'anna@geolock.com', '+1 555-0107', 'Active', '2021-05-18'),
  ('EMP008', 'David Kim', 'DK', '#6366F1', 'Finance', 'Financial Analyst', 'david@geolock.com', '+1 555-0108', 'On Leave', '2020-02-28')
ON CONFLICT (id) DO NOTHING;

-- Seed Attendance
INSERT INTO public.attendance ("empId", "checkIn", "checkOut", hours, location, status)
VALUES
  ('EMP001', '09:00 AM', '05:30 PM', '8h 30m', 'Main Office', 'Present'),
  ('EMP002', '08:55 AM', '05:45 PM', '8h 50m', 'Main Office', 'Present'),
  ('EMP003', '09:22 AM', '05:30 PM', '8h 08m', 'Main Office', 'Late'),
  ('EMP004', '--', '--', '--', '--', 'Absent'),
  ('EMP005', '09:00 AM', '05:30 PM', '8h 30m', 'Branch Office', 'Present'),
  ('EMP006', '08:45 AM', '05:00 PM', '8h 15m', 'Main Office', 'Present'),
  ('EMP007', '--', '--', '--', '--', 'Absent'),
  ('EMP008', '10:05 AM', '06:00 PM', '7h 55m', 'Remote', 'Late');

-- Seed Locations
INSERT INTO public.locations (id, name, address, lat, lng, radius, employees, status)
VALUES
  ('LOC001', 'Main Office', '123 Business Ave, New York, NY 10001', 40.7128, -74.0060, 100, 45, 'Active'),
  ('LOC002', 'Branch Office', '456 Commerce St, Brooklyn, NY 11201', 40.6892, -73.9442, 80, 22, 'Active'),
  ('LOC003', 'Remote Hub', '789 Tech Park, Jersey City, NJ 07302', 40.7178, -74.0431, 150, 15, 'Active'),
  ('LOC004', 'Warehouse', '321 Industrial Blvd, Newark, NJ 07102', 40.7357, -74.1724, 200, 30, 'Inactive')
ON CONFLICT (id) DO NOTHING;
