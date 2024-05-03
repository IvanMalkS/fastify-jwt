
const getAllUsers = async (fastify, req, reply) => {
    try {
        const result = await fastify.pg.query('SELECT id, username FROM users');
        reply.send(result.rows);
    } catch (err) {
        reply.code(500).send({message: 'Server error' })
    }
}

const getUserById = async (fastify, req, reply) => {
    const { id } = req.params;
    try {
        const result = await fastify.pg.query('SELECT id, username, email, secret FROM users WHERE id = $1'
            ,[id]);
        if (!result) {
            reply.code(404).send({message: "This user does not exist"});
        }
        reply.send(result.rows[0]);

    } catch (err) {
        console.log(err)
        reply.code(500).send({message: 'Server error' })
    }

}

module.exports = {getAllUsers, getUserById}
