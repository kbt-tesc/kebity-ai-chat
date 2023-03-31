import type { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

let openai: OpenAIApi;
let nowAPIKey: string = "";

const call35Turbo = async (
  system: string,
  chatHistory: ChatCompletionRequestMessage[],
  chat: string
) => {
  let chatList: ChatCompletionRequestMessage[] = [];

  if (system) {
    chatList.push({ role: "system", content: system });
  }
  if (chatHistory && chatHistory.length) {
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
  res: NextApiResponse
) {
  const apiKey = req.query.apikey as string;
  if (!openai || nowAPIKey !== apiKey) {
    nowAPIKey = apiKey;
    const configuration = new Configuration({
      apiKey: nowAPIKey,
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

  let chatHistory: ChatCompletionRequestMessage[] = [];
  if (historyLength) {
    const count = parseInt(historyLength);
    for (let index = 0; index < count; index++) {
      const type = req.query[`type${index}`] as string;
      const mes = req.query[`mes${index}`] as string;
      chatHistory.push({
        role: type == "user" ? "user" : "assistant",
        content: mes,
      });
    }
  }

  res
    .status(200)
    .json({ chat: await call35Turbo(system, chatHistory, chatmsg) });
}
