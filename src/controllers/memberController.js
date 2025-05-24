// src/controllers/memberController.js

const fs        = require('fs');
const path      = require('path');
const csvParser = require('csv-parser');
const { format } = require('@fast-csv/format');
const memberModel = require('../models/memberModel');
const ImportColumn = require('../models/importColumnModel');
const { sendNotification } = require('../services/notificationService');
const { parse, isValid } = require('date-fns');

const UPDATABLE_FIELDS = [
  'user_id', 'title', 'first_name', 'surname', 'date_of_birth',
  'contact_primary', 'contact_secondary', 'email', 'nationality', 'gender',
  'marital_status', 'num_children', 'physical_address', 'profession', 'occupation',
  'work_address', 'date_joined_church', 'date_born_again', 'date_baptized_immersion',
  'baptized_in_christ_embassy', 'date_received_holy_ghost', 'foundation_school_grad_date'
];

function normalize(val) {
  if (val === '' || val === 'null' || val === 'undefined' || val == null) {
    return null;
  }
  return typeof val === 'string' ? val.trim() : val;
}

// ── CRUD & Duplicate Checking ─────────────────────────────────────────────────

exports.checkDuplicate = async (req, res) => {
  try {
    const { field, value } = req.query;
    if (!field || !value) {
      return res.status(400).json({ error: 'Missing field or value' });
    }
    const exists = await memberModel.checkDuplicateField(field, value);
    return res.json({ exists });
  } catch (err) {
    console.error('Duplicate check error:', err);
    return res.status(500).json({ error: 'Failed to check for duplicates' });
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const photoPath = req.file
      ? `/uploads/profile_photos/${req.file.filename}`
      : null;

    const dupEmail = await memberModel.checkDuplicateField('email', req.body.email);
    const dupPhone = await memberModel.checkDuplicateField('contact_primary', req.body.contact_primary);
    if (dupEmail || dupPhone) {
      return res.status(400).json({
        error: `Duplicate ${dupEmail ? 'email' : 'phone number'}`
      });
    }

    const data = { ...req.body, profile_photo: photoPath };
    const newMember = await memberModel.createMember(data);

    res.status(201).json(newMember);

    sendNotification(
      newMember.id,
      'Welcome to the Church',
      'Your member profile has been created successfully.'
    ).catch(console.error);

  } catch (err) {
    console.error('Error creating member:', err);
    next(err);
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const { member_type } = req.query;
    const members = member_type
      ? await memberModel.getMembersByType(member_type)
      : await memberModel.getAllMembers();
    res.json(members);
  } catch (err) {
    console.error('Error retrieving members:', err);
    res.status(500).json({ message: 'Error retrieving members' });
  }
};

exports.getById = async (req, res) => {
  try {
    const member = await memberModel.getById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    console.error('Error retrieving member:', err);
    res.status(500).json({ message: 'Error retrieving member' });
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const fields = {};
    if (req.file) {
      fields.profile_photo = `/uploads/profile_photos/${req.file.filename}`;
    }
    UPDATABLE_FIELDS.forEach(key => {
      if (req.body[key] !== undefined) {
        fields[key] = key === 'baptized_in_christ_embassy'
          ? (req.body[key] === 'true' || req.body[key] === true)
          : normalize(req.body[key]);
      }
    });
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided.' });
    }
    const updated = await memberModel.updateMember(req.params.id, fields);
    if (!updated) return res.status(404).json({ message: 'Member not found.' });
    res.json(updated);

    sendNotification(
      req.params.id,
      'Profile Updated',
      'Your member profile has been updated successfully.'
    ).catch(console.error);

  } catch (err) {
    console.error('Error updating member:', err);
    next(err);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const deleted = await memberModel.deleteMember(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted successfully' });

    sendNotification(
      req.params.id,
      'Account Deleted',
      'Your member account has been deleted.'
    ).catch(console.error);

  } catch (err) {
    console.error('Error deleting member:', err);
    next(err);
  }
};

exports.exportMembers = async (req, res, next) => {
  try {
    res.setHeader('Content-Disposition', 'attachment; filename="members.csv"');
    res.setHeader('Content-Type', 'text/csv');
    const members = await memberModel.getAllMembers();
    const csvStream = format({ headers: true });
    csvStream.pipe(res);
    members.forEach(m => {
      csvStream.write({
        first_name:      m.first_name,
        surname:         m.surname,
        email:           m.email,
        contact_primary: m.contact_primary,
        date_of_birth:   m.date_of_birth,
        date_joined_church: m.date_joined_church,
      });
    });
    csvStream.end();
  } catch (err) {
    next(err);
  }
};

exports.importMembers = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const filePath = req.file.path;

  try {
    const colsMeta = await ImportColumn.getAllByTable('members');
    const labelToColumn = {};
    const requiredLabels = [];
    colsMeta.forEach(({ column_name, label, required }) => {
      labelToColumn[label] = column_name;
      if (required) requiredLabels.push(label);
    });
    const allowedLabels = new Set(Object.keys(labelToColumn));

    const headers = await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('headers', resolve)
        .on('error', reject);
    });

    const missing = requiredLabels.filter(l => !headers.includes(l));
    const invalid = headers.filter(h => !allowedLabels.has(h));
    if (missing.length || invalid.length) {
      return res.status(400).json({
        error: 'Header validation failed',
        details: { missing, invalid }
      });
    }

    const rowErrors = [];
    const validRows = [];
    await new Promise((resolve, reject) => {
      let rowNum = 1;
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', csvRow => {
          rowNum++;
          const dbRow = {};
          const errs = [];

          Object.entries(csvRow).forEach(([label, val]) => {
            const col = labelToColumn[label];
            dbRow[col] = val?.trim() || null;
          });

          requiredLabels.forEach(label => {
            if (!csvRow[label]?.trim()) {
              errs.push(`${label} is required (row ${rowNum})`);
            }
          });

          if (dbRow.email && !/^[^@]+@[^@]+\.[^@]+$/.test(dbRow.email)) {
            errs.push(`Invalid email format (row ${rowNum})`);
          }

          [
            { col: 'date_of_birth', format: 'MM/dd/yyyy' },
            { col: 'date_joined_church', format: 'MM/dd/yyyy' },
            { col: 'date_born_again', format: 'MM/dd/yyyy' }
          ].forEach(({ col, format: fmt }) => {
            const meta = colsMeta.find(c => c.column_name === col);
            if (!meta) return;
            const label = meta.label;
            const rawVal = csvRow[label];
            if (rawVal) {
              const dt = parse(rawVal, fmt, new Date());
              if (!isValid(dt)) {
                errs.push(`Invalid ${label} (row ${rowNum}): expected ${fmt}`);
              } else {
                dbRow[col] = dt.toISOString().split('T')[0];
              }
            }
          });

          if (errs.length) {
            rowErrors.push(...errs);
          } else {
            validRows.push(dbRow);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (rowErrors.length) {
      return res.status(400).json({
        error: 'Row validation failed',
        details: rowErrors
      });
    }

    const inserted = await memberModel.bulkInsert(validRows);
    res.json({
      message: `Imported ${inserted.length} members.`,
      importedCount: inserted.length
    });

  } catch (err) {
    next(err);
  } finally {
    fs.unlink(filePath, () => {});
  }
};
// ── Finance & Gamification Stats ─────────────────────────────────────────────

exports.getStats = async (req, res, next) => {
  try {
    const data = await memberModel.stats(+req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getHeatmap = async (req, res, next) => {
  try {
    const data = await memberModel.heatmap(+req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyGiving = async (req, res, next) => {
  try {
    const data = await memberModel.monthlyGiving(+req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getBadges = async (req, res, next) => {
  try {
    const data = await memberModel.badges(+req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

