import type { Request, Response } from "express";
import { CategoryModel } from "../models/Category.model";
import { VideoModel } from "../models/Video.model";
import { AppError } from "../middleware/error.middleware";

export const getAllCategories = async (_req: Request, res: Response) => {
  res.status(200).json(await CategoryModel.find().sort({ name: 1 }));
};

export const createCategory = async (req: Request, res: Response) => {
  // El creador es el admin con sesion, nunca viene del body
  res.status(201).json(await CategoryModel.create({ ...req.body, createdBy: req.user!._id }));
};

export const getCategoryById = async (req: Request, res: Response) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) throw new AppError(404, "Categoría no encontrada");
  res.status(200).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  res.status(200).json(await updateCategoryData(String(req.params.id), req.body));
};

export const patchCategory = async (req: Request, res: Response) => {
  res.status(200).json(await updateCategoryData(String(req.params.id), req.body));
};

export const deleteCategory = async (req: Request, res: Response) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) throw new AppError(404, "Categoría no encontrada");
  if (await VideoModel.exists({ "category.categoryId": category._id })) {
    throw new AppError(409, "No se puede eliminar una categoría que tiene videos");
  }
  await category.deleteOne();
  res.status(200).json({ message: "Categoría eliminada correctamente" });
};

async function updateCategoryData(id: string, input: Record<string, any>) {
  const category = await CategoryModel.findByIdAndUpdate(id, input, { returnDocument: "after", runValidators: true });
  if (!category) throw new AppError(404, "Categoría no encontrada");
  if (input.name) await VideoModel.updateMany({ "category.categoryId": category._id }, { "category.name": category.name });
  return category;
}
