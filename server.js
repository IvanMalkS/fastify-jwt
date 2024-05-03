const fastify = require('fastify')()
require('dotenv').config()
const authDecorate = require('./decorators/authDecrator.js')

fastify.register(require('@fastify/postgres'), {
    connectionString: process.env.DB_CONNECTION_STRING
})

fastify.register(require('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET
})

fastify.register(require('@fastify/cors'), {
    origin: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
})

authDecorate(fastify);

fastify.register(require('./routes'))

fastify.listen({port: parseInt(process.env.SERVER_PORT)}, err => {
    if (err) throw err;
    console.log(`Server is running on port: ${fastify.server.address().port}`)
})
