/* global process */

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
  createChatProxyResponse,
  createMedicalNoteResponse,
  createTranscriptionResponse,
  createTriageResponse,
  getClientKey,
  readNodeRequestJson,
} from "./api/chat-proxy-core.js";
import patientAppointmentsHandler from "./api/patient-appointments.js";

function medilinkDevApi(env) {
  const mergedEnv = { ...process.env, ...env };

  function sendJson(res, status, data) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  }

  return {
    name: "medilink-dev-api",
    configureServer(server) {
      // Direct MongoDB – patient appointments
      server.middlewares.use("/api/patient-appointments", async (req, res) => {
        process.env.MONGODB_URI = mergedEnv.MONGODB_URI || process.env.MONGODB_URI;
        process.env.MONGODB_DB = mergedEnv.MONGODB_DB || process.env.MONGODB_DB;
        try {
          await patientAppointmentsHandler(req, res);
        } catch (error) {
          sendJson(res, 500, { error: error.message });
        }
      });

      server.middlewares.use("/api/chat-proxy", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = await readNodeRequestJson(req);
          const result = await createChatProxyResponse({
            message: body.message,
            history: body.history,
            clientKey: getClientKey(req),
            env: mergedEnv,
          });

          sendJson(res, result.status, result.data);
        } catch (error) {
          sendJson(res, 500, { error: error.message });
        }
      });

      server.middlewares.use("/api/triage", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = await readNodeRequestJson(req);
          const result = await createTriageResponse({
            message: body.message,
            specialties: body.specialties,
            clientKey: getClientKey(req),
            env: mergedEnv,
          });

          sendJson(res, result.status, result.data);
        } catch (error) {
          sendJson(res, 500, { error: error.message });
        }
      });

      server.middlewares.use("/api/medical-note", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = await readNodeRequestJson(req);
          const result = await createMedicalNoteResponse({
            transcript: body.transcript,
            mode: body.mode,
            clientKey: getClientKey(req),
            env: mergedEnv,
          });

          sendJson(res, result.status, result.data);
        } catch (error) {
          sendJson(res, 500, { error: error.message });
        }
      });

      server.middlewares.use("/api/transcribe", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = await readNodeRequestJson(req);
          const result = await createTranscriptionResponse({
            audioBase64: body.audio,
            mimeType: body.mimeType,
            clientKey: getClientKey(req),
            env: mergedEnv,
          });

          sendJson(res, result.status, result.data);
        } catch (error) {
          sendJson(res, 500, { error: error.message });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [medilinkDevApi(env), react(), tailwindcss()],
  };
});
