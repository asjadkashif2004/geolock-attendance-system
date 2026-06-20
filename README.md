# GeoLock Attendance Dashboard

A modern Employee Attendance Management Web Dashboard built with **Node.js + Express + EJS**.

## 🚀 Features

- 📋 **Attendance** – Full attendance table with check-in/out times, status badges (Present/Late/Absent), search & filter, CSV export
- 📊 **Dashboard** – Weekly bar chart, donut summary, recent attendance overview
- 👥 **Employees** – Employee card grid with department & status filters
- 📍 **Locations** – Geo-fenced office zones management
- 📈 **Reports** – Department-wise attendance analytics
- 💰 **Payroll** – Salary management with deductions & net pay
- ⚙️ **Settings** – Company info, attendance rules, notification toggles, security

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Templating**: EJS
- **Styling**: Vanilla CSS (Inter font, modern design system)

## 📦 Installation

```bash
npm install
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
attendance-dashboard/
├── server.js              ← Express server + routes + sample data
├── views/
│   ├── partials/
│   │   ├── header.ejs     ← Sidebar + topbar layout
│   │   └── footer.ejs     ← Closing HTML
│   ├── attendance.ejs
│   ├── dashboard.ejs
│   ├── employees.ejs
│   ├── locations.ejs
│   ├── reports.ejs
│   ├── payroll.ejs
│   └── settings.ejs
└── public/
    ├── css/style.css
    └── js/app.js
```
