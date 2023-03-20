import type { NextApiRequest, NextApiResponse } from "next";
import {
	ChatCompletionRequestMessage,
	Configuration,
	CreateChatCompletionResponse,
	OpenAIApi,
} from "openai";
import * as dotenv from "dotenv";

dotenv.config();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const call35Turbo = async (system: string, chat: string) => {
	let chatList: ChatCompletionRequestMessage[] = [];
	if (system) {
		chatList.push({ role: "system", content: system });
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
	const system = (req.query.system as string) || "";
	const chatmsg = req.query.chat as string;
	if (chatmsg.length <= 0) {
		res.status(500).json({ error: "no chat message" });
		return;
	}
	res.status(200).json({ chat: await call35Turbo(system, chatmsg) });
}
