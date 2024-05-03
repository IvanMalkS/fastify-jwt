const jwt = require('jsonwebtoken');
module.exports = fastify => {
    fastify.decorate('verifyToken', async (request, reply)=> {
        try {
            const bearer = request.headers.authorization.split(' ')[0]
            const token = request.headers.authorization.split(' ')[1]
            if (bearer !== 'Bearer') {
                reply.code(401).send({message: 'Invalid token'});
                return;
            }
            request.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        } catch (err) {
            reply.code(401).send({message: 'Invalid token'});
        }
    })
}
