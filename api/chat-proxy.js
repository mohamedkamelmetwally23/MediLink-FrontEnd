import {
  createChatProxyResponse,
  getClientKey,
  readJsonBody,
} from "./chat-proxy-core.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history } = readJsonBody(req);

  try {
    const result = await createChatProxyResponse({
      message,
      history,
      clientKey: getClientKey(req),
    });
    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
