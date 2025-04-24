import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1]; // extract token

    try {
        const decode = jwt.verify(token, JWT_SECRET);
        req.userId = decode.userId;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

export {
    authMiddleware
}
