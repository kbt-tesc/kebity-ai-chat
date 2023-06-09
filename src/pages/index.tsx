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

import React, { useState, useEffect, InputHTMLAttributes } from "react";
import Button from "../components/Button";
import TextBox from "../components/TextBox";
import axios from "axios";
import styles from "../styles/index.module.css";
import { StringDecoder } from "string_decoder";

interface chatMessageDisplayInterface {
  messageId: number;
  type: string;
  message: string;
}

const ChatGptApiTest = () => {
  const [chatMessages, setChatMessage] = useState<
    chatMessageDisplayInterface[]
  >([]);
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [inputChatMessage, setInputChatMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputApiKey, setInputApiKey] = useState<string>("");
  const [encryptKey, setEncryptKey] = useState<string>("");

  const callAI = async () => {
    setIsLoading(true);
    const system: string = systemMessage ? systemMessage : "";
    const chat: string = inputChatMessage ? inputChatMessage : "";

    listUp(chat, "user");
    const client = axios.create();
    client.defaults.timeout = 40000;

    client
      .get("/api/chatgpt", {
        params: {
          apikey: encryptKey,
          system: system,
          chat: chat,
          ...getChatMessageForAPI(),
        },
        timeout: 30000,
      })
      .then((res: { data: any }) => {
        const data = res.data;
        console.log(data);
        console.log(data.chat);

        listUp(data.chat, "chat");
      })
      .catch((error: string) => {
        listUp(error, "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const listUp = (mes: string, type: string) => {
    console.info("mes", mes, "type", type);
    setChatMessage((prevList) => {
      const newList = [
        ...prevList,
        { messageId: prevList.length, type: type, message: String(mes).trim() },
      ];
      return newList;
    });
  };

  const onSystemInputHandler = (value: string) => {
    setSystemMessage((prevInput) => {
      localStorage.setItem("systemMessage", value);
      return value;
    });
  };

  const getNtoBrMessage = (mesId: number, text: string) => {
    console.info("mesId", mesId, typeof mesId, "text", text, typeof text);
    return String(text)
      .split("\n")
      .map((line, index) => {
        return (
          <React.Fragment key={`${mesId}_${index}`}>
            {line}
            <br />
          </React.Fragment>
        );
      });
  };

  useEffect(() => {
    setSystemMessage(localStorage.getItem("systemMessage") || "");
    setEncryptKey(localStorage.getItem("encryptedKey") || "")
  }, [systemMessage]);

  useEffect(() => {
    const container = document.getElementById("chatMessageDisplayContainer");
    if (!container) return;
    container.scrollTo(0, container.scrollHeight);
  }, [chatMessages]);

  const getChatMessageForAPI = () => {
    var query = {};
    var length = 0;
    chatMessages.forEach((elm, index) => {
      const objName = `type${index}`;
      const objMes = `mes${index}`;
      length = index + 1;
      query = {
        ...query,
        [objName]: elm.type === "user" ? "user" : "assistant",
        [objMes]: elm.message,
      };
    });
    query = {
      ...query,
      length,
    };
    return query;
  };

  const saveClickHandler = async () => {
    setIsLoading(true);

    await axios
      .get("/api/crypt", {
        params: {
          apiKey: inputApiKey
        }
      })
      .then((res) => {
        const data = res.data;
        setEncryptKey(oldValue => {
          const key = data.encryptedKey as string;
          localStorage.setItem("encryptedKey", key);
          return key;
        });
        setInputApiKey("")

      })
      .catch((error: string) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const clearClickHandler = async () => {
    setEncryptKey("");
  }

  const getEncryptKey = () => {
    console.log(encryptKey)
    return encryptKey;
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.chatSystemMessageContainer}>
        <TextBox
          id="systemTextbox"
          className={styles.systemMessageBox}
          placeholder="設定の表記"
          onChange={(e) => onSystemInputHandler(e.target.value)}
          value={systemMessage}
        />
      </div>
      <div
        id="chatMessageDisplayContainer"
        className={styles.chatMessageDisplayContainer}
      >
        {chatMessages.map((elm) => {
          if (elm.type === "user") {
            return (
              <React.Fragment key={elm.messageId}>
                <p className={styles.userChatMessages}>
                  {getNtoBrMessage(elm.messageId, elm.message)}
                </p>
                <hr className={styles.chatBoder} />
              </React.Fragment>
            );
          } else if (elm.type === "chat") {
            return (
              <React.Fragment key={elm.messageId}>
                <p className={styles.chatMessages} key={elm.messageId}>
                  {getNtoBrMessage(elm.messageId, elm.message)}
                </p>
                <hr className={styles.chatBoder} />
              </React.Fragment>
            );
          } else if (elm.type === "error") {
            return (
              <React.Fragment key={elm.messageId}>
                <p className={styles.errorMessages} key={elm.messageId}>
                  {getNtoBrMessage(elm.messageId, elm.message)}
                </p>
                <hr className={styles.chatBoder} />
              </React.Fragment>
            );
          }
        })}
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
          disabled={
            !(encryptKey && inputChatMessage) || isLoading
          }
        >
          {isLoading ? "loading" : "ChatGPTへ送る"}
        </Button>
      </div>

      <div className={styles.apiInputContainer}>
        {encryptKey ? <div className={styles.apiInputBox} /> :
          <input
            id="inputApiKeyBox"
            className={styles.apiInputBox}
            placeholder="API 入力"
            autoComplete="current-passoword"
            onChange={(e) => setInputApiKey(e.target.value)}
            value={inputApiKey}
            disabled={encryptKey ? true : false}
          />}
        <p>{encryptKey ? 'Key保存済み' : ''}</p>
        <button className={styles.apiSaveButton}
          onClick={(e) => saveClickHandler()}
          disabled={!inputApiKey ? true : false}>保存</button>
        <button className={styles.apiSaveButton}
          onClick={(e) => clearClickHandler()}
          disabled={!encryptKey ? true : false}>再入力</button>
      </div>
    </main>
  );
};

export default ChatGptApiTest;
