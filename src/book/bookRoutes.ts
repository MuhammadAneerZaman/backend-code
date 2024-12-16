import express from "express";
import path from "node:path";
import {
  createBook,
  deleteBook,
  listBooks,
  listSingleBook,
  updateBook,
} from "./bookController";
import multer from "multer";
import authenticated from "../middlewares/authenticated";

const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  // todo: put limit 10mb max.
  limits: { fileSize: 10 * 1024 * 1024 }, // 30mb 30 * 1024 * 1024
});
bookRouter.post(
  "/",
  authenticated,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

bookRouter.patch(
  "/:bookId",
  authenticated,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

bookRouter.get("/", listBooks);
bookRouter.get("/:bookId", listSingleBook);
bookRouter.delete("/:bookId", authenticated, deleteBook);

export default bookRouter;
