import jwt from "jsonwebtoken";

// Function to generate a token for a user
export const generateToken = (userId)=>{
    const Token = jwt.sign({userId}, process.env.JWT_SECRET);
    return Token;
}