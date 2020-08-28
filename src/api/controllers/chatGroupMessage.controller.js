const db = require('../../config/mssql');

exports.getAll = async (req, res) => {
    await db.chatGroupMessages.findAll().
        then(results => res.json(results))
        .catch(err => res.json({ err: err }));
}

exports.create = async (req, res) => {
    let bd = req.body;
    await db.chatGroupMessages.create({
        userId: bd.userId,
        chatGroupId: bd.chatGroupId,
        content: bd.content
    })
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.getById = async (req, res) => {
    await db.chatGroupMessages.findByPk(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.update = async (req, res) => {
    let bd = req.body;

    await db.chatGroupMessages.update(
        {
            userId: bd.userId,
            chatGroupId: bd.chatGroupId,
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
    await db.chatGroupMessages.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}