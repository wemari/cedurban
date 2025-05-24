const Donation = require('../models/donationModel');

const path     = require('path');

exports.listDonations = async (req, res, next) => {
  try {
    const all = await Donation.listAll();
    res.json(all);
  } catch (err) {
    next(err);
  }
};

exports.getDonation = async (req, res, next) => {
  try {
    const d = await Donation.getById(+req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    res.json(d);
  } catch (err) {
    next(err);
  }
};

exports.createDonation = async (req, res, next) => {
  try {
    const newD = await Donation.create(req.body);
    res.status(201).json(newD);
  } catch (err) {
    next(err);
  }
};

exports.updateDonation = async (req, res, next) => {
  try {
    const updated = await Donation.update(+req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found or no fields' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteDonation = async (req, res, next) => {
  try {
    const ok = await Donation.remove(+req.params.id);
    if (!ok) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};




exports.uploadProof = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const url = `/uploads/donations/${req.file.filename}`;
    const updated = await Donation.updateProofUrl(+req.params.id, url);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// stub: initiate online payment
exports.startOnlinePayment = async (req, res) => {
  // in real life: create payment record / token, redirect to gateway…
  // here we just echo back:
  res.json({ paymentUrl: `https://dummygateway.example/pay?amount=${req.body.amount}` });
};

// stub: payment callback
exports.handlePaymentCallback = async (req, res) => {
  // e.g. ?id=XX&status=success
  const { id, status } = req.query;
  if (status === 'success') {
    await Donation.update(+id, { status: 'Completed' });
  }
  res.send('OK');
};
