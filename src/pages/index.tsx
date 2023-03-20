/**
 * ChatGPT API（gpt-3.5-turbo）を Node.js から使ってみる（公式リファレンスで参照した情報も記載）
 * https://qiita.com/youtoy/items/b3e2e462029bf40f8a1a
 * 　このコードをベースに。
 * $ npm i openai
 *
 * https://platform.openai.com/docs/api-reference/chat/create?lang=node.js
 *  これ、Example requestの右上にcurl, python, node.jsの選択がある！これは気が付かんわー
 *
 * https://openai.com/product
 *
 * https://platform.openai.com/account/api-keys
 *
 * https://twitter.com/yanosen_jp/status/1631074488363384832
 *
 * https://qiita.com/youtoy/items/84384ad7a742ea1ce8f5
 *
 * https://platform.openai.com/docs/libraries/node-js-library
 *
 * https://platform.openai.com/docs/api-reference/authentication
 *
 * https://platform.openai.com/docs/api-reference/searches
 */

import React, { useState, useEffect, useReducer } from "react";
import Button from "../components/Button";
import TextBox from "../components/TextBox";
import axios from "axios";
import styles from '../styles/index.module.css'

interface chatMessageDisplayInterface {
  messageId: number,
  type: string,
  message: string
}

interface messageIdInterface {
  messageId: number
}

interface messageIdAction {
  type: string
}

const ChatGptApiTest = () => {
  const [chatMessages, setChatMessage] = useState<chatMessageDisplayInterface[]>([]);
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [inputChatMessage, setInputChatMessage] = useState<string>("");

  const callAI = async () => {

    const system: string = systemMessage ? systemMessage : "";
    const chat: string = inputChatMessage ? inputChatMessage : "";

    listUp(chat, 'user');

    const res = await axios.get('/api/chatgpt',
      {
        params: {
          system: encodeURI(system),
          chat: encodeURI(chat)
        }
      }
    );

    const data = await res.data;
    console.log(data);
    console.log(data.chat);

    listUp(data.chat, 'chat');
  };

  const listUp = (mes: string, type: string) => {
    setChatMessage((prevList) => {
      const newList = [...prevList, { messageId: prevList.length, type: type, message: mes.trim() }];
      return newList
    });
  };

  const getNtoBrMessage = (mesId: number, text: string) => {
    return text.split('\n').map((line, index) => {
      return (
        <React.Fragment key={`${mesId}_${index}`}>
          {line}
          < br />
        </React.Fragment >
      );
    })
  }

  useEffect(() => {
    const container = document.getElementById("chatMessageDisplayContainer");
    if (!container) return;
    container.scrollTo(0, container.scrollHeight);
  }, [chatMessages])

  return (
    <main className={styles.mainContainer}>
      <div className={styles.chatSystemMessageContainer}>
        <TextBox
          id="systemTextbox"
          className={styles.systemMessageBox}
          placeholder="設定の表記"
          onChange={(e) => setSystemMessage(e.target.value)}
        />
      </div>
      <div id="chatMessageDisplayContainer" className={styles.chatMessageDisplayContainer}>
        {
          chatMessages.map(elm => {
            if (elm.type === "user") {
              return (
                <React.Fragment key={elm.messageId}>
                  <p className={styles.userChatMessages}>
                    {elm.messageId} {getNtoBrMessage(elm.messageId, elm.message)}
                  </p>
                  <hr className={styles.chatBoder} />
                </React.Fragment>
              )
            } else {
              return (
                <React.Fragment key={elm.messageId}>
                  <p className={styles.chatMessages}>
                    {elm.messageId} {getNtoBrMessage(elm.messageId, elm.message)}
                  </p>
                  <hr className={styles.chatBoder} />
                </React.Fragment>
              )
            }
          })
        }
      </div>
      <div className={styles.chatMessageOutContainer}>
        <TextBox
          id="chatTextbox"
          className={styles.chatMessageBox}
          placeholder="何か質問を入力"
          onChange={(e) => setInputChatMessage(e.target.value)}
        />

        <Button
          type="button"
          className={styles.chatMessageOutButton}
          onClick={() => {
            callAI();
          }}
        >
          ChatGPTへ送る
        </Button>
      </div>

    </main >
  );
};

export default ChatGptApiTest;