// server/app.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const path    = require('path');

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://cedurbanzone.onrender.com', // Replace with your real frontend URL(s)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Not allowed by CORS'));
  },
  credentials: true,
}));

// Accept JSON and plain text for fetch
app.use(express.json({ type: ['application/json', 'text/plain'] }));

// Static uploads (e.g. proof URLs, profile pics)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Auth & RBAC
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/roles',       require('./routes/roleRoutes'));
app.use('/api/permissions', require('./routes/permissionRoutes'));

// Membership System
app.use('/api/members',                require('./routes/memberRoutes'));
app.use('/api/next-of-kin',            require('./routes/nextOfKinRoutes'));
app.use('/api/member-family',          require('./routes/memberFamilyRoutes'));
app.use('/api/cell-groups',            require('./routes/cellGroupRoutes'));
app.use('/api/member-cell-groups',     require('./routes/memberCellGroupRoutes'));
app.use('/api/departments',            require('./routes/departmentRoutes'));
app.use('/api/member-departments',     require('./routes/memberDepartmentRoutes'));
app.use('/api/first-timers',           require('./routes/firstTimerRoutes'));
app.use('/api/new-converts',           require('./routes/newConvertRoutes'));
app.use('/api/admin',                  require('./routes/adminRoutes'));
app.use('/api/milestone-templates',    require('./routes/milestoneTemplateRoutes'));
app.use('/api/milestones',             require('./routes/milestoneRecordRoutes'));
app.use('/api/counseling',             require('./routes/counselingRoutes'));
app.use('/api/prayer-requests',        require('./routes/prayerRequestRoutes'));
app.use('/api/member-counseling',      require('./routes/memberCounselingRoutes'));
app.use('/api/member-prayer-requests', require('./routes/memberPrayerRequestRoutes'));
app.use('/api/notifications',          require('./routes/notificationRoutes'));
app.use('/api/cell-group-rules',       require('./routes/rulesRoutes'));
app.use('/api/designations',           require('./routes/designationRoutes'));
app.use('/api/cell-group-promotion-rules', require('./routes/promotionRuleRoutes'));
app.use('/api/attendances',            require('./routes/attendanceRoutes'));
app.use('/api/events',                 require('./routes/events'));

// Finance Module
app.use('/api/income',                require('./routes/incomeRoutes'));
app.use('/api/expenses',              require('./routes/expenseRoutes'));
app.use('/api/accounts',              require('./routes/accountRoutes'));
app.use('/api/account-transactions',  require('./routes/accountTransactionRoutes'));
app.use('/api/budgets',               require('./routes/budgetRoutes'));
app.use('/api/donations',             require('./routes/donationRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Settings lookups
app.use('/api/settings/account-types',             require('./routes/accountTypeRoutes'));
app.use('/api/settings/expense-categories',        require('./routes/expenseCategoryRoutes'));
app.use('/api/settings/payment-methods',           require('./routes/paymentMethodRoutes'));
app.use('/api/settings/account-transaction-types', require('./routes/accountTransactionTypeRoutes'));
app.use('/api/settings/currencies',                require('./routes/currencyRoutes'));
app.use('/api/settings/banks',                     require('./routes/bankRoutes'));
app.use('/api/settings',                           require('./routes/settingRoutes'));
app.use('/api/settings/income-categories',         require('./routes/incomeCategoryRoutes'));
app.use('/api/settings/badges', require('./routes/badgeRoutes'));
app.use('/api/settings/member-badges', require('./routes/memberBadgeRoutes'));
app.use('/api/settings/pledges', require('./routes/pledgeRoutes'));
// Mount routes
app.use('/api/import-columns', require('./routes/importColumnRoutes'));





// Member‐side finance (MVC)
app.use('/api', require('./routes/contributionRoutes'));
app.use('/api', require('./routes/pledgeRoutes'));

// Health check
app.get('/', (req, res) => res.send('RBAC + Membership Backend Running ✅'));

module.exports = app;
