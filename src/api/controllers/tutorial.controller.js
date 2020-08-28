const db = require('../../config/mssql');

exports.getAll = async (req, res) => {
    await db.tutorials.findAll().
        then(results => res.json(results))
        .catch(err => res.json({ err: err }));
}

exports.create = async (req, res) => {
    let bd = req.body;
    await db.tutorials.create({
        title: bd.title,
        description: bd.description,
        published: bd.published,
    })
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.getById = async (req, res) => {
    await db.tutorials.findByPk(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err));
}

exports.update = async (req, res) => {
    let bd = req.body;

    await db.tutorials.update(
        {
            title: bd.title,
            description: bd.description,
            published: bd.published,
        }, {
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}

exports.delete = async (req, res) => {
    await db.tutorials.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(id => res.json(id))
        .catch(err => res.json(err));
}