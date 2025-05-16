const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");

// App and Middleware Setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = "mongodb://mongo:27017/user_service_db"; // Change as needed
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// JWT Configuration
const SECRET_KEY = "your_secret_key";
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password_hash: String,
  created_at: Date,
  updated_at: Date,
});
const User = mongoose.model("User", userSchema);

// Register User
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ detail: "Email already registered" });

  const hashedPassword = password;
  const newUser = new User({
    name,
    email,
    password_hash: hashedPassword,
    created_at: new Date(),
    updated_at: new Date(),
  });

  await newUser.save();
  res.json({ message: "User registered successfully", user_id: newUser._id });
});

// Login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const dbUser = await User.findOne({ email });
  if (!dbUser || !(password == dbUser.password_hash)) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }

  const token = jwt.sign({ sub: email }, SECRET_KEY, {
    expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`,
  });
  res.json({ access_token: token, token_type: "bearer", user_id: dbUser._id });
});

// Update User
app.put("/update", async (req, res) => {
  const { user_id, name, email, password } = req.body;

  let updateFields = {};
  if (name) updateFields.name = name;
  if (email) {
    const existing = await User.findOne({ email });
    if (existing && existing._id.toString() !== user_id) {
      return res.status(400).json({ detail: "Email already in use" });
    }
    updateFields.email = email;
  }
  if (password) updateFields.password_hash = password;
  updateFields.updated_at = new Date();

  const result = await User.updateOne({ _id: user_id }, { $set: updateFields });
  if (result.modifiedCount === 0) {
    return res
      .status(404)
      .json({ detail: "User not found or no changes made" });
  }

  res.json({ message: "User details updated successfully" });
});

// Match Password
app.post("/match-password", async (req, res) => {
  const { user_id, password } = req.body;

  const dbUser = await User.findById(user_id);
  if (!dbUser) return res.status(404).json({ detail: "User not found" });

  const match = password == dbUser.password_hash;
  res.json({ match });
});

// Get User by ID
app.get("/get-user", async (req, res) => {
  const { user_id } = req.query;

  const dbUser = await User.findById(user_id);
  if (!dbUser) return res.status(404).json({ detail: "User not found" });

  res.json({ user_id: dbUser._id, name: dbUser.name, email: dbUser.email });
});

// Start Server
const PORT = 8000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
