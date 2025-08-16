import jwt from "jsonwebtoken";


const secret = process.env.SECRET;

if (!secret) {
    console.error("SECRET is not defined in .env file");
    process.exit(1);
}

export function generateJwt(data, expiration = '1h'){
    return jwt.sign({
            data: data
        },
        secret,
        {expiresIn: expiration,
                algorithm: "HS512",
                },
    );
}

export function verifyJwt(token) {
    return jwt.verify(token, secret, {algorithm: "HS512"}).data;
}