import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isPublicHttpsUrl(value) {
  return /^https:\/\//i.test(String(value || ""));
}

export function renderedMediaPathsForManifest({ packDir, manifest }) {
  assert(Array.isArray(manifest.slides), "render-manifest.json missing slides array.");
  assert(manifest.output_dir, "render-manifest.json missing output_dir.");
  return manifest.slides.map((slide) => path.resolve(packDir, manifest.output_dir, slide.output_file));
}

export function publicMediaPathsForRenderedSlides({ packDir, manifest, uploadManifest }) {
  assert(Array.isArray(uploadManifest.objects), "Upload manifest missing objects array.");
  const publicUrlByLocalPath = new Map();

  for (const item of uploadManifest.objects) {
    if (!item.local_path || !item.public_url) continue;
    publicUrlByLocalPath.set(path.resolve(item.local_path), item.public_url);
  }

  return renderedMediaPathsForManifest({ packDir, manifest }).map((localPath) => {
    const publicUrl = publicUrlByLocalPath.get(localPath);
    assert(publicUrl, `Upload manifest missing public URL for rendered slide: ${localPath}`);
    assert(isPublicHttpsUrl(publicUrl), `Rendered slide public URL must be HTTPS: ${publicUrl}`);
    return publicUrl;
  });
}

export function storageSlugForPack(campaignDate, slug) {
  const prefix = `${campaignDate}-`;
  return String(slug || "slideshow").startsWith(prefix)
    ? String(slug).slice(prefix.length)
    : String(slug || "slideshow");
}
