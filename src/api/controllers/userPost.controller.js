const db = require('../../config/mssql');

exports.getAll = async (req, res) => {
    await db.userPosts.findAll().
        then(results => res.json(results))
        .catch(err => res.json({ err: err }));
}

exports.create = async (req, res) => {
    let bd = req.body;
    await db.userPosts.create({
        userId: bd.userId,
        attachments: bd.attachments,
        content: bd.content
    })
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.getById = async (req, res) => {
    await db.userPosts.findByPk(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.update = async (req, res) => {
    let bd = req.body;
    await db.userPosts.update(
        {
            userId: bd.userId,
            attachments: bd.attachments,
            content: bd.content
        }, {
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}

exports.delete = async (req, res) => {
    await db.userPosts.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}