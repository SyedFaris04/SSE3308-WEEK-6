
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

import "./App.css";

function App() {
  // Authentication states
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Login and registration states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Task states
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [editId, setEditId] = useState(null);

  // Message state
  const [message, setMessage] = useState("");

  // 1. Monitor authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // 2. Register a new user
  async function register() {
    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      setMessage("Registration successful!");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // 3. Login
  async function login() {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setMessage("Login successful!");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // 4. Logout
  async function logout() {
    try {
      await signOut(auth);
      setTasks([]);
      setMessage("Logged out.");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // 5. Read tasks from Firestore in real time
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const taskRef = collection(
      db,
      "users",
      user.uid,
      "tasks"
    );

    const unsubscribe = onSnapshot(
      taskRef,
      (snapshot) => {
        const taskList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));

        setTasks(taskList);
      },
      (error) => setMessage(error.message)
    );

    return () => unsubscribe();
  }, [user]);

  // 6. Create a task or update an existing task
  async function saveTask() {
    if (!user || !taskName.trim()) {
      setMessage("Please enter a task name.");
      return;
    }

    try {
      if (editId) {
        await updateDoc(
          doc(db, "users", user.uid, "tasks", editId),
          { name: taskName.trim() }
        );

        setMessage("Task updated!");
        setEditId(null);

      } else {
        await addDoc(
          collection(db, "users", user.uid, "tasks"),
          {
            name: taskName.trim(),
            completed: false,
            createdAt: serverTimestamp()
          }
        );

        setMessage("Task added!");
      }

      setTaskName("");

    } catch (error) {
      setMessage(error.message);
    }
  }

  // 7. Select a task for editing
  function editTask(task) {
    setTaskName(task.name);
    setEditId(task.id);
    setMessage("Editing task...");
  }

  // 8. Delete a task
  async function deleteTask(id) {
    if (!user) return;

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "tasks", id)
      );

      setMessage("Task deleted!");

      if (editId === id) {
        setEditId(null);
        setTaskName("");
      }

    } catch (error) {
      setMessage(error.message);
    }
  }

  // 9. Mark task as completed or incomplete
  async function toggleTask(task) {
    if (!user) return;

    try {
      await updateDoc(
        doc(db, "users", user.uid, "tasks", task.id),
        { completed: !task.completed }
      );

      setMessage("Task status updated!");

    } catch (error) {
      setMessage(error.message);
    }
  }

  // Wait for Firebase authentication
  if (!authReady) {
    return <main className="container">Loading...</main>;
  }

  // Login and registration page
  if (!user) {
    return (
      <main className="container">
        <h1>Firebase Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>

        <p>{message}</p>
      </main>
    );
  }

  // Task manager dashboard
  return (
    <main className="container">
      <h1>My Task Manager</h1>

      <p>Welcome: {user.email}</p>

      <button onClick={logout}>Logout</button>

      <hr />

      <h2>Manage Tasks</h2>

      <input
        type="text"
        placeholder="Enter task name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />

      <button onClick={saveTask}>
        {editId ? "Update Task" : "Add Task"}
      </button>

      {editId && (
        <button onClick={() => {
          setEditId(null);
          setTaskName("");
          setMessage("");
        }}>
          Cancel
        </button>
      )}

      <h2>My Tasks</h2>

      {tasks.map((task) => (
        <div key={task.id} className="task">

          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => toggleTask(task)}
          />

          <span className={task.completed ? "completed" : ""}>
            {task.name}
          </span>

          <button onClick={() => editTask(task)}>
            Edit
          </button>

          <button onClick={() => deleteTask(task.id)}>
            Delete
          </button>

        </div>
      ))}

      {tasks.length === 0 && (
        <p>No tasks yet. Add your first task.</p>
      )}

      <p>{message}</p>
    </main>
  );
}

export default App;
