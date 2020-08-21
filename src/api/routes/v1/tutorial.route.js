const express = require('express');
const controller = require('../../controllers/tutorial.controller');

const router = express.Router();

router.route('/').get(controller.getAll);

router.route('/').post(controller.create);

router.route('/:id/').get(controller.getById);

router.route('/:id').put(controller.update);

router.route('/:id').delete(controller.delete);

module.exports = router;