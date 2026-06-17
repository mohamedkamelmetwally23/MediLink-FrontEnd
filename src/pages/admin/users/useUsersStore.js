import { useEffect, useState } from "react";
import {
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
  listAllUsers,
  toggleUserActiveStatus,
  updateUser as apiUpdateUser,
} from "../../../services/medilinkApi";
import { normalizeSpecialtyLabel } from "./usersData";

function sameId(left, right) {
  return String(left) === String(right);
}

function normalizeLoadedUser(user) {
  if (user.role !== "doctor" || !user.specialty) {
    return user;
  }

  return {
    ...user,
    specialty: normalizeSpecialtyLabel(user.specialty),
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

export function useUsersStore() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const fetchedUsers = await listAllUsers();
      commitUsers(() => fetchedUsers.map(normalizeLoadedUser));
    } catch (requestError) {
      setError(requestError.message || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    listAllUsers()
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
  }, []);

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
    const currentUser = users.find((user) => sameId(user.id, id));
    const normalizedUser = normalizeUser({ ...currentUser, ...values });
    const updatedUser = await apiUpdateUser(id, normalizedUser, currentUser);
    const safeUser = stripSensitiveFields(normalizedUser);
    const nextUser = normalizeLoadedUser({
      ...updatedUser,
      ...safeUser,
      id: updatedUser.id || safeUser.id || id,
    });

    commitUsers((currentUsers) =>
      currentUsers.map((user) => (sameId(user.id, id) ? nextUser : user)),
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

  const toggleUserStatus = (id) => {
    const targetUser = users.find((user) => sameId(user.id, id));
    if (!targetUser) return;

    toggleUserActiveStatus(targetUser)
      .catch(() => null)
      .finally(() => {
        commitUsers((currentUsers) =>
          currentUsers.map((user) =>
            sameId(user.id, id)
              ? {
                  ...user,
                  status: user.status === "active" ? "inactive" : "active",
                }
              : user,
          ),
        );
      });
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

  const getUser = (id) => users.find((user) => sameId(user.id, id));

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
