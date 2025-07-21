import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const hashPassword = (password) => {
    return bcrypt.hash(password, 10);
}

export const comparePassword = (password, hash) => {
    return bcrypt.compare(password, hash);
}

export const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: '1d'});
}

export const getConversationId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('-');
}
