const db = require('../../config/mssql');

exports.getAll = async (req, res) => {
    await db.offices.findAll().
        then(results => res.json(results))
        .catch(err => res.json({ err: err }));
}

exports.create = async (req, res) => {
    let body = req.body;
    await db.offices.create({
        parentId: body.parentId,
        name: body.name,
        code: body.code,
        description: body.description
    })
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.getById = async (req, res) => {
    await db.offices.findByPk(req.params.id)
        .then(results => res.json(result))
        .catch(err => res.json(err));
}

exports.update = async (req, res) => {
    let bd = req.body;

    await db.offices.update(
        {
            parentId: bd.parentId,
            name: bd.name,
            code: bd.code,
            description: bd.description
        }, {
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}

exports.delete = async (req, res) => {
    await db.offices.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}