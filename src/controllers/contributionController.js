// server/controllers/contributionController.js
const Contribution = require('../models/contributionModel');
const multer       = require('multer');
const upload       = multer({ dest: 'uploads/' });

exports.getByMember = async (req, res, next) => {
  try {
    const data = await Contribution.findByMember(+req.params.id);
    res.json(data);
  } catch (err) { next(err); }
};

exports.uploadProof = [
  upload.single('proof'),
  async (req, res, next) => {
    try {
      // In prod, move to S3/etc. Here use local path.
      const url = `/uploads/${req.file.filename}`;
      await Contribution.setProof(+req.params.id, url);
      res.json({ proof_url: url });
    } catch (err) { next(err); }
  }
];

exports.makePayment = async (req, res, next) => {
  try {
    const created = await Contribution.add(
      req.body.member_id,
      { amount: req.body.amount, type: req.body.type }
    );
    res.status(201).json(created);
  } catch (err) { next(err); }
};
