import jwt from 'jsonwebtoken';

export default async function loginController (req, res) {
    try {
        const user = { id: req.user.user_id, name: req.user.name, surname: req.user.surname, type: req.user.type };
        const token = await jwt.sign(user, process.env.SECRET)

        res.status(200).json({jwt: token, user : user});
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ message: "INTERNAL_ERROR" });
    }
}