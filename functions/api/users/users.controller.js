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

module.exports = {
    getCurrentUser
}