/* global process */
import { getDb } from "./db.js";

// Decode JWT payload without signature verification (trusted internal use only)
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

function getPatientIdFromPayload(payload) {
  if (!payload) return null;
  return (
    payload.patientId ||
    payload.patient ||
    payload._id ||
    payload.id ||
    payload.userId ||
    payload.sub ||
    null
  );
}

const COMPLETED_STATUSES = new Set([
  "completed", "complete", "done", "finished", "finish",
  "attended", "closed", "مكتمل", "مكتملة", "تم الانتهاء",
  "تم الكشف", "تم الكشف عليه", "منتهي", "منتهية",
]);

function isCompleted(status) {
  return COMPLETED_STATUSES.has(String(status || "").trim().toLowerCase()) ||
    COMPLETED_STATUSES.has(String(status || "").trim());
}

function formatAppointment(doc) {
  const id = doc._id?.toString() || doc.id || "";
  const doctorObj = doc.doctor || doc.doctorId || {};
  const doctorName =
    (typeof doctorObj === "object"
      ? (doctorObj.name ||
          [doctorObj.firstName, doctorObj.lastName].filter(Boolean).join(" ").trim() ||
          doctorObj.user?.name || "")
      : "") || doc.doctorName || "";

  return {
    id,
    doctor: doctorName,   // matches RatingPopup's appointment.doctor
    doctorName,
    status: doc.status || doc.bookingStatus || "",
    isRated: doc.isRated ?? null,
    date: doc.date || doc.appointmentDate || "",
    raw: doc,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const payload = decodeJwt(token);
  const patientId = getPatientIdFromPayload(payload);

  if (!patientId) {
    return res.status(401).json({ error: "Could not identify patient from token" });
  }

  const onlyUnrated = req.query?.unrated === "true" || req.url?.includes("unrated=true");

  try {
    const db = await getDb(null, process.env);

    // Try to find the appointments collection (common names)
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name.toLowerCase());
    const apptCollection =
      ["appointments", "bookings", "appointment"].find((n) => collectionNames.includes(n)) ||
      "appointments";

    const collection = db.collection(apptCollection);
    const idStr = String(patientId);

    // Build query: match patient by multiple possible field paths
    const patientMatch = {
      $or: [
        { "patient._id": patientId },
        { "patient.id": idStr },
        { patientId: idStr },
        { patientId: patientId },
        { userId: idStr },
        { userId: patientId },
        { user: idStr },
        { user: patientId },
      ],
    };

    // Try ObjectId too if the ID looks like one
    const { ObjectId } = await import("mongodb");
    if (/^[a-f\d]{24}$/i.test(idStr)) {
      const oid = new ObjectId(idStr);
      patientMatch.$or.push(
        { "patient._id": oid },
        { patientId: oid },
        { userId: oid },
        { user: oid },
      );
    }

    const cursor = collection.find(patientMatch).sort({ createdAt: -1 }).limit(50);
    const docs = await cursor.toArray();

    const appointments = docs
      .map(formatAppointment)
      .filter((apt) => isCompleted(apt.status))
      .filter((apt) => !onlyUnrated || apt.isRated !== true);

    return res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
