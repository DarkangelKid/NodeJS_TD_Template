const db = require('../../config/mssql');

exports.getAll = async (req, res) => {
    await db.users.findAll().
        then(results => res.json(results))
        .catch(err => res.json({ err: err }));
}

exports.create = async (req, res) => {
    let bd = req.body;
    await db.users.create({
        userName: bd.userName,
        email: bd.email,
        password: bd.password,
        firstName: bd.firstName,
        lastName: bd.lastName,
        avatarUrl: bd.avatarUrl,
        position: bd.position,
        officeId: bd.officeId
    })
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.getById = async (req, res) => {
    await db.users.findAll({
        where: {
            id: req.params.id
        }
    })
        .then(results => res.json(results[0]))
        .catch(err => res.json(err));
}

exports.update = async (req, res) => {
    let bd = req.body;

    await db.users.update(
        {
            userName: bd.userName,
            email: bd.email,
            password: bd.password,
            firstName: bd.firstName,
            lastName: bd.lastName,
            avatarUrl: bd.avatarUrl,
            position: bd.position,
            officeId: bd.officeId
        }, {
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}

exports.delete = async (req, res) => {
    await db.users.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}