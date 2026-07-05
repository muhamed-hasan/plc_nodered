const express = require('express');
const fs = require('fs');
const Rules = require('../models/rules');
const watcherService = require('../services/watcher');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const rules = Rules.getAll();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/rules/validate-path — check if file paths exist on disk
router.post('/validate-path', (req, res) => {
  const { file_path } = req.body;
  if (!file_path || typeof file_path !== 'string') {
    return res.status(400).json({ error: 'file_path is required.' });
  }

  const paths = file_path.split(',').map(p => p.trim()).filter(Boolean);
  const results = paths.map(p => {
    try {
      const exists = fs.existsSync(p);
      const isFile = exists ? fs.statSync(p).isFile() : false;
      return { path: p, exists, isFile, valid: exists && isFile };
    } catch {
      return { path: p, exists: false, isFile: false, valid: false };
    }
  });

  const allValid = results.every(r => r.valid);
  res.json({ valid: allValid, paths: results });
});



router.post('/', (req, res) => {
  const { file_path, coil, duration, enabled } = req.body;

  if (!file_path || typeof file_path !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing file_path' });
  }

  if (typeof coil !== 'number' || coil < 0 || coil > 7) {
    return res.status(400).json({ error: 'Invalid coil, must be integer between 0 and 7' });
  }

  if (typeof duration !== 'number' || duration <= 0) {
    return res.status(400).json({ error: 'Invalid duration, must be positive integer' });
  }

  const enabledVal = enabled !== undefined ? (enabled ? 1 : 0) : 1;

  try {
    const rule = Rules.create({ file_path, coil, duration, enabled: enabledVal });
    watcherService.reload();
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    console.error('Error creating rule:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'File path already exists in another rule.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  const { file_path, coil, duration, enabled } = req.body;
  const updates = {};
  
  if (file_path !== undefined) {
    if (typeof file_path !== 'string') return res.status(400).json({ error: 'Invalid file_path' });
    updates.file_path = file_path;
  }
  
  if (coil !== undefined) {
    if (typeof coil !== 'number' || coil < 0 || coil > 7) return res.status(400).json({ error: 'Invalid coil' });
    updates.coil = coil;
  }
  
  if (duration !== undefined) {
    if (typeof duration !== 'number' || duration <= 0) return res.status(400).json({ error: 'Invalid duration' });
    updates.duration = duration;
  }

  if (enabled !== undefined) {
    updates.enabled = enabled ? 1 : 0;
  }

  try {
    const updatedRule = Rules.update(id, updates);
    if (!updatedRule) {
      return res.status(404).json({ error: 'Rule not found.' });
    }
    watcherService.reload();
    res.status(200).json({ success: true, data: updatedRule });
  } catch (error) {
    console.error('Error updating rule:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'File path already exists in another rule.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    const deleted = Rules.delete(id);
    if (!deleted) {
      // Returning 200/success true even for non-existent is often fine for DELETE but spec implies normal 404 possibly, actually REST says 404 or 200
      // But spec says "success: true, message: Rule 2 deleted". Let's handle generic success if deleted.
      return res.status(404).json({ error: 'Rule not found.' });
    }
    watcherService.reload();
    res.status(200).json({ success: true, message: `Rule ${id} deleted.` });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
