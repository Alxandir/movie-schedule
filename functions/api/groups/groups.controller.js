const database = require('../firebase/firebase.controller');

const getCurrentUserGroup = async function(req, res) {
    try {
        const group = await database.getGroup(req.user.group);
        group.id = req.user.group;
        const users = await database.getUserByField('group', req.user.group);
        console.log(eval);
        if(group) {
            users.map(p => { delete p.googleID; delete p._id });
            group.users = users;
            return res.status(200).send(group);
        }
        res.status(404).send('User group not found');
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const getUserGroup = async function(req, res) {
    try {
        const group = await database.getGroup(req.params.id);
        if(group) {
            return res.status(200).send(group);
        }
        res.status(404).send('User group not found');
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports = {
    getCurrentUserGroup,
    getUserGroup
}