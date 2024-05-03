const {registration, login, refreshToken, logout} = require("../controllers/authController");
const {getAllUsers, getUserById} = require("../controllers/usersController");
module.exports = function (fastify, opts, done) {
    fastify.route({
        method: 'POST',
        url: '/api/auth/register',
        handler: (req, reply) => registration(fastify,req, reply)
    });

    fastify.route({
        method: 'POST',
        url: '/api/auth/login',
        handler: (req, reply) => login(fastify, req,reply)
    });

    fastify.route({
        method: 'POST',
        url: '/api/auth/refresh-token',
        handler: (req, reply) => refreshToken(req, reply)
    });

    fastify.route({
        method: 'POST',
        url: '/api/auth/logout',
        handler: (req, reply) => logout(req, reply)
    });

    fastify.route({
        method: "GET",
        url: '/api/users/',
        handler: (req, reply) => getAllUsers(fastify, req, reply)
    });


    fastify.route({
        method: 'GET',
        url: '/api/users/:id',
        preHandler: [fastify.verifyToken],
        handler: (req, reply) => getUserById(fastify, req, reply)
    })

    done();
}
