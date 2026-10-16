import express from "express";
import { registerSchema, loginSchema } from "../schemas/auth.schemas.js";
import {
  registerUser,
  // getUserBySession,
  loginUser,
  // logout,
} from "../queries/auth.queries.js";
import { validateBody } from "../middlewares/validateSchema.middleware.js";

export const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  try {
    await registerUser(req.body);
    res.status(201).json({ message: "register successful, you can now login" });
  } catch (e) {
    res.status(422).json({ errors: { email: { errors: [e.message] } } });
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { user } = await loginUser(req.body);
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    res.status(200).json({
      message: "login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
    });
  } catch (e) {
    res.status(401).json({
      error: e.message,
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("blog_session");
    res.status(200).json({
      message: "logout Successful",
    });
  });
});

authRouter.get("/me", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "invalid session" });
  }
  res.status(200).json({ data: { user: req.session.user } });
});
