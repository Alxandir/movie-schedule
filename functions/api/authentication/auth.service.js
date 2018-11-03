const firebase = require('../firebase/firebase.controller');

const authenticate = async function (req, res, next) {
    console.log(req.headers.authorization);
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).send('Invalid token');
    }
    const token = req.headers.authorization.replace('Bearer ', '');
    try {
        const googleUser = await firebase.verifyToken(token);
        const dbUsers = await firebase.getUserByField('googleID', googleUser.uid);
        if(!dbUsers || dbUsers.length === 0) {
            res.status(401).send('User not found');
        }
        const user = dbUsers[0];
        req.user = {
            id: user._id,
            group: user.group
        }
        return next();
    } catch (err) {
        console.log(err);
        res.status(401).send(err);
    }
}

module.exports = {
    authenticate
}
