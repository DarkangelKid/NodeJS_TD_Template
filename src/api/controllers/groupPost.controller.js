const db = require('../../config/mssql');

exports.getAll = async (req, res) => {
    await db.groupPosts.findAll().
        then(results => res.json(results))
        .catch(err => res.json({ err: err }));
}

exports.create = async (req, res) => {
    let bd = req.body;
    await db.groupPosts.create({
        userId: bd.userId,
        postId: bd.postId,
        content: bd.content,
        attachments: bd.attachments
    })
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.getById = async (req, res) => {
    await db.groupPosts.findAll({
        where: {
            id: req.params.id
        }
    })
        .then(results => res.json(results[0]))
        .catch(err => res.json(err));
}

exports.update = async (req, res) => {
    let bd = req.body;

    await db.groupPosts.update(
        {
            userId: bd.userId,
            postId: bd.postId,
            content: bd.content,
            attachments: bd.attachments
        }, {
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}

exports.delete = async (req, res) => {
    await db.groupPosts.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}