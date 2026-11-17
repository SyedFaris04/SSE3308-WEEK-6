
import { useState, useEffect } from "react";
import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import "./App.css";

function App() {
  // Store user information
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Store input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Store messages
  const [message, setMessage] = useState("");

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Register new user
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

  // Login existing user
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

  // Logout user
  async function logout() {
    try {
      await signOut(auth);
      setMessage("Logged out successfully!");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Wait for Firebase to restore login state
  if (!authReady) {
    return <main className="container">Loading...</main>;
  }

  // Show login and registration page
  if (!user) {
    return (
      <main className="container">
        <h1>Firebase Authentication</h1>

        <p>Register or login to your account</p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div>
          <button onClick={login}>Login</button>

          <button onClick={register}>Register</button>
        </div>

        <p>{message}</p>
      </main>
    );
  }

  // Show page after successful login
  return (
    <main className="container">
      <h1>Welcome to My Task Manager</h1>

      <p>You are successfully logged in!</p>

      <p>
        Email: <strong>{user.email}</strong>
      </p>

      <p>
        User ID: <strong>{user.uid}</strong>
      </p>

      <button onClick={logout}>Logout</button>

      <p>{message}</p>
    </main>
  );
}

export default App;
