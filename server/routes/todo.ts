import express from "express";
import { authenticateJwt, SECRET } from "../middleware/index";
import { Todo } from "../db";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["info", "query"] });
const router = express.Router();

interface CreateTodoInput {
  title: string;
  description: string;
}

router.post("/todos", authenticateJwt, async (req, res) => {
  const { title, description } = req.body;
  const done = false;
  const userName = req.headers["userName"];
  console.log(`userNAMe  ${userName}`);
  if (typeof userName === "string") {
    const user = await prisma.user.findUnique({
      where: {
        username: userName,
      },
    });
    // console.log(`userid ${userId}`);
    if (typeof user?.id === "number") {
      const newTodo = await prisma.todo.create({
        data: {
          title: title,
          description: description,
          authorId: user.id,
        },
      });
      if (newTodo) {
        res.json(newTodo);
      } else {
        res.status(500).json({ error: "Failed to create a new todo" });
      }
    } else {
      res.status(500).json({ error: "Failed to create a new todo" });
    }
  } else {
    res.status(500).json({ error: "Failed to create a new todo" });
  }
});

router.get("/todos", authenticateJwt, async (req, res) => {
  const userName = req.headers["userName"];

  if (typeof userName === "string") {
    const user = await prisma.user.findUnique({
      where: {
        username: userName,
      },
    });
    if (typeof user?.id === "number") {
      const todos = await prisma.todo.findMany({
        where: {
          authorId: user.id,
        },
      });
      res.json(todos);
    } else {
      res.status(500).json({ error: "Failed to retrieve todos" });
    }
  } else {
    res.status(500).json({ error: "Failed to retrieve todos" });
  }
});

router.patch("/todos/:todoId/done", authenticateJwt, async (req, res) => {
  const { todoId } = req.params;

  const userName = req.headers["userName"];
  // console.log(typeof todoId);\
  // console.log(typeof temp);

  if (typeof userName === "string") {
    const user = await prisma.user.findUnique({
      where: {
        username: userName,
      },
    });
    if (typeof user?.id === "number") {
      const todos = await prisma.todo.update({
        where: {
          authorId: user.id,
          id: parseInt(todoId),
        },
        data: {
          done: true,
        },
      });
      res.json(todos);
    } else {
      res.status(500).json({ error: "Failed to retrieve todos" });
    }
  } else {
    res.status(500).json({ error: "Failed to retrieve todos" });
  }

  // Todo.findOneAndUpdate({ _id: todoId, userId }, { done: true }, { new: true })
  //   .then((updatedTodo) => {
  //     if (!updatedTodo) {
  //       return res.status(404).json({ error: "Todo not found" });
  //     }
  //     res.json(updatedTodo);
  //   })
  //   .catch((err) => {
  //     res.status(500).json({ error: "Failed to update todo" });
  //   });
});

export default router;
