import { useEffect, useState } from "react";
import {
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
  listAllUsers,
  listPatients,
  toggleUserActiveStatus,
  updateUser as apiUpdateUser,
} from "../../../services/medilinkApi";
import { normalizeSpecialtyLabel } from "./usersData";

const patientActiveStorageKey = "medilink-patient-active-statuses";
const userStatusNotesStorageKey = "medilink-user-status-notes";
const usersCacheKeyPrefix = "medilink-users-cache";

function sameId(left, right) {
  return String(left) === String(right);
}

function userMatchesId(user, id) {
  return (
    sameId(user.id, id) ||
    sameId(user.userId, id) ||
    sameId(user.profileId, id) ||
    sameId(user.raw?._id, id) ||
    sameId(user.raw?.user?._id, id) ||
    sameId(user.raw?.user?.id, id)
  );
}

function getExplicitActiveValue(user) {
  const values = [
    user?.active,
    user?.isActive,
    user?.user?.active,
    user?.receptionist?.active,
    user?.receptionist?.user?.active,
    user?.data?.active,
    user?.data?.user?.active,
    user?.data?.receptionist?.active,
    user?.data?.receptionist?.user?.active,
    user?.data?.data?.active,
    user?.data?.data?.user?.active,
    user?.data?.data?.receptionist?.active,
    user?.data?.data?.receptionist?.user?.active,
    user?.raw?.active,
    user?.raw?.isActive,
    user?.raw?.user?.active,
    user?.raw?.user?.isActive,
  ];

  const value = values.find((item) => item !== undefined && item !== null);

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    return !["false", "0", "inactive", "disabled", "blocked", "not active"].includes(
      normalizedValue,
    );
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return typeof value === "boolean" ? value : null;
}

function getPatientUserId(user) {
  return user?.userId || user?.raw?.user?._id || user?.raw?.user?.id || user?.id || "";
}

function getStatusUserId(user) {
  return user?.userId || user?.profileId || user?.raw?._id || user?.raw?.user?._id || user?.raw?.user?.id || user?.id || "";
}

function readPatientActiveStatuses() {
  if (typeof localStorage === "undefined") return {};

  try {
    const stored = JSON.parse(localStorage.getItem(patientActiveStorageKey) || "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

function savePatientActiveStatus(user, active) {
  const userId = getPatientUserId(user);
  if (!userId || typeof localStorage === "undefined") return;

  const statuses = readPatientActiveStatuses();
  localStorage.setItem(
    patientActiveStorageKey,
    JSON.stringify({
      ...statuses,
      [userId]: active,
    }),
  );
}

function readUserStatusNotes() {
  if (typeof localStorage === "undefined") return {};

  try {
    const stored = JSON.parse(localStorage.getItem(userStatusNotesStorageKey) || "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

function getUsersCacheKey(scope) {
  return `${usersCacheKeyPrefix}-${scope}`;
}

function readCachedUsers(scope) {
  if (typeof localStorage === "undefined") return [];

  try {
    const stored = JSON.parse(localStorage.getItem(getUsersCacheKey(scope)) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveCachedUsers(scope, users) {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(getUsersCacheKey(scope), JSON.stringify(users.slice(0, 100)));
  } catch {
    localStorage.removeItem(getUsersCacheKey(scope));
  }
}

function getUserStatusNote(user, statusNotes = readUserStatusNotes()) {
  const savedNote = statusNotes[getStatusUserId(user)];

  if (typeof savedNote === "string") return savedNote;

  return (
    user?.statusNote ||
    user?.inactiveNote ||
    user?.note ||
    user?.raw?.statusNote ||
    user?.raw?.inactiveNote ||
    user?.raw?.note ||
    user?.raw?.user?.statusNote ||
    user?.raw?.user?.inactiveNote ||
    user?.raw?.user?.note ||
    ""
  );
}

function saveUserStatusNote(user, note) {
  const userId = getStatusUserId(user);
  if (!userId || typeof localStorage === "undefined") return;

  const notes = readUserStatusNotes();

  if (note) {
    notes[userId] = note;
  } else {
    delete notes[userId];
  }

  localStorage.setItem(userStatusNotesStorageKey, JSON.stringify(notes));
}

function normalizeLoadedUser(
  user,
  patientActiveStatuses = readPatientActiveStatuses(),
  statusNotes = readUserStatusNotes(),
) {
  const savedActive = patientActiveStatuses[getPatientUserId(user)];
  const explicitActive =
    typeof savedActive === "boolean" && getExplicitActiveValue(user) === null
      ? savedActive
      : getExplicitActiveValue(user);
  const syncedUser =
    explicitActive === null
      ? user
      : {
          ...user,
          active: explicitActive,
          status: explicitActive ? "active" : "inactive",
        };
  const userWithStatusNote = {
    ...syncedUser,
    statusNote: getUserStatusNote(syncedUser, statusNotes),
  };

  if (userWithStatusNote.role !== "doctor" || !userWithStatusNote.specialty) {
    return userWithStatusNote;
  }

  return {
    ...userWithStatusNote,
    specialty: normalizeSpecialtyLabel(userWithStatusNote.specialty),
  };
}

function normalizeLoadedUsers(users) {
  const patientActiveStatuses = readPatientActiveStatuses();
  const statusNotes = readUserStatusNotes();

  return users.map((user) =>
    normalizeLoadedUser(user, patientActiveStatuses, statusNotes),
  );
}

function normalizeUser(values) {
  const user = {
    ...values,
    firstName: values.firstName?.trim() || "",
    lastName: values.lastName?.trim() || "",
    phone: values.phone?.trim() || "",
    status: values.status || "active",
  };

  if (!user.password) {
    delete user.password;
    delete user.confirmPassword;
  }

  return user;
}

function stripSensitiveFields(user) {
  const safeUser = { ...user };

  delete safeUser.password;
  delete safeUser.confirmPassword;
  delete safeUser.confirmpassword;

  return safeUser;
}

function getActiveFromToggleResponse(response) {
  return getExplicitActiveValue({
    ...response,
    raw: response?.data || response?.user || response?.patient || response,
  });
}

function getStatusFromToggleResponse(response, fallbackActive) {
  const responseActive = getActiveFromToggleResponse(response);

  if (responseActive !== null) {
    return responseActive ? "active" : "inactive";
  }

  const message = String(response?.message || response?.data?.message || "").toLowerCase();

  if (message.includes("inactive") || message.includes("deactive")) {
    return "inactive";
  }

  if (message.includes("active")) {
    return "active";
  }

  return fallbackActive ? "inactive" : "active";
}

export function useUsersStore(scope = "all") {
  const [users, setUsers] = useState(() => normalizeLoadedUsers(readCachedUsers(scope)));
  const [loading, setLoading] = useState(() => readCachedUsers(scope).length === 0);
  const [error, setError] = useState("");
  const listUsers = scope === "patients" ? listPatients : listAllUsers;

  const commitUsers = (getNextUsers) => {
    setUsers((currentUsers) => {
      const nextUsers = getNextUsers(currentUsers);
      return nextUsers;
    });
  };

  const refreshUsers = async () => {
    setLoading(users.length === 0);
    setError("");

    try {
      const fetchedUsers = await listUsers();
      const normalizedUsers = normalizeLoadedUsers(fetchedUsers);
      saveCachedUsers(scope, normalizedUsers);
      commitUsers(() => normalizedUsers);
    } catch (requestError) {
      setError(requestError.message || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    listUsers()
      .then((fetchedUsers) => {
        if (!mounted) return;
        const normalizedUsers = normalizeLoadedUsers(fetchedUsers);
        saveCachedUsers(scope, normalizedUsers);
        commitUsers(() => normalizedUsers);
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError.message || "");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [listUsers]);

  const addUser = async (values) => {
    const normalizedUser = normalizeUser(values);
    const createdUser = await apiCreateUser(normalizedUser);
    const safeUser = stripSensitiveFields(normalizedUser);
    const nextUser = normalizeLoadedUser({
      ...createdUser,
      ...safeUser,
      id: createdUser.id || safeUser.id || Date.now(),
    });

    commitUsers((currentUsers) => [nextUser, ...currentUsers]);
    return nextUser;
  };

  const updateUser = async (id, values) => {
    const currentUser = users.find((user) => userMatchesId(user, id));
    const normalizedUser = normalizeUser({ ...currentUser, ...values });
    const updatedUser = await apiUpdateUser(id, normalizedUser, currentUser);
    const safeUser = stripSensitiveFields(normalizedUser);
    const nextUser = normalizeLoadedUser({
      ...safeUser,
      ...updatedUser,
      id: updatedUser.id || safeUser.id || id,
    });

    commitUsers((currentUsers) =>
      currentUsers.map((user) => (userMatchesId(user, id) ? nextUser : user)),
    );

    return nextUser;
  };

  const deleteUsers = (ids) => {
    const idsSet = new Set(ids.map(String));
    const targetUsers = users.filter((user) => idsSet.has(String(user.id)));

    Promise.all(targetUsers.map(apiDeleteUser))
      .then(() => {
        commitUsers((currentUsers) =>
          currentUsers.filter((user) => !idsSet.has(String(user.id))),
        );
      })
      .catch((requestError) => {
        setError(requestError.message || "");
      });
  };

  const toggleUserStatus = async (id, options = {}) => {
    const targetUser = users.find((user) => userMatchesId(user, id));
    if (!targetUser) return;

    try {
      const statusNote = String(options.note || "").trim();
      const response = await toggleUserActiveStatus(targetUser, { note: statusNote });
      const currentActive = getExplicitActiveValue(targetUser) ?? targetUser.status === "active";
      const nextStatus = getStatusFromToggleResponse(response, currentActive);
      const nextActive = nextStatus === "active";
      const nextStatusNote = nextActive ? "" : statusNote;
      savePatientActiveStatus(targetUser, nextActive);
      saveUserStatusNote(targetUser, nextStatusNote);
      commitUsers((currentUsers) =>
        currentUsers.map((user) =>
          userMatchesId(user, id)
            ? {
                ...user,
                status: nextStatus,
                active: nextActive,
                statusNote: nextStatusNote,
                raw: {
                  ...user.raw,
                  active: nextActive,
                  status: nextStatus,
                  statusNote: nextStatusNote,
                  inactiveNote: nextStatusNote,
                  user:
                    user.raw?.user && typeof user.raw.user === "object"
                      ? {
                          ...user.raw.user,
                          active: nextActive,
                          status: nextStatus,
                          statusNote: nextStatusNote,
                          inactiveNote: nextStatusNote,
                        }
                      : user.raw?.user,
                },
              }
            : user,
          ),
      );
    } catch (requestError) {
      setError(requestError.message || "");
      throw requestError;
    }
  };

  const updateUsersSpecialty = (oldSpecialty, nextSpecialty) => {
    commitUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.role === "doctor" && user.specialty === oldSpecialty
          ? { ...user, specialty: nextSpecialty }
          : user,
      ),
    );
  };

  const clearUsersSpecialties = (specialties) => {
    const specialtiesSet = new Set(specialties);
    commitUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.role === "doctor" && specialtiesSet.has(user.specialty)
          ? { ...user, specialty: "" }
          : user,
      ),
    );
  };

  const getUser = (id) =>
    users.find((user) => userMatchesId(user, id));

  return {
    users,
    loading,
    error,
    refreshUsers,
    addUser,
    updateUser,
    deleteUsers,
    toggleUserStatus,
    updateUsersSpecialty,
    clearUsersSpecialties,
    getUser,
  };
}
