import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs from "node:fs";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticated";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;

  console.log("Files: ", req.files);

  const files = req.files as { [filename: string]: Express.Multer.File[] };
  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );
    const bookMimeType = files.file[0].mimetype.split("/").at(-1);

    const bookUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book-files",
      format: bookMimeType,
    });

    // console.log("CoverImage Uploaded: ", uploadResult);
    // console.log("File Uploaded: ", bookUploadResult);

    const _req = req as AuthRequest;

    const newBook = await bookModel.create({
      title,
      genre,
      coverImage: uploadResult.secure_url,
      file: bookUploadResult.secure_url,
      author: _req.userId,
    });

    try {
      await fs.promises.unlink(filePath);
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      console.log("File temp deletion failed: ", error);
    }
    res.json({ id: newBook._id });
  } catch (error) {
    console.log("Failed to upload", error);

    return next(createHttpError(500, "Error while uploading Files"));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "You are not the author of this book"));
    }
    const files = req.files as { [filename: string]: Express.Multer.File[] };

    let completeCoverImage = "";
    if (files.coverImage) {
      const fileName = files.coverImage[0].filename;
      const fileMimeType = files.coverImage[0].mimetype.split("/").at(-1);
      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
      );

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: "book-cover",
        format: fileMimeType,
      });
      completeCoverImage = uploadResult.secure_url;
      fs.promises.unlink(filePath);
    }
    let completeFile = "";
    if (files.file) {
      const fileName = files.file[0].filename;
      const fileMimeType = files.file[0].mimetype.split("/").at(-1);
      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
      );

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: "book-cover",
        format: fileMimeType,
      });
      completeFile = uploadResult.secure_url;
      fs.promises.unlink(filePath);
    }
    const updatedBook = await bookModel.findOneAndUpdate(
      { _id: bookId },
      {
        title: title,
        genre: genre,
        coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
        file: completeFile ? completeFile : book.file,
      },
      { new: true }
    );

    res.json({ updatedBook });
  } catch (error) {
    console.log("Error while updating book", error);

    return next(createHttpError(500, "Error updating book"));
  }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await bookModel.find();
    res.json(books);
  } catch (error) {
    console.log("Error while getting books", error);

    return next(createHttpError(500, "Something went wrong"));
  }
};

const listSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;
  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(400, "Book not found"));
    }
    res.json(book);
  } catch (error) {
    console.log("Error while getting books", error);

    return next(createHttpError(500, "Something went wrong"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;
  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(400, "Book not found"));
    }
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "You are not the author of this book"));
    }

    const coverImageSplit = book.coverImage.split("/");
    const coverImagePublicId =
      coverImageSplit.at(-2) + "/" + coverImageSplit.at(-1)?.split(".").at(-2);

    const fileSplit = book.file.split("/");
    const filePublicId = fileSplit.at(-2) + "/" + fileSplit.at(-1);

    await cloudinary.uploader.destroy(filePublicId, {
      resource_type: "raw",
    });
    await cloudinary.uploader.destroy(coverImagePublicId);

    const deletedBook = await book.deleteOne({ _id: bookId });

    res.status(204).json({ deletedBook });
  } catch (error) {
    console.log("Error while deleting book", error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { createBook, updateBook, listBooks, listSingleBook, deleteBook };
