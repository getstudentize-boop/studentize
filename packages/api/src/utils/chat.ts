import { UIMessage } from "ai";

export const convertMessageToContent = (message: UIMessage) => {
  return message.parts
    .filter((m) => m.type === "text")
    .map((m) => m.text)
    .join("\n");
};
