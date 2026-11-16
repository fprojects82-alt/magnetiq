"use client";

import { useState } from "react";
import { savePackage } from "@/app/admin/(dashboard)/packages/actions";
import { ImageUploader } from "@/components/ImageUploader";

interface PackageFormProps {
  pkg?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    badge: string | null;
    composition: string;
    sampleImageUrl: string;
    photoSlots: number;
    line: string | null;
    active: boolean;
  };
}

export function PackageForm({ pkg }: PackageFormProps) {
  const [sampleImageUrl, setSampleImageUrl] = useState<string | null>(pkg?.sampleImageUrl || null);
  const action = savePackage.bind(null, pkg?.id || null);

  return (
    <form action={action} className="card-surface max-w-xl space-y-4 p-6">
      <input type="hidden" name="sampleImageUrl" value={sampleImageUrl || ""} />

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Sample image</label>
        <ImageUploader value={sampleImageUrl} onChange={setSampleImageUrl} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
        <input name="name" required defaultValue={pkg?.name} className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Slug</label>
        <input name="slug" required defaultValue={pkg?.slug} className="input-field" placeholder="e.g. valentine-bundle" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
        <textarea name="description" required rows={3} defaultValue={pkg?.description} className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Composition</label>
        <input name="composition" required defaultValue={pkg?.composition} className="input-field" placeholder="e.g. 5 x Small Magnets" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Price (EGP)</label>
          <input name="price" type="number" min={0} required defaultValue={pkg?.price} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Compare-at price (optional)</label>
          <input name="compareAtPrice" type="number" min={0} defaultValue={pkg?.compareAtPrice ?? ""} className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Badge text (optional)</label>
          <input name="badge" defaultValue={pkg?.badge ?? ""} className="input-field" placeholder="e.g. -50%" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Photo slots</label>
          <input name="photoSlots" type="number" min={1} max={200} required defaultValue={pkg?.photoSlots ?? 1} className="input-field" />
        </div>
      </div>
      <div>
        <label htmlFor="pkg-line" className="mb-1 block text-sm font-medium text-stone-700">Print line</label>
        <select id="pkg-line" name="line" defaultValue={pkg?.line ?? ""} className="input-field">
          <option value="">None (gift set / other)</option>
          <option value="PRESSED">Pressed Magnets (5 x 5 cm)</option>
          <option value="FLAT">Flat Magnets (7 x 10 cm)</option>
          <option value="STICKER">3D Stickers (3 x 3 cm)</option>
          <option value="BOOKMARK">Magnetic Bookmarks</option>
        </select>
        <p className="mt-1 text-xs text-stone-400">Bundles in a print line are grouped together and shown as size options in the shop.</p>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input type="checkbox" name="active" defaultChecked={pkg?.active ?? true} />
        Active (visible in shop)
      </label>

      <button type="submit" className="btn-primary">Save Package</button>
    </form>
  );
}
