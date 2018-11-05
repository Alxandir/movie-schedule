const database = require('../firebase/firebase.controller');

const getCurrentUser = async function(req, res) {
    try {
        const user = await database.getUser(req.user.id);
        if(user) {
            delete user.googleID;
            delete user._id;
            return res.status(200).send(user);
        }
        res.status(404).send('User not found');
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const createUser = async function(req, res) {
    const user = req.body;
    if(!user || !user.firstName || !user.lastName || !user.googleID) {
        return req.status(407).send({success: false, error: 'Invalid params'});
    }
    try {
        if(!user.group || user.group.length === 0) {
            const group = {
                name: user.groupName,
                siteId: user.siteId
            }
            delete user.groupName;
            delete user.siteId;
            const groupResult = await database.createGroup(group);
            user.group = groupResult.id;
        }
        await database.createUser(user);
        return res.status(200).send({ success: true, message: 'User successfully created'});
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports = {
    getCurrentUser,
    createUser
}