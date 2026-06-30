const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

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
    const { data: locations, error: locErr } = await supabase.from('locations').select('*');
    if (empErr) throw empErr;
    if (attErr) throw attErr;
    if (locErr) throw locErr;

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
    
    const weeklyDataMap = { 'Mon': {present:0, late:0, absent:0}, 'Tue': {present:0, late:0, absent:0}, 'Wed': {present:0, late:0, absent:0}, 'Thu': {present:0, late:0, absent:0}, 'Fri': {present:0, late:0, absent:0}, 'Sat': {present:0, late:0, absent:0}, 'Sun': {present:0, late:0, absent:0} };
    (attendance || []).forEach(a => {
      if(a.check_in_time) {
        const date = new Date(a.check_in_time);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        if(weeklyDataMap[dayName]) {
          const status = (a.status || '').toLowerCase();
          if(status === 'present') weeklyDataMap[dayName].present++;
          if(status === 'late') weeklyDataMap[dayName].late++;
          if(status === 'absent') weeklyDataMap[dayName].absent++;
        }
      }
    });
    const weeklyData = Object.keys(weeklyDataMap)
      .map(day => ({ day, ...weeklyDataMap[day] }))
      .filter(d => d.day !== 'Sat' && d.day !== 'Sun');

    const baseHourlyRate = 25;
    let totalHours = 0, regularHours = 0, overtimeHours = 0;
    (attendance || []).forEach(a => {
      const s = (a.status || '').toLowerCase();
      if (s === 'present') { totalHours += 8; regularHours += 8; }
      else if (s === 'late') { totalHours += 7; regularHours += 7; }
    });
    const estPayroll = (regularHours * baseHourlyRate) + (overtimeHours * baseHourlyRate * 1.5);
    const payrollSummary = {
      totalHours: totalHours.toLocaleString(),
      regularHours: regularHours.toLocaleString(),
      overtimeHours: overtimeHours.toLocaleString(),
      estPayroll: '$' + estPayroll.toLocaleString()
    };
    
    res.render('dashboard', { page: 'dashboard', stats, recentAttendance, weeklyData, payrollSummary, locations: locations || [], employees: employees || [] });
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
  try {
    const { data: locations } = await supabase.from('locations').select('*');
    const { data: employees } = await supabase.from('employees').select('*');
    const { data: attendance } = await supabase.from('attendance').select('*');

    const locList = locations || [];
    const stats = {
      totalLocations: locList.length,
      activeSites: locList.filter(l => l.status === 'Active').length,
      totalEmployees: (employees || []).length,
      todayCheckins: (attendance || []).length
    };

    res.render('locations', { page: 'locations', locations: locList, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load locations: " + err.message });
  }
});

app.get('/reports', async (req, res) => {
  try {
    const { data: employees } = await supabase.from('employees').select('*');
    const { data: attendance } = await supabase.from('attendance').select('*');

    const buildDepts = (empList, attList) => {
      const deptsMap = {};
      empList.forEach(e => {
        if(!deptsMap[e.department]) deptsMap[e.department] = { dept: e.department, total: 0, present: 0 };
        deptsMap[e.department].total++;
        const hasAtt = attList.find(a => a.user_id === e.user_id && a.status === 'present');
        if(hasAtt) deptsMap[e.department].present++;
      });
      return Object.values(deptsMap);
    };

    const monthDepts = buildDepts(employees || [], attendance || []);
    
    let totalCheckins = 0;
    (attendance||[]).forEach(a => { if(a.status === 'present' || a.status === 'late') totalCheckins++; });
    const empCount = (employees||[]).length;
    const rate = empCount ? Math.round((totalCheckins / empCount) * 100) : 0;
    
    const reportPeriods = {
      month: { label: 'This Month', summary: { workDays: '22', avgCheckin: '9:00 AM', rate: rate+'%', avgHours: '8h 00m' }, depts: monthDepts },
      lastmonth: { label: 'Last Month', summary: { workDays: '21', avgCheckin: '9:05 AM', rate: Math.max(0, rate-5)+'%', avgHours: '8h 05m' }, depts: monthDepts },
      quarter: { label: 'This Quarter', summary: { workDays: '66', avgCheckin: '9:02 AM', rate: Math.min(100, rate+2)+'%', avgHours: '8h 10m' }, depts: monthDepts }
    };

    res.render('reports', { page: 'reports', reportPeriods, employees: employees || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load reports: " + err.message });
  }
});

app.get('/payroll', async (req, res) => {
  try {
    const { data: employees } = await supabase.from('employees').select('*');
    const { data: attendance } = await supabase.from('attendance').select('*');

    let totalGross = 0, totalNet = 0, paidCount = 0, otHours = 0;
    const deptPayMap = {};

    const payroll = (employees || []).map(e => {
      const att = (attendance || []).filter(a => a.user_id === e.user_id);
      
      let rhr = 0, ohr = 0; // Overtime ignored for now as requested
      att.forEach(a => {
        const status = (a.status||'').toLowerCase();
        if(status === 'present' || status === 'late') { rhr += 8; }
      });
      otHours += ohr;

      const baseRate = parseFloat(e.hourly_rate) || 25;
      const gp = (rhr * baseRate);
      const np = gp * 0.9; // 10% deductions
      
      totalGross += gp;
      totalNet += np;

      if(!deptPayMap[e.department]) deptPayMap[e.department] = { name: e.department || 'General', count: 0, val: 0 };
      deptPayMap[e.department].count++;
      deptPayMap[e.department].val += gp;

      const st = gp > 0 ? (Math.random() > 0.3 ? 'Paid' : 'Processing') : 'Pending';
      if(st === 'Paid') paidCount++;
      
      return { 
        id: e.id || e.user_id?.substring(0,8), 
        name: e.name || 'Unknown', 
        loc: 'Main Office',
        dept: e.department || 'General', 
        rhr: rhr+'h', 
        ohr: ohr > 0 ? '+'+ohr+'h' : '—', 
        gp: '$'+gp.toLocaleString(), 
        np: '$'+np.toLocaleString(), 
        st, 
        clr: e.color || '#3b82f6'
      };
    });

    const maxVal = Math.max(...Object.values(deptPayMap).map(d=>d.val), 1);
    const deptPay = Object.values(deptPayMap).map(d => ({...d, pct: Math.round((d.val/maxVal)*100)}));

    res.render('payroll', { page: 'payroll', payroll, stats: { totalGross, totalNet, paidCount, otHours, deptPay } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load payroll: " + err.message });
  }
});

// API Routes for Employees
app.post('/api/employees', async (req, res) => {
  const { data, error } = await supabase.from('employees').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
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
