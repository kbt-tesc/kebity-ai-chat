import { createCipheriv, randomBytes, scryptSync } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import * as dotenv from "dotenv";

dotenv.config();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const apiKey = req.query.apiKey as string;
	res.status(200).json(getEncryptedKey(apiKey));
}

const algorithm = "aes-256-cbc";
const salt = process.env.CRYPT_SALT as string;
const password = process.env.CRYPT_PASSWORD as string;

function getEncryptedKey(api: string) {
	const key = scryptSync(password, salt, 32);
	const iv = randomBytes(16);
	const cipher = createCipheriv(algorithm, key, iv);
	const cipheredData = cipher.update(Buffer.from(api));
	const finalBuf = Buffer.concat([iv, cipheredData, cipher.final()]);
	const finalData = finalBuf.toString("base64");
	console.log("use key encrypted.");
	return { encryptedKey: finalData };
}
