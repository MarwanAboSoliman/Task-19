import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  toggleLike,
} from "../queries/posts.queries.js";
import { checkAuth } from "../middlewares/checkAuth.js";
import { validateBody } from "../middlewares/validateSchema.middleware.js";
import { insertPostSchema } from "../schemas/posts.schemas.js";
import { uploadImage } from "../middlewares/upload.js";
import { createComment } from "../queries/comment.queries.js";
export const postsRouter = express.Router();

postsRouter.post(
  "/",
  checkAuth,
  uploadImage,
  validateBody(insertPostSchema),
  async (req, res) => {
    const { content } = req.body;
    const image = req.file ? req.file.filename : null;
    try {
      const post = await createPost({
        userId: req.session.user.id,
        content: content,
        image: image,
      });
      res.status(201).json({ message: "post created", data: post });
    } catch (e) {
      res.status(500).json(e.message);
    }
  },
);

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts(req.session.user.id);
  res.status(200).json({ data: posts });
});

postsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const userId = req.session.user.id;
  const post = await getPostById(Number(id), userId);
  if (!post) {
    return res.status(404).json({
      error: "post not found",
    });
  }
  res.status(200).json({
    data: post,
  });
});

postsRouter.post("/:id/like", checkAuth, async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user.id;

  const result = await toggleLike(postId, userId);
  if (!result) {
    return res.status(404).json({
      error: "Post Not Found",
    });
  }

  res.status(200).json({ data: result });
});
postsRouter.post("/:id/comments", checkAuth, async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user.id;
  const { content } = req.body;
  const comment = await createComment(postId, userId, content);
  if (!comment) {
    return res.status(404).json({
      error: "Post Not Found",
    });
  }

  res.status(200).json({
    message: "commnet Created",
    data: comment,
  });
});
