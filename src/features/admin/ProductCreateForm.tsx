"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { RequestError } from "@/lib/api";
import {
  createManagedProduct,
  listMaterials,
  updateManagedProduct,
  uploadManagedProductImage,
  type AdminMaterial,
  type CreateManagedProductInput,
  type ManagedProduct,
  type ManagedProductType,
  type MaterialUnit,
} from "@/lib/services/admin";
import { getCategories, type Category } from "@/lib/services/categories";

type RecipeMaterial = Pick<AdminMaterial, "id" | "name" | "type" | "unitOfMeasure" | "status">;
type RecipeRow = { id: string; material: RecipeMaterial; quantityRequired: string };
type PendingImage = { id: string; file: File; previewUrl: string };
type FieldErrors = Record<string, string[]>;

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 2_000_000;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const unitLabels: Record<MaterialUnit, string> = {
  STEM: "stems",
  PIECE: "pieces",
  METRE: "metres",
  SHEET: "sheets",
};

function getSaveError(error: unknown, editing: boolean) {
  if (!(error instanceof RequestError)) {
    return "Could not connect to FlowerPlus. Check the backend connection and try again.";
  }
  if (error.status === 401) return `Sign in with a Staff or Admin account to ${editing ? "edit" : "create"} products.`;
  if (error.status === 403) return "Your account does not have permission to manage products.";
  if (error.errorCode === "PRODUCT_RECIPE_MATERIAL_INACTIVE") {
    return "A selected material is no longer active. Reload the options and review the recipe.";
  }
  if (error.errorCode === "CONCURRENT_MODIFICATION") return "This Product changed elsewhere. Close the form, review the current version, and try again.";
  if (error.errorCode === "PRODUCT_INVALID_STATE") return "This Product's status changed. Close the form and review its current state.";
  if (error.errorCode === "PRODUCT_RECIPE_STOCK_CONFLICT") return "The recipe cannot change while finished PreMade units remain available or reserved.";
  if (error.errorCode === "SALE_PRICE_CONFLICT") return "This base price would invalidate a running or scheduled sale.";
  if (error.errorCode === "VALIDATION_FAILED") {
    return "Some information was rejected. Review the fields below and try again.";
  }
  return `Could not ${editing ? "save" : "create"} the product. Please review the information and try again.`;
}

function getImageError(error: unknown) {
  if (!(error instanceof RequestError)) return "The Draft was created, but its images could not be uploaded. Try again.";
  if (error.errorCode === "PRODUCT_IMAGE_INVALID") return "Choose a valid JPG, PNG, or WebP image.";
  if (error.errorCode === "PRODUCT_IMAGE_TOO_LARGE") return "Each image must be 2 MB or smaller.";
  if (error.errorCode === "PRODUCT_IMAGE_LIMIT_REACHED") return "A Product can have at most five images.";
  if (error.errorCode === "CONCURRENT_MODIFICATION") return "The Product changed while its images were uploading. Open the created Product and refresh it.";
  return "The Draft was created, but an image could not be uploaded. Try again.";
}

function getFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof RequestError) || error.errorCode !== "VALIDATION_FAILED") return {};
  const grouped: FieldErrors = {};
  for (const field of error.details?.fields ?? []) {
    const root = field.field.split(/[.[\]]/)[0];
    const message = root === "name" ? "Enter a nonblank product name of at most 255 characters."
      : root === "description" ? "Enter a nonblank description of at most 5,000 characters."
        : root === "basePrice" ? "Enter a positive whole-VND base price of at most 12 digits."
          : root === "categoryIds" ? "Select at least one valid category."
            : root === "recipe" ? "Add at least one valid recipe line with a positive quantity."
              : root === "images" ? "Keep at least one valid Product image."
                : root === "type" ? "Choose a Product type."
                  : "Review this field.";
    grouped[field.field] = [...(grouped[field.field] ?? []), message];
  }
  return grouped;
}

export default function ProductCreateForm({
  onCancel,
  onCreated,
  product,
  onSaved,
  onDeactivate,
  onReturnToDraft,
}: {
  onCancel: () => void;
  onCreated: (product: ManagedProduct) => void;
  product?: ManagedProduct;
  onSaved?: (product: ManagedProduct) => void;
  onDeactivate?: (product: ManagedProduct) => void;
  onReturnToDraft?: (product: ManagedProduct) => void;
}) {
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialReloadKey, setMaterialReloadKey] = useState(0);
  const [categoriesError, setCategoriesError] = useState("");
  const [materialsError, setMaterialsError] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const previewUrls = useRef(new Set<string>());

  useEffect(() => () => {
    for (const url of previewUrls.current) URL.revokeObjectURL(url);
  }, []);

  async function retryCategories() {
    setCategoriesLoading(true);
    setCategoriesError("");
    try {
      setCategories(await getCategories());
    } catch {
      setCategoriesError("Categories could not be loaded; you can still save without one.");
    } finally {
      setCategoriesLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getCategories()
      .then((result) => { if (active) setCategories(result); })
      .catch(() => { if (active) setCategoriesError("Categories could not be loaded; you can still save without one."); })
      .finally(() => { if (active) setCategoriesLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const query = materialSearch.trim();
    if (!query) return;
    let active = true;
    const timeout = window.setTimeout(async () => {
      setMaterialsLoading(true);
      setMaterialsError("");
      try {
        const page = await listMaterials({ page: 0, size: 8, search: query, status: "ACTIVE", sort: "NAME_ASC" });
        if (active) setMaterials(page.content);
      } catch {
        if (active) setMaterialsError("Active materials could not be loaded. Retry or save the Draft without a recipe.");
      } finally {
        if (active) setMaterialsLoading(false);
      }
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [materialReloadKey, materialSearch]);

  function clearErrors() {
    setError("");
    setImageError("");
    setFieldErrors({});
  }

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

  function addMaterial(material: AdminMaterial) {
    clearErrors();
    setRecipe((current) => current.some((row) => row.material.id === material.id)
      ? current
      : [...current, { id: crypto.randomUUID(), material, quantityRequired: "" }]);
  }

  function chooseImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setImageError("");

    const availableSlots = MAX_IMAGES - pendingImages.length;
    if (files.length > availableSlots) {
      setImageError(`You can choose ${availableSlots} more image${availableSlots === 1 ? "" : "s"}.`);
      return;
    }
    const invalidType = files.find((file) => !IMAGE_TYPES.has(file.type));
    if (invalidType) {
      setImageError(`${invalidType.name} is not a JPG, PNG, or WebP image.`);
      return;
    }
    const oversized = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (oversized) {
      setImageError(`${oversized.name} is larger than 2 MB.`);
      return;
    }
    const duplicates = new Set(pendingImages.map(({ file }) => `${file.name}:${file.size}:${file.lastModified}`));
    const additions = files.filter((file) => !duplicates.has(`${file.name}:${file.size}:${file.lastModified}`)).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return { id: crypto.randomUUID(), file, previewUrl };
    });
    setPendingImages((current) => [...current, ...additions]);
  }

  function removeImage(id: string) {
    setPendingImages((current) => current.filter((image) => {
      if (image.id !== id) return true;
      URL.revokeObjectURL(image.previewUrl);
      previewUrls.current.delete(image.previewUrl);
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

  function finishCreation(product: ManagedProduct) {
    for (const image of pendingImages) {
      URL.revokeObjectURL(image.previewUrl);
      previewUrls.current.delete(image.previewUrl);
    }
    onCreated(product);
  }

  function cancelCreation() {
    if (editing) onCancel();
    else if (createdProduct) finishCreation(createdProduct);
    else onCancel();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearErrors();
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const clientErrors: FieldErrors = {};
    if (!normalizedName) clientErrors.name = ["Product name cannot be blank or contain only spaces."];
    else if (normalizedName.length > 255) clientErrors.name = ["Product name must be at most 255 characters."];
    if (normalizedDescription.length > 5000) clientErrors.description = ["Description must be at most 5,000 characters."];
    if (basePrice !== "") {
      const numericBasePrice = Number(basePrice);
      if (!/^\d+$/.test(basePrice) || !Number.isSafeInteger(numericBasePrice) || numericBasePrice < 1) {
        clientErrors.basePrice = ["Base price must be a positive whole-VND amount."];
      } else if (numericBasePrice > 999999999999) {
        clientErrors.basePrice = ["Base price must contain at most 12 digits."];
      }
    }
    if (product?.status === "ACTIVE") {
      if (!normalizedDescription) clientErrors.description = ["An Active Product requires a description."];
      if (!basePrice) clientErrors.basePrice = ["An Active Product requires a base price."];
      if (categoryIds.length === 0) clientErrors.categoryIds = ["An Active Product requires at least one category."];
      if (recipe.length === 0) clientErrors.recipe = ["An Active Product requires at least one recipe line."];
    }
    if (Object.keys(clientErrors).length > 0) {
      setError(`Some information needs attention before the Product can be ${editing ? "saved" : "created"}.`);
      setFieldErrors(clientErrors);
      return;
    }
    setSaving(true);
    try {
      const input: CreateManagedProductInput = {
        name: normalizedName,
        type: type as ManagedProductType,
        description: normalizedDescription || null,
        basePrice: basePrice === "" ? null : Number(basePrice),
        categoryIds,
        recipe: recipe.map((line) => ({
          materialId: line.material.id,
          quantityRequired: Number(line.quantityRequired),
        })),
      };
      if (product) {
        const updated = await updateManagedProduct(product, input);
        onSaved?.(updated);
        return;
      }

      let currentProduct = createdProduct;
      if (!currentProduct) {
        currentProduct = await createManagedProduct(input);
        setCreatedProduct(currentProduct);
      }

      const imagesToUpload = [...pendingImages];
      while (imagesToUpload.length > 0) {
        const nextImage = imagesToUpload.shift()!;
        try {
          currentProduct = await uploadManagedProductImage(currentProduct, nextImage.file);
          setCreatedProduct(currentProduct);
          URL.revokeObjectURL(nextImage.previewUrl);
          previewUrls.current.delete(nextImage.previewUrl);
          setPendingImages([...imagesToUpload]);
        } catch (reason) {
          setPendingImages([nextImage, ...imagesToUpload]);
          setImageError(getImageError(reason));
          return;
        }
      }
      finishCreation(currentProduct);
    } catch (reason) {
      setError(getSaveError(reason, editing));
      setFieldErrors(getFieldErrors(reason));
    } finally {
      setSaving(false);
    }
  }

  const selectedMaterialIds = new Set(recipe.map((row) => row.material.id));

  return <section className="w-full min-w-0 max-w-full rounded-2xl border border-neutral-border bg-white shadow-sm">
    <header className="flex flex-col gap-3 border-b border-neutral-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-text-primary">{editing ? "Edit Product" : "Create Product"}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">
          {editing
            ? product.status === "ACTIVE"
              ? "Active Products must remain complete. Deactivate this Product before changing its type or making it incomplete."
              : "Draft and Deactivated Products may be saved incomplete and completed before activation."
            : "It will be saved as a Draft. A staff member must complete the required product information and activate it separately before customers can see it."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 self-start">
        {product?.status === "ACTIVE" && onDeactivate && <Button type="button" onClick={() => onDeactivate(product)} disabled={saving} className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Deactivate</Button>}
        {product?.status === "DEACTIVATED" && onReturnToDraft && <Button type="button" onClick={() => onReturnToDraft(product)} disabled={saving} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary">Return to Draft</Button>}
        <Button type="button" onClick={cancelCreation} disabled={saving} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary">{createdProduct ? "Open created Product" : "Cancel"}</Button>
      </div>
    </header>

    <form onSubmit={submit} className="min-w-0 space-y-6 px-4 py-6 sm:px-7">
      <p className="text-xs text-text-muted"><span className="font-bold text-primary-deep" aria-hidden="true">*</span> Required field</p>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p>{error}</p>
        {Object.entries(fieldErrors).length > 0 && <ul className="mt-2 list-inside list-disc space-y-1">
          {Object.entries(fieldErrors).flatMap(([field, messages]) => messages.map((message) => <li key={field + message}><strong>{field}:</strong> {message}</li>))}
        </ul>}
      </div>}

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          <span>Product name <span className="text-primary-deep" aria-hidden="true">*</span></span>
          <input
            required
            value={name}
            onChange={(event) => { setName(event.target.value); clearErrors(); }}
            autoFocus
            aria-invalid={Boolean(fieldErrors.name)}
            className="min-h-11 w-full min-w-0 rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
          />
          <span className={`text-xs font-normal ${name.trim().length > 255 ? "text-red-700" : "text-text-muted"}`}>Required · {name.trim().length}/255 characters after trimming</span>
          {fieldErrors.name?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          <span>Product type <span className="text-primary-deep" aria-hidden="true">*</span></span>
          <select
            required
            disabled={product?.status === "ACTIVE"}
            value={type}
            onChange={(event) => { setType(event.target.value as ManagedProductType | ""); clearErrors(); }}
            className="min-h-11 rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-neutral-canvas disabled:text-text-muted"
          >
            <option value="">Choose a type</option>
            <option value="PRE_ORDER">Pre-order</option>
            <option value="PRE_MADE">Pre-made</option>
          </select>
          <span className="text-xs font-normal text-text-muted">{product?.status === "ACTIVE" ? "Deactivate before changing type" : editing ? "Required · editable while hidden" : "Required · the Product is still created as Draft"}</span>
          {fieldErrors.type?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          Description {product?.status === "ACTIVE" && <span className="text-primary-deep" aria-hidden="true">*</span>}
          <textarea
            rows={4}
            value={description}
            onChange={(event) => { setDescription(event.target.value); clearErrors(); }}
            aria-invalid={Boolean(fieldErrors.description)}
            className="w-full min-w-0 resize-y rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
            placeholder="Optional product description"
          />
          <span className={`text-xs font-normal ${description.trim().length > 5000 ? "text-red-700" : "text-text-muted"}`}>{product?.status === "ACTIVE" ? "Required while Active" : "Optional"} · {description.trim().length}/5,000 characters after trimming</span>
          {fieldErrors.description?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          Base selling price (VND) {product?.status === "ACTIVE" && <span className="text-primary-deep" aria-hidden="true">*</span>}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={basePrice}
            onChange={(event) => { setBasePrice(event.target.value.replace(/\D/g, "")); clearErrors(); }}
            aria-invalid={Boolean(fieldErrors.basePrice)}
            className="min-h-11 rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
            placeholder="Leave empty for now"
          />
          <span className="text-xs font-normal text-text-muted">{product?.status === "ACTIVE" ? "Required while Active" : "Optional"} · positive whole-VND amount</span>
          {fieldErrors.basePrice?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
        </label>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary">Categories <span className="font-normal text-text-muted">· {product?.status === "ACTIVE" ? "required" : "optional"}</span></h3>
          <p className="mt-1 text-xs text-text-muted">{product?.status === "ACTIVE" ? "At least one category must remain while Active." : "A hidden Product may be saved without categories. At least one is required before activation."}</p>
        </div>
        {categoriesLoading ? <p className="text-sm text-text-muted">Loading categories…</p>
          : categories.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => <label key={category.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-neutral-border px-3 py-2 text-sm text-text-secondary">
              <input type="checkbox" checked={categoryIds.includes(category.id)} onChange={() => toggleCategory(category.id)} className="size-4 accent-[var(--color-primary)]" />
              <span className="min-w-0 break-words">{category.name}</span>
            </label>)}
          </div> : <p className="text-sm text-text-muted">No categories are available. You can create the Draft without one.</p>}
        {categoriesError && <div className="flex flex-wrap items-center gap-2 text-xs text-amber-800">
          <span role="status">{categoriesError}</span>
          <Button type="button" onClick={() => void retryCategories()} disabled={categoriesLoading} className="font-semibold underline">Retry loading options</Button>
        </div>}
        {fieldErrors.categoryIds?.map((message) => <p key={message} className="text-xs text-red-700">{message}</p>)}
      </section>

      {!editing && <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary">Images <span className="font-normal text-text-muted">· optional</span></h3>
          <p className="mt-1 text-xs text-text-muted">Choose up to five JPG, PNG, or WebP images. Each image may be up to 2 MB. The first image will be the main image.</p>
        </div>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-border bg-neutral-canvas px-4 py-5 text-center hover:border-primary">
          <span className="text-sm font-semibold text-primary-deep">Choose images</span>
          <span className="mt-1 text-xs text-text-muted">{MAX_IMAGES - pendingImages.length} of {MAX_IMAGES} slots available</span>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={chooseImages}
            disabled={pendingImages.length >= MAX_IMAGES || saving}
            className="sr-only"
          />
        </label>
        {imageError && <p role="alert" className="text-sm text-red-700">{imageError}</p>}
        {createdProduct && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">The Draft has been created. Retry to finish uploading the remaining images, or open the created Product.</p>}
        {pendingImages.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pendingImages.map((image, index) => <article key={image.id} className="overflow-hidden rounded-xl border border-neutral-border bg-white">
            <div className="relative aspect-[4/3] bg-neutral-raised">
              <Image src={image.previewUrl} alt={`Selected product image ${index + 1}`} fill unoptimized className="object-cover" />
              {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Main</span>}
            </div>
            <div className="space-y-2 p-2.5">
              <p className="truncate text-xs font-semibold text-text-primary" title={image.file.name}>{image.file.name}</p>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button type="button" disabled={index === 0 || saving} onClick={() => moveImage(index, -1)} aria-label={`Move ${image.file.name} earlier`} className="rounded-md border border-neutral-border px-2 py-1 text-xs disabled:opacity-40">←</Button>
                  <Button type="button" disabled={index === pendingImages.length - 1 || saving} onClick={() => moveImage(index, 1)} aria-label={`Move ${image.file.name} later`} className="rounded-md border border-neutral-border px-2 py-1 text-xs disabled:opacity-40">→</Button>
                </div>
                <Button type="button" disabled={saving} onClick={() => removeImage(image.id)} className="px-1 py-1 text-xs font-semibold text-primary-deep">Remove</Button>
              </div>
            </div>
          </article>)}
        </div>}
      </section>}

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary">Recipe <span className="font-normal text-text-muted">· {product?.status === "ACTIVE" ? "required" : "optional"}</span></h3>
          <p className="mt-1 text-xs text-text-muted">Search Active materials and select a result to add it to this Product.</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-text-primary">Current materials</h4>
          <span className="text-xs text-text-muted">{recipe.length} selected</span>
        </div>
        {recipe.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border px-4 py-5 text-center text-sm text-text-muted">No materials selected. Search below and choose Add to start the recipe.</p>
          : <div className="space-y-3 rounded-xl border border-neutral-border bg-neutral-canvas p-3">
              {recipe.map((row, index) => {
                const allowsFraction = row.material.unitOfMeasure === "METRE";
                return <div key={row.id} className="grid gap-3 border-b border-neutral-border pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(140px,0.55fr)_auto] sm:items-end">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 self-center">
                    <p className="min-w-0 flex-1 truncate text-base font-semibold text-text-primary">{row.material.name}</p>
                    <span className="shrink-0 rounded-full bg-neutral-raised px-2 py-0.5 text-xs font-medium text-text-muted">{row.material.type === "FLOWER" ? "Flower" : "Decoration"} · {unitLabels[row.material.unitOfMeasure]}</span>
                    {fieldErrors["recipe[" + index + "].materialId"]?.map((message) => <span key={message} className="basis-full text-xs text-red-700">{message}</span>)}
                  </div>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
                    <span>Quantity ({unitLabels[row.material.unitOfMeasure]}) <span className="text-primary-deep" aria-hidden="true">*</span></span>
                    <input
                      required
                      type="number"
                      min={allowsFraction ? "0.01" : "1"}
                      step={allowsFraction ? "0.01" : "1"}
                      value={row.quantityRequired}
                      onChange={(event) => updateRecipeRow(index, { quantityRequired: event.target.value })}
                      className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
                      placeholder={allowsFraction ? "e.g. 1.5" : "e.g. 1"}
                    />
                    {fieldErrors["recipe[" + index + "].quantityRequired"]?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
                  </label>
                  <Button
                    type="button"
                    onClick={() => { clearErrors(); setRecipe((current) => current.filter((_, rowIndex) => rowIndex !== index)); }}
                    aria-label={`Remove ${row.material.name} from recipe`}
                    className="min-h-11 rounded-lg px-3 text-sm font-semibold text-text-muted hover:bg-white hover:text-primary-deep"
                  >Remove</Button>
                </div>;
              })}
            </div>}

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          Search active materials
          <input
            type="search"
            value={materialSearch}
            onChange={(event) => {
              const value = event.target.value;
              setMaterialSearch(value);
              if (!value.trim()) {
                setMaterials([]);
                setMaterialsError("");
                setMaterialsLoading(false);
              }
            }}
            className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
            placeholder="Search by material name"
          />
          <span className="text-xs font-normal text-text-muted">Enter a name to search. Up to eight matching Active materials are shown.</span>
        </label>
        {!materialSearch.trim() && <p className="text-sm text-text-muted">Search results appear here after you enter a material name.</p>}
        {materialsLoading && <p role="status" className="text-sm text-text-muted">Searching materials…</p>}
        {materialSearch.trim() && !materialsLoading && !materialsError && materials.length === 0 && <p className="text-sm text-text-muted">No Active materials match this search.</p>}
        {!materialsLoading && materials.length > 0 && <div className="max-h-56 overflow-y-auto rounded-xl border border-neutral-border bg-white" aria-label="Active material search results">
          {materials.map((material) => {
            const selected = selectedMaterialIds.has(material.id);
            return <button
              key={material.id}
              type="button"
              disabled={selected}
              onClick={() => addMaterial(material)}
              className="flex min-h-12 w-full min-w-0 items-center justify-between gap-3 border-b border-neutral-border px-3 py-2 text-left last:border-b-0 hover:bg-neutral-canvas disabled:cursor-default disabled:bg-neutral-canvas"
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1"><span className="min-w-0 max-w-full truncate text-base font-semibold text-text-primary">{material.name}</span><span className="shrink-0 rounded-full bg-neutral-raised px-2 py-0.5 text-xs font-medium text-text-muted">{material.type === "FLOWER" ? "Flower" : "Decoration"} · {unitLabels[material.unitOfMeasure]}</span></span>
              <span className={`shrink-0 text-xs font-semibold ${selected ? "text-text-muted" : "text-primary-deep"}`}>{selected ? "Added" : "Add"}</span>
            </button>;
          })}
        </div>}
        {materialsError && <div className="flex flex-wrap items-center gap-2 text-xs text-amber-800">
          <span role="status">{materialsError}</span>
          <Button type="button" onClick={() => setMaterialReloadKey((current) => current + 1)} disabled={materialsLoading} className="font-semibold underline">Retry material search</Button>
        </div>}

        {fieldErrors.recipe?.map((message) => <p key={message} className="text-xs text-red-700">{message}</p>)}
      </section>

      <footer className="flex flex-col-reverse gap-3 border-t border-neutral-border pt-5 sm:flex-row sm:justify-end">
        <Button type="button" onClick={cancelCreation} disabled={saving} className="rounded-xl border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">{createdProduct ? "Open created Product" : "Cancel"}</Button>
        <Button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{saving ? (editing ? "Saving…" : createdProduct ? "Uploading images…" : "Creating…") : editing ? "Save changes" : createdProduct ? "Retry image upload" : "Create Draft"}</Button>
      </footer>
    </form>
  </section>;
}
