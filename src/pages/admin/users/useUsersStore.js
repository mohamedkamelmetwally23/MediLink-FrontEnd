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

function normalizeLoadedUser(user) {
  const savedActive = readPatientActiveStatuses()[getPatientUserId(user)];
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

  if (syncedUser.role !== "doctor" || !syncedUser.specialty) {
    return syncedUser;
  }

  return {
    ...syncedUser,
    specialty: normalizeSpecialtyLabel(syncedUser.specialty),
  };
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listUsers = scope === "patients" ? listPatients : listAllUsers;

  const commitUsers = (getNextUsers) => {
    setUsers((currentUsers) => {
      const nextUsers = getNextUsers(currentUsers);
      return nextUsers;
    });
  };

  const refreshUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const fetchedUsers = await listUsers();
      commitUsers(() => fetchedUsers.map(normalizeLoadedUser));
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
        commitUsers(() => fetchedUsers.map(normalizeLoadedUser));
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

  const toggleUserStatus = async (id) => {
    const targetUser = users.find((user) => userMatchesId(user, id));
    if (!targetUser) return;

    try {
      const response = await toggleUserActiveStatus(targetUser);
      const currentActive = getExplicitActiveValue(targetUser) ?? targetUser.status === "active";
      const nextStatus = getStatusFromToggleResponse(response, currentActive);
      const nextActive = nextStatus === "active";
      savePatientActiveStatus(targetUser, nextActive);
      commitUsers((currentUsers) =>
        currentUsers.map((user) =>
          userMatchesId(user, id)
            ? {
                ...user,
                status: nextStatus,
                active: nextActive,
                raw: {
                  ...user.raw,
                  active: nextActive,
                  status: nextStatus,
                  user:
                    user.raw?.user && typeof user.raw.user === "object"
                      ? {
                          ...user.raw.user,
                          active: nextActive,
                          status: nextStatus,
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
