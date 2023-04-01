import { createDecipheriv, scryptSync } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";

dotenv.config();
let openai: OpenAIApi;
let nowAPIKey: string = "";

const call35Turbo = async (
	system: string,
	chatHistory: ChatCompletionRequestMessage[],
	chat: string,
) => {
	let chatList: ChatCompletionRequestMessage[] = [];

	if (system) {
		chatList.push({ role: "system", content: system });
	}
	if (chatHistory?.length) {
		chatList = chatList.concat(chatHistory);
	}
	chatList.push({ role: "user", content: chat });

	// rome-ignore lint/suspicious/noExplicitAny: <explanation>
	const completion: any = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: chatList,
	});
	const ret_str = completion.data.choices[0].message.content;
	return ret_str;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const apiKey = req.query.apikey as string;

	if (!openai || nowAPIKey !== apiKey) {
		nowAPIKey = apiKey;
		const configuration = new Configuration({
			apiKey: getDecryptedKey(nowAPIKey),
		});
		openai = new OpenAIApi(configuration);
	} else if (!apiKey) {
		res.status(500).json({ error: "no api key" });
		return;
	}

	const system = (req.query.system as string) || "";
	const chatmsg = req.query.chat as string;
	const historyLength = req.query.length as string;
	console.log(req.query);
	if (chatmsg.length <= 0) {
		res.status(500).json({ error: "no chat message" });
		return;
	}

	const chatHistory: ChatCompletionRequestMessage[] = [];
	if (historyLength) {
		const count = parseInt(historyLength);
		for (let index = 0; index < count; index++) {
			const type = req.query[`type${index}`] as string;
			const mes = req.query[`mes${index}`] as string;
			chatHistory.push({
				role: type === "user" ? "user" : "assistant",
				content: mes,
			});
		}
	}
	const response = await call35Turbo(system, chatHistory, chatmsg);
	res.status(200).json({ chat: response });
}

const algorithm = "aes-256-cbc";
const salt = process.env.CRYPT_SALT as string;
const password = process.env.CRYPT_PASSWORD as string;

function getDecryptedKey(encryptKey: string) {
	const encryptBuf = Buffer.from(encryptKey, "base64");
	const iv = encryptBuf.slice(0, 16);
	const encryptData = encryptBuf.slice(16);
	const key = scryptSync(password, salt, 32);

	const cipher = createDecipheriv(algorithm, key, iv);
	const cipheredData = cipher.update(encryptData);
	const finalBuf = Buffer.concat([cipheredData, cipher.final()]);
	const finalData = finalBuf.toString("utf8");
	console.log("use key encrypted.");
	return finalData;
}
