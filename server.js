const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Sample Data ────────────────────────────────────────────────────────────

const employees = [
  { id: 'EMP001', name: 'Sarah Johnson',   initials: 'SJ', color: '#8B5CF6', department: 'Engineering', position: 'Senior Developer',  email: 'sarah@geolock.com',   phone: '+1 555-0101', status: 'Active', joinDate: '2022-01-15' },
  { id: 'EMP002', name: 'Michael Chen',    initials: 'MC', color: '#06B6D4', department: 'Product',     position: 'Product Manager',    email: 'michael@geolock.com', phone: '+1 555-0102', status: 'Active', joinDate: '2021-03-20' },
  { id: 'EMP003', name: 'Emily Davis',     initials: 'ED', color: '#F59E0B', department: 'Design',      position: 'UI/UX Designer',     email: 'emily@geolock.com',   phone: '+1 555-0103', status: 'Active', joinDate: '2023-07-01' },
  { id: 'EMP004', name: 'James Wilson',    initials: 'JW', color: '#EF4444', department: 'Sales',       position: 'Sales Executive',    email: 'james@geolock.com',   phone: '+1 555-0104', status: 'Active', joinDate: '2020-11-10' },
  { id: 'EMP005', name: 'Lisa Anderson',   initials: 'LA', color: '#10B981', department: 'HR',          position: 'HR Manager',         email: 'lisa@geolock.com',    phone: '+1 555-0105', status: 'Active', joinDate: '2019-06-05' },
  { id: 'EMP006', name: 'Robert Martinez', initials: 'RM', color: '#3B82F6', department: 'Engineering', position: 'Backend Developer',  email: 'robert@geolock.com',  phone: '+1 555-0106', status: 'Active', joinDate: '2022-09-12' },
  { id: 'EMP007', name: 'Anna Thompson',   initials: 'AT', color: '#EC4899', department: 'Marketing',   position: 'Marketing Lead',     email: 'anna@geolock.com',    phone: '+1 555-0107', status: 'Active', joinDate: '2021-05-18' },
  { id: 'EMP008', name: 'David Kim',       initials: 'DK', color: '#6366F1', department: 'Finance',     position: 'Financial Analyst',  email: 'david@geolock.com',   phone: '+1 555-0108', status: 'On Leave', joinDate: '2020-02-28' },
];

const attendance = [
  { empId: 'EMP001', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: '8h 30m', location: 'Main Office',   status: 'Present' },
  { empId: 'EMP002', checkIn: '08:55 AM', checkOut: '05:45 PM', hours: '8h 50m', location: 'Main Office',   status: 'Present' },
  { empId: 'EMP003', checkIn: '09:22 AM', checkOut: '05:30 PM', hours: '8h 08m', location: 'Main Office',   status: 'Late'    },
  { empId: 'EMP004', checkIn: '--',       checkOut: '--',        hours: '--',     location: '--',            status: 'Absent'  },
  { empId: 'EMP005', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: '8h 30m', location: 'Branch Office', status: 'Present' },
  { empId: 'EMP006', checkIn: '08:45 AM', checkOut: '05:00 PM', hours: '8h 15m', location: 'Main Office',   status: 'Present' },
  { empId: 'EMP007', checkIn: '--',       checkOut: '--',        hours: '--',     location: '--',            status: 'Absent'  },
  { empId: 'EMP008', checkIn: '10:05 AM', checkOut: '06:00 PM', hours: '7h 55m', location: 'Remote',        status: 'Late'    },
];

const locations = [
  { id: 'LOC001', name: 'Main Office',   address: '123 Business Ave, New York, NY 10001', lat: 40.7128, lng: -74.0060, radius: 100, employees: 45, status: 'Active'   },
  { id: 'LOC002', name: 'Branch Office', address: '456 Commerce St, Brooklyn, NY 11201',  lat: 40.6892, lng: -73.9442, radius: 80,  employees: 22, status: 'Active'   },
  { id: 'LOC003', name: 'Remote Hub',    address: '789 Tech Park, Jersey City, NJ 07302', lat: 40.7178, lng: -74.0431, radius: 150, employees: 15, status: 'Active'   },
  { id: 'LOC004', name: 'Warehouse',     address: '321 Industrial Blvd, Newark, NJ 07102',lat: 40.7357, lng: -74.1724, radius: 200, employees: 30, status: 'Inactive' },
];

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/', (req, res) => res.redirect('/dashboard'));

app.get('/dashboard', (req, res) => {
  const stats = {
    totalEmployees: employees.length,
    present: attendance.filter(a => a.status === 'Present').length,
    late:    attendance.filter(a => a.status === 'Late').length,
    absent:  attendance.filter(a => a.status === 'Absent').length,
  };
  const recentAttendance = attendance.slice(0, 5).map(a => ({
    ...a,
    emp: employees.find(e => e.id === a.empId)
  }));
  const weeklyData = [
    { day: 'Mon', present: 7, late: 1, absent: 0 },
    { day: 'Tue', present: 6, late: 2, absent: 1 },
    { day: 'Wed', present: 8, late: 1, absent: 1 },
    { day: 'Thu', present: 5, late: 2, absent: 2 },
    { day: 'Fri', present: 7, late: 1, absent: 2 },
  ];
  res.render('dashboard', { page: 'dashboard', stats, recentAttendance, weeklyData, employees });
});

app.get('/employees', (req, res) => {
  res.render('employees', { page: 'employees', employees });
});

app.get('/attendance', (req, res) => {
  const records = attendance.map(a => ({
    ...a,
    emp: employees.find(e => e.id === a.empId)
  }));
  const stats = {
    total:   records.length,
    present: records.filter(r => r.status === 'Present').length,
    late:    records.filter(r => r.status === 'Late').length,
    absent:  records.filter(r => r.status === 'Absent').length,
  };
  res.render('attendance', { page: 'attendance', records, stats });
});

app.get('/locations', (req, res) => {
  res.render('locations', { page: 'locations', locations });
});

app.get('/reports', (req, res) => {
  const deptData = {};
  employees.forEach(e => {
    if (!deptData[e.department]) deptData[e.department] = { total: 0, present: 0 };
    deptData[e.department].total++;
    const att = attendance.find(a => a.empId === e.id);
    if (att && att.status === 'Present') deptData[e.department].present++;
  });
  res.render('reports', { page: 'reports', deptData, attendance, employees });
});

app.get('/payroll', (req, res) => {
  const payroll = employees.map(e => {
    const att = attendance.filter(a => a.empId === e.id);
    const hoursWorked = att.reduce((sum, a) => {
      if (a.hours !== '--') {
        const [h, m] = a.hours.split('h ');
        return sum + parseInt(h) + parseInt(m) / 60;
      }
      return sum;
    }, 0);
    const base = { Engineering: 8500, Product: 9000, Design: 7500, Sales: 6500, HR: 7000, Marketing: 7200, Finance: 8000 };
    const salary = base[e.department] || 7000;
    return { ...e, hoursWorked: hoursWorked.toFixed(1), salary, deductions: Math.floor(salary * 0.1), net: Math.floor(salary * 0.9) };
  });
  res.render('payroll', { page: 'payroll', payroll });
});

app.get('/settings', (req, res) => res.render('settings', { page: 'settings', subPage: 'hub' }));
app.get('/settings/appearance', (req, res) => res.render('settings-appearance', { page: 'settings', subPage: 'appearance' }));
app.get('/settings/attendance', (req, res) => res.render('settings-attendance', { page: 'settings', subPage: 'attendance' }));
app.get('/settings/locations', (req, res) => res.render('settings-locations', { page: 'settings', subPage: 'locations' }));
app.get('/settings/payroll', (req, res) => res.render('settings-payroll', { page: 'settings', subPage: 'payroll' }));
app.get('/settings/account', (req, res) => res.render('settings-account', { page: 'settings', subPage: 'account' }));
// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✅  GeoLock Attendance Dashboard running at http://localhost:${PORT}\n`);
});
