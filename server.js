const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const supabase = require('./supabase');

// ─── Routes ──────────────────────────────────────────────────────────────────

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/', (req, res) => res.redirect('/dashboard'));

app.get('/dashboard', async (req, res) => {
  try {
    const { data: employees, error: empErr } = await supabase.from('employees').select('*');
    const { data: attendance, error: attErr } = await supabase.from('attendance').select('*');
    if (empErr) throw empErr;
    if (attErr) throw attErr;

    const stats = {
      totalEmployees: employees?.length || 0,
      present: (attendance || []).filter(a => a.status === 'present').length,
      late:    (attendance || []).filter(a => a.status === 'late').length,
      absent:  (attendance || []).filter(a => a.status === 'absent').length,
    };
    
    // Attempt to map using user_id, fallback to raw user_id if not linked
    const recentAttendance = (attendance || []).slice(0, 5).map(a => {
      const emp = (employees || []).find(e => e.user_id === a.user_id);
      return {
        ...a,
        emp: emp || { id: a.user_id, name: 'User ' + (a.user_id ? a.user_id.substring(0,6) : 'Unknown'), initials: 'U', color: '#6B7280', position: 'Unlinked Account' }
      };
    });
    
    const weeklyData = [
      { day: 'Mon', present: 7, late: 1, absent: 0 },
      { day: 'Tue', present: 6, late: 2, absent: 1 },
      { day: 'Wed', present: 8, late: 1, absent: 1 },
      { day: 'Thu', present: 5, late: 2, absent: 2 },
      { day: 'Fri', present: 7, late: 1, absent: 2 },
    ];
    res.render('dashboard', { page: 'dashboard', stats, recentAttendance, weeklyData, employees: employees || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard: " + err.message });
  }
});

app.get('/employees', async (req, res) => {
  const { data: employees } = await supabase.from('employees').select('*');
  res.render('employees', { page: 'employees', employees: employees || [] });
});

app.get('/attendance', async (req, res) => {
  try {
    const { data: employees } = await supabase.from('employees').select('*');
    const { data: attendance } = await supabase.from('attendance').select('*');

    const records = (attendance || []).map(a => {
      const emp = (employees || []).find(e => e.user_id === a.user_id);
      return {
        ...a,
        emp: emp || { id: a.user_id, name: 'User ' + (a.user_id ? a.user_id.substring(0,6) : 'Unknown'), initials: 'U', color: '#6B7280', position: 'Unlinked Account', department: 'Unknown' }
      };
    });
    
    const stats = {
      total:   records.length,
      present: records.filter(r => r.status === 'present').length,
      late:    records.filter(r => r.status === 'late').length,
      absent:  records.filter(r => r.status === 'absent').length,
    };
    res.render('attendance', { page: 'attendance', records, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load attendance: " + err.message });
  }
});

app.get('/locations', async (req, res) => {
  const { data: locations } = await supabase.from('locations').select('*');
  res.render('locations', { page: 'locations', locations: locations || [] });
});

app.get('/reports', async (req, res) => {
  try {
    const { data: employees } = await supabase.from('employees').select('*');
    const { data: attendance } = await supabase.from('attendance').select('*');

    const deptData = {};
    (employees || []).forEach(e => {
      if (!deptData[e.department]) deptData[e.department] = { total: 0, present: 0 };
      deptData[e.department].total++;
      const att = (attendance || []).find(a => a.user_id === e.user_id);
      if (att && att.status === 'present') deptData[e.department].present++;
    });
    res.render('reports', { page: 'reports', deptData, attendance: attendance || [], employees: employees || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load reports: " + err.message });
  }
});

app.get('/payroll', async (req, res) => {
  try {
    const { data: employees } = await supabase.from('employees').select('*');
    const { data: attendance } = await supabase.from('attendance').select('*');

    const payroll = (employees || []).map(e => {
      const att = (attendance || []).filter(a => a.user_id === e.user_id);
      // Since checkOut/hours are gone, we estimate hours (8 hours per attendance record)
      const hoursWorked = att.length * 8;
      
      const base = { Engineering: 8500, Product: 9000, Design: 7500, Sales: 6500, HR: 7000, Marketing: 7200, Finance: 8000 };
      const salary = base[e.department] || 7000;
      return { ...e, hoursWorked: hoursWorked.toFixed(1), salary, deductions: Math.floor(salary * 0.1), net: Math.floor(salary * 0.9) };
    });
    res.render('payroll', { page: 'payroll', payroll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load payroll: " + err.message });
  }
});

// API Routes for Locations
app.post('/api/locations', async (req, res) => {
  const { data, error } = await supabase.from('locations').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/locations/:id', async (req, res) => {
  const { data, error } = await supabase.from('locations').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/locations/:id', async (req, res) => {
  const { error } = await supabase.from('locations').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get('/settings', (req, res) => res.render('settings', { page: 'settings', subPage: 'hub' }));
app.get('/settings/appearance', (req, res) => res.render('settings-appearance', { page: 'settings', subPage: 'appearance' }));
app.get('/settings/attendance', (req, res) => res.render('settings-attendance', { page: 'settings', subPage: 'attendance' }));
app.get('/settings/locations', (req, res) => res.render('settings-locations', { page: 'settings', subPage: 'locations' }));
app.get('/settings/payroll', (req, res) => res.render('settings-payroll', { page: 'settings', subPage: 'payroll' }));
app.get('/settings/account', (req, res) => res.render('settings-account', { page: 'settings', subPage: 'account' }));
// ─── Start ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  ✅  GeoLock Attendance Dashboard running at http://localhost:${PORT}\n`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
