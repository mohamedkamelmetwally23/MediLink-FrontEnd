import { useState } from "react";
import { initialUsers } from "./usersData";

const STORAGE_KEY = "medilink-admin-users";

function loadUsers() {
  try {
    const savedUsers = localStorage.getItem(STORAGE_KEY);
    if (!savedUsers) {
      return initialUsers;
    }

    const parsedUsers = JSON.parse(savedUsers);
    return parsedUsers.map((user) => {
      const seedUser = initialUsers.find((item) => item.id === user.id);
      return seedUser ? { ...seedUser, ...user } : user;
    });
  } catch {
    return initialUsers;
  }
}

function persistUsers(nextUsers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUsers));
}

function normalizeUser(values) {
  const user = {
    ...values,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    status: values.status || "active",
  };

  delete user.confirmPassword;
  if (!user.password) {
    delete user.password;
  }

  return user;
}

export function useUsersStore() {
  const [users, setUsers] = useState(loadUsers);

  const commitUsers = (getNextUsers) => {
    setUsers((currentUsers) => {
      const nextUsers = getNextUsers(currentUsers);
      persistUsers(nextUsers);
      return nextUsers;
    });
  };

  const addUser = (values) => {
    commitUsers((currentUsers) => [
      {
        ...normalizeUser(values),
        id: Date.now(),
      },
      ...currentUsers,
    ]);
  };

  const updateUser = (id, values) => {
    commitUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === Number(id)
          ? { ...user, ...normalizeUser(values), id: user.id }
          : user,
      ),
    );
  };

  const deleteUsers = (ids) => {
    const idsSet = new Set(ids.map(Number));
    commitUsers((currentUsers) =>
      currentUsers.filter((user) => !idsSet.has(user.id)),
    );
  };

  const toggleUserStatus = (id) => {
    commitUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === Number(id)
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user,
      ),
    );
  };

  const getUser = (id) => users.find((user) => user.id === Number(id));

  return {
    users,
    addUser,
    updateUser,
    deleteUsers,
    toggleUserStatus,
    getUser,
  };
}
