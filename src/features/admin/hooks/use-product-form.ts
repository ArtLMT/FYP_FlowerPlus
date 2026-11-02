import { useEffect, useRef, useState, type FormEvent } from "react";
import { asApiError, type FieldErrors } from "@/lib/api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useResource } from "@/lib/hooks/use-resource";
import {
  getProductCategories,
  imageSelectionError,
  MAX_PRODUCT_IMAGES,
  saveManagedProduct,
  searchRecipeMaterials,
  uploadDraftImage,
  type ManagedProduct,
  type ManagedProductInput,
  type ManagedProductType,
} from "@/lib/services/managed-products";
import type { Material } from "@/lib/services/materials";

type RecipeMaterial = Pick<Material, "id" | "name" | "type" | "unitOfMeasure" | "status">;
export type RecipeRow = { id: string; material: RecipeMaterial; quantityRequired: string };
export type PendingImage = { id: string; file: File; previewUrl: string };

export interface ProductFormProps {
  onCancel: () => void;
  onCreated: (product: ManagedProduct) => void;
  /** Given when editing an existing product. */
  product?: ManagedProduct;
  onSaved?: (product: ManagedProduct) => void;
}

const imageKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

/** Checks that can fail before anything is sent; the backend re-validates everything. */
function validate(
  { name, description, basePrice, categoryIds, recipe }: { name: string; description: string; basePrice: string; categoryIds: string[]; recipe: RecipeRow[] },
  product: ManagedProduct | undefined,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!name) errors.name = ["Tên sản phẩm không được để trống hoặc chỉ chứa khoảng trắng."];
  else if (name.length > 255) errors.name = ["Tên sản phẩm tối đa 255 ký tự."];
  if (description.length > 5000) errors.description = ["Mô tả tối đa 5.000 ký tự."];
  if (basePrice !== "") {
    const numericBasePrice = Number(basePrice);
    if (!/^\d+$/.test(basePrice) || !Number.isSafeInteger(numericBasePrice) || numericBasePrice < 1) {
      errors.basePrice = ["Giá bán gốc phải là số VND nguyên dương."];
    } else if (numericBasePrice > 999999999999) {
      errors.basePrice = ["Giá bán gốc tối đa 12 chữ số."];
    }
  }
  if (product?.status === "ACTIVE") {
    if (!description) errors.description = ["Sản phẩm đang bán phải có mô tả."];
    if (!basePrice) errors.basePrice = ["Sản phẩm đang bán phải có giá bán gốc."];
    if (categoryIds.length === 0) errors.categoryIds = ["Sản phẩm đang bán phải có ít nhất một danh mục."];
    if (recipe.length === 0) errors.recipe = ["Sản phẩm đang bán phải có ít nhất một dòng công thức."];
  }
  return errors;
}

/**
 * Create a Draft product (optionally with images), or edit an existing one. Creating is two steps
 * on the server — the Draft, then each image — so if an image fails the Draft already exists and
 * the form offers to retry the remaining images or open the created product.
 */
export function useProductForm({ onCancel, onCreated, product, onSaved }: ProductFormProps) {
  const editing = product != null;
  const [name, setName] = useState(product?.name ?? "");
  const [type, setType] = useState<ManagedProductType | "">(product?.type ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(product?.basePrice == null ? "" : String(product.basePrice));
  const [categoryIds, setCategoryIds] = useState<string[]>(product?.categories.map(({ id }) => id) ?? []);
  const [recipe, setRecipe] = useState<RecipeRow[]>(product?.recipe.map((line) => ({
    id: line.materialId,
    material: {
      id: line.materialId,
      name: line.materialName,
      type: line.materialType,
      unitOfMeasure: line.materialUnit,
      status: line.materialStatus,
    },
    quantityRequired: String(line.quantityRequired),
  })) ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [createdProduct, setCreatedProduct] = useState<ManagedProduct | null>(null);
  const [materialSearch, setMaterialSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const previewUrls = useRef(new Set<string>());

  // Image previews are object URLs; free any still alive when the form closes.
  useEffect(() => () => {
    for (const url of previewUrls.current) URL.revokeObjectURL(url);
  }, []);

  const categories = useResource(getProductCategories, "categories");

  const materialQuery = materialSearch.trim();
  const searchedQuery = useDebouncedValue(materialQuery, 200);
  const materialResults = useResource(
    async () => ({ query: searchedQuery, materials: await searchRecipeMaterials(searchedQuery) }),
    searchedQuery ? `materials:${searchedQuery}` : null,
  );
  const materialsLoading = materialQuery !== "" && materialResults.loading;
  const materials = materialQuery && materialResults.data?.query === searchedQuery ? materialResults.data.materials : [];
  const materialsError = materialQuery && !materialResults.loading ? materialResults.error?.message ?? "" : "";

  function clearErrors() {
    setError("");
    setImageError("");
    setFieldErrors({});
  }

  /** Wraps a field setter so editing a field clears the previous submit's errors. */
  const edit = <T,>(set: (value: T) => void) => (value: T) => {
    set(value);
    clearErrors();
  };

  function toggleCategory(id: string) {
    clearErrors();
    setCategoryIds((current) => current.includes(id)
      ? current.filter((categoryId) => categoryId !== id)
      : [...current, id]);
  }

  function updateRecipeRow(index: number, patch: Partial<RecipeRow>) {
    clearErrors();
    setRecipe((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  }

  function removeRecipeRow(index: number) {
    clearErrors();
    setRecipe((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function addMaterial(material: Material) {
    clearErrors();
    setRecipe((current) => current.some((row) => row.material.id === material.id)
      ? current
      : [...current, { id: crypto.randomUUID(), material, quantityRequired: "" }]);
  }

  function forgetPreview(image: PendingImage) {
    URL.revokeObjectURL(image.previewUrl);
    previewUrls.current.delete(image.previewUrl);
  }

  function chooseImages(files: File[]) {
    setImageError("");
    const problem = imageSelectionError(files, MAX_PRODUCT_IMAGES - pendingImages.length, "choose");
    if (problem) {
      setImageError(problem);
      return;
    }
    const alreadyChosen = new Set(pendingImages.map(({ file }) => imageKey(file)));
    const additions = files.filter((file) => !alreadyChosen.has(imageKey(file))).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return { id: crypto.randomUUID(), file, previewUrl };
    });
    setPendingImages((current) => [...current, ...additions]);
  }

  function removeImage(id: string) {
    setPendingImages((current) => current.filter((image) => {
      if (image.id !== id) return true;
      forgetPreview(image);
      return false;
    }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setPendingImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  }

  function finishCreation(created: ManagedProduct) {
    pendingImages.forEach(forgetPreview);
    onCreated(created);
  }

  function cancel() {
    if (!editing && createdProduct) finishCreation(createdProduct);
    else onCancel();
  }

  /** Uploads the chosen images in order; on a failure, keeps that image and the rest for a retry. */
  async function uploadPendingImages(draft: ManagedProduct): Promise<ManagedProduct | null> {
    let current = draft;
    const remaining = [...pendingImages];
    while (remaining.length > 0) {
      const next = remaining.shift()!;
      try {
        current = await uploadDraftImage(current, next.file);
        setCreatedProduct(current);
        forgetPreview(next);
        setPendingImages([...remaining]);
      } catch (cause) {
        setPendingImages([next, ...remaining]);
        setImageError(asApiError(cause).message);
        return null;
      }
    }
    return current;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearErrors();
    const normalized = { name: name.trim(), description: description.trim(), basePrice, categoryIds, recipe };
    const clientErrors = validate(normalized, product);
    if (Object.keys(clientErrors).length > 0) {
      setError(`Vui lòng kiểm tra lại một số thông tin trước khi ${editing ? "lưu" : "tạo"} sản phẩm.`);
      setFieldErrors(clientErrors);
      return;
    }

    setSaving(true);
    try {
      const input: ManagedProductInput = {
        name: normalized.name,
        type: type as ManagedProductType,
        description: normalized.description || null,
        basePrice: basePrice === "" ? null : Number(basePrice),
        categoryIds,
        recipe: recipe.map((line) => ({
          materialId: line.material.id,
          quantityRequired: Number(line.quantityRequired),
        })),
      };
      if (product) {
        onSaved?.(await saveManagedProduct(product, input));
        return;
      }

      const draft = createdProduct ?? await saveManagedProduct(undefined, input);
      setCreatedProduct(draft);
      const withImages = await uploadPendingImages(draft);
      if (withImages) finishCreation(withImages);
    } catch (cause) {
      const failure = asApiError(cause);
      setError(failure.message);
      setFieldErrors(failure.fieldErrors);
    } finally {
      setSaving(false);
    }
  }

  return {
    editing,
    isActive: product?.status === "ACTIVE",
    name,
    setName: edit(setName),
    type,
    setType: edit(setType),
    description,
    setDescription: edit(setDescription),
    basePrice,
    /** Keeps digits only. */
    setBasePrice: edit((value: string) => setBasePrice(value.replace(/\D/g, ""))),
    categories: categories.data ?? [],
    categoriesLoading: categories.loading,
    categoriesError: categories.loading ? "" : categories.error?.message ?? "",
    retryCategories: categories.reload,
    categoryIds,
    toggleCategory,
    recipe,
    selectedMaterialIds: new Set(recipe.map((row) => row.material.id)),
    updateRecipeRow,
    removeRecipeRow,
    materialSearch,
    setMaterialSearch,
    materials,
    materialsLoading,
    materialsError,
    retryMaterialSearch: materialResults.reload,
    addMaterial,
    pendingImages,
    imageError,
    chooseImages,
    removeImage,
    moveImage,
    createdProduct,
    saving,
    error,
    fieldErrors,
    cancel,
    submit,
  };
}
