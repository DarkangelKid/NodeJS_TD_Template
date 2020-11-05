const express = require('express');
const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const roleRoutes = require('./role.route');
const permissionRoutes = require('./permission.route');
const officeRoutes = require('./office.route');
const positionRoutes = require('./position.route');
const contactRoutes = require('./contact.route');
const chatGroupRoutes = require('./chatGroup.route');
const messageRoutes = require('./message.route');
const notificationRoutes = require('./notification.route');
const groupRoutes = require('./group.route');
const postRoutes = require('./post.route');
const commentRoutes = require('./comment.route');
const attachmentRoutes = require('./attachment.route');
const reactionRoutes = require('./reaction.route');
const datasyncRoutes = require('./datasync.route')
const noteRoutes = require('./note.route')

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));
router.use('/role', roleRoutes);
router.use('/permission', permissionRoutes);
router.use('/office', officeRoutes);
router.use('/position', positionRoutes);

router.use('/contact', contactRoutes);
router.use('/group', groupRoutes);
router.use('/chatgroup', chatGroupRoutes);
router.use('/message', messageRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/post', postRoutes);
router.use('/comment', commentRoutes);
router.use('/reaction', reactionRoutes);
router.use('/file', attachmentRoutes);

router.use('/notifi', notificationRoutes);

router.use('/datasync', datasyncRoutes);

router.use('/note', noteRoutes);



module.exports = router;
