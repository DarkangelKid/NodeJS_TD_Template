const db = require('../../config/mssql');

exports.getAll = async (req, res) => {
    await db.notifications.findAll().
        then(results => res.json(results))
        .catch(err => res.json({ err: err }));
}

exports.create = async (req, res) => {
    let bd = req.body;
    await db.notifications.create({
        receiverId: bd.receiverId,
        content: bd.content,
    })
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.getById = async (req, res) => {
    await db.notifications.findAll({
        where: {
            id: req.params.id
        }
    })
        .then(results => res.json(results[0]))
        .catch(err => res.json(err));
}

exports.update = async (req, res) => {
    let bd = req.body;

    await db.notifications.update(
        {
            receiverId: bd.receiverId,
            content: bd.content,
        }, {
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}

exports.delete = async (req, res) => {
    await db.notifications.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}