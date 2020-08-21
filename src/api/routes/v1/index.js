const express = require('express');

const chatGroupRoutes = require('./chatGroup.route');
const chatGroupMessageRoutes = require('./chatGroupMessage.route');
const commentRoutes = require('./comment.route');
const contactRoutes = require('./contact.route');
const groupRoutes = require('./group.route');
const groupPostRoutes = require('./groupPost.route');
const notificationRoutes = require('./notification.route');
const officeRoutes = require('./office.route');
const tutorialRoutes = require('./tutorial.route');
const userRoutes = require('./user.route');
const userMessageRoutes = require('./userMessage.route');
const userPostRoutes = require('./userPost.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

/**
 * api
 */
router.use('/chatGroups', chatGroupRoutes);
router.use('/chatGroupMessages', chatGroupMessageRoutes);
router.use('/comments', commentRoutes);
router.use('/contacts', contactRoutes);
router.use('/groups', groupRoutes);
router.use('/groupPosts', groupPostRoutes);
router.use('/notifications', notificationRoutes);
router.use('/offices', officeRoutes);
router.use('/tutorials', tutorialRoutes);
router.use('/users', userRoutes);
router.use('/userMessages', userMessageRoutes);
router.use('/userPosts', userPostRoutes);

module.exports = router;
