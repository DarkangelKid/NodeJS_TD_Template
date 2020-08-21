const express = require('express');
const officeRoutes = require('./office.route');
const chatGroupRoutes = require('./chatGroup.route');
const chatGroupMessageRoutes = require('./chatGroupMessage.route');
const groupRoutes = require('./group.route');
const userRoutes = require('./user.route');
const userMessageRoutes = require('./userMessage.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));
router.use('/offices', officeRoutes);
router.use('/chatGroups', chatGroupRoutes);
router.use('/chatGroupMessages', chatGroupMessageRoutes);
router.use('/groups', groupRoutes);
router.use('/users', userRoutes);
router.use('/userMessages', userMessageRoutes);

module.exports = router;
