const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const https = process.env.HTTPS === 'true'

const findUser = async (fastify ,username) => {
    const user = await fastify.pg.query('SELECT id, hash FROM users WHERE username = $1', [username]);
    return user.rows[0];
}

const jwtGenerate = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_LIFETIME});
    const refreshToken = jwt.sign({userId}, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_LIFETIME});
    return { accessToken, refreshToken }
}

const registration = async (fastify, req, reply) => {
    const {username, password, email} = req.body;
    try {
        const hashedPassword = await  bcrypt.hash(password, 10);

        const user = await findUser(fastify, username);
        if (user) {
            reply.code(401).send({ message: 'User already exist' });
            return;
        }

        const result = await fastify.pg.query('INSERT INTO users (username, hash, email) VALUES ($1, $2, $3) RETURNING id',
            [username, hashedPassword, email]);
        const userId = result.rows[0].id;

        const { accessToken, refreshToken } = jwtGenerate(userId);
        reply.setCookie('accessToken', accessToken, {
            httpOnly: false,
            secure: https,
            sameSite: 'lax',
            path: '/'
        }).setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: https,
            sameSite: 'lax',
            path: '/'
        }).code(201).send({
            message: 'Registration confirmed',
            token: accessToken
        })
    } catch (err) {
        reply.code(500).send({message: 'Server error!'})
    }
}

const login = async (fastify, req, reply) => {
    const {username, password} = req.body;
    try {
        const user = await findUser( fastify, username,);
        if (!user) {
            reply.code(401).send({ message: "Invalid username or password" });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.hash);
        if (!isValidPassword) {
            reply.code(401).send({ message: "Invalid username or password" });
            return;
        }
        const userId = user.id

        const { accessToken, refreshToken } = jwtGenerate(userId)
        reply.setCookie('accessToken', accessToken, {
            httpOnly: false,
            secure: https,
            sameSite: 'lax',
            path: '/'
        }).setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: https,
            sameSite: 'lax',
            path: '/'
        }).code(201).send({
            message: 'Login confirmed',
            token: accessToken
        })

    } catch (err) {
        reply.code(500).send({message: 'Server error!'})
    }
}

const refreshToken = async (req, reply) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken) {
            reply.code(401).send({message: 'No refresh token provided'});
            return;
        }

        const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = jwt.sign({userId: decodedToken.userId}, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_LIFETIME })
        reply
            .clearCookie('accessToken')
            .setCookie('accessToken', accessToken, {httpOnly: false, secure: https, sameSite: 'lax', path: '/'})
            .code(201)
            .send({ message: 'Access token refreshed' });


    } catch (err) {
        reply.code(500).send({message: 'Server error!'})
    }
}

const logout = (req, reply) => {
    try {
        reply.clearCookie('accessToken').clearCookie('refreshToken').send({ message: 'Logout successful' })
    }
    catch (err) {
        reply.code(500).send({message: 'Server error!'})
    }
}

module.exports = { registration, login, refreshToken, logout}
