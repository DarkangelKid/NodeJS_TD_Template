const db = require('../../config/mssql');
const { omit } = require('lodash');

const Tutorial = db.tutorials;
const Comment = db.comments;

const createTutorial = (tutorial) =>
  Tutorial.create({
    title: tutorial.title,
    description: tutorial.description,
  })
    .then((tutorial) => {
      console.log(`>> Created tutorial: ${JSON.stringify(tutorial, null, 4)}`);
      return tutorial;
    })
    .catch((err) => {
      console.log('>> Error while creating tutorial: ', err);
    });

exports.createComment = (tutorialId, comment) =>
  Comment.create({
    name: comment.name,
    text: comment.text,
    tutorialId,
  })
    .then((comment) => {
      console.log(`>> Created comment: ${JSON.stringify(comment, null, 4)}`);
      return comment;
    })
    .catch((err) => {
      console.log('>> Error while creating comment: ', err);
    });

exports.findTutorialById = (tutorialId) =>
  Tutorial.findByPk(tutorialId, { include: ['comments'] })
    .then((tutorial) => tutorial)
    .catch((err) => {
      console.log('>> Error while finding tutorial: ', err);
    });

exports.findCommentById = (id) =>
  Comment.findByPk(id, { include: ['tutorial'] })
    .then((comment) => comment)
    .catch((err) => {
      console.log('>> Error while finding comment: ', err);
    });

exports.findAll = () =>
  Tutorial.findAll({
    include: ['comments'],
  }).then((tutorials) => tutorials);

exports.register = async (req, res, next) => {
  try {
    const userData = omit(req.body, 'role');
    console.log(userData);

    const tut1 = await createTutorial(userData);
    return res.json({ tut1 });
  } catch (error) {
    return next(error);
  }
};
