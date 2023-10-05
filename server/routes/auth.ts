import jwt from "jsonwebtoken";
import express, { response } from "express";
import { authenticateJwt, SECRET } from "../middleware/";
import { User } from "../db";
import { signupInput } from "@100xdevs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["info", "query"] });

const router = express.Router();

router.post("/signup", async (req, res) => {
  let parsedInput = signupInput.safeParse(req.body);
  if (!parsedInput.success) {
    return res.status(403).json({
      msg: "error",
    });
  }
  const username = parsedInput.data.username;
  const password = parsedInput.data.password;

  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (user) {
    res.status(403).json({ message: "Prisma - User already exists" });
  } else {
    const respond = await prisma.user.create({
      data: {
        username: username,
        password: password,
      },
    });
    const payload = {
      username: respond.username,
    };
    const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });
    res.json({ message: "Prisma - User created successfully", token });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      username: username,
      password: password,
    },
  });
  console.log(user);
  if (user) {
    const payload = {
      username: user.username,
    };
    console.log(payload);
    const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });
    res.json({ message: "Prisma - Logged in successfully", token });
  } else {
    res.status(404).json({ message: "Prisma - Invalid username or password" });
  }
  // const user = await User.findOne({ username, password });
  // if (user) {
  //   const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
  //   res.json({ message: "Logged in successfully", token });
  // } else {
  //   res.status(403).json({ message: "Invalid username or password" });
  // }
});

router.get("/me", authenticateJwt, async (req, res) => {
  const userName = req.headers["userName"];

  if (typeof userName === "string") {
    const user = await prisma.user.findUnique({
      where: {
        username: userName,
      },
    });
    if (user) {
      res.json({ username: user.username }); // user.username
    } else {
      res.status(403).json({ message: "User not logged in" });
    }
  } else {
    res.status(403).json({ message: "User not logged in" });
  }
});

export default router;
