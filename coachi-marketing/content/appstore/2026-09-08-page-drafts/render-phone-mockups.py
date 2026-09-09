"""Refine the existing editable Coachi handset for local product-page review.

Run in Blender. Hardware comes from the verified ad scene; selected source UI
comes from this package's existing inventory. Neither input is overwritten.
"""

import argparse
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector


PACKAGE = Path(__file__).resolve().parent
MARKETING = PACKAGE.parents[2]
SCENE_DIR = MARKETING / "content/video/generated/2026-09-07-native-captures/phones/walking-free/scene"
SOURCE_SCENE = SCENE_DIR / "coachi-phone.blend"
BUILDER_PATH = MARKETING / "content/video/generated/2026-09-04-coachi-cinematic-v2/pilot/blender/build_phone.py"
SIZE = (1320, 2400)
SELECTIONS = {
    "workouts-en": {"source": "C012", "yaw": -8, "label": "Choose your workout", "locale": "en"},
    "target-en": {"source": "target-en", "yaw": 0, "label": "Set your distance", "locale": "en"},
    "intervals-en": {"source": "C062", "yaw": 8, "label": "Build your intervals", "locale": "en"},
    "intervals-sets-en": {"source": "C052", "yaw": 8, "label": "Build your intervals", "locale": "en"},
    "target-no": {"source": "C087", "yaw": 0, "label": "Velg distansen din", "locale": "nb"},
}


def digest(path):
    with Path(path).open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def point_at(obj, target):
    forward = (Vector(target) - obj.location).normalized()
    right = forward.cross(Vector((0, 1, 0))).normalized()
    up = right.cross(forward).normalized()
    obj.rotation_euler = Matrix((right, up, -forward)).transposed().to_euler()


def ui_geometry_hash(ui):
    value = {"vertices": [list(v.co) for v in ui.data.vertices],
             "uv": [list(loop.uv) for loop in ui.data.uv_layers.active.data]}
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


def refine_hardware_corners(meshes, ui):
    """Round the original hardware rings; leave the source screen mesh untouched."""
    spec = importlib.util.spec_from_file_location("coachi_existing_phone_geometry", BUILDER_PATH)
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    before = ui_geometry_hash(ui)
    profiles = [("01 •", [.975, 1.02, 1.02, .965]), ("02 •", [.91, .885])]
    outlines = []
    for prefix, radii in profiles:
        obj = next(item for item in meshes if item.name.startswith(prefix))
        ring_size = len(obj.data.vertices) // len(radii)
        if ring_size != 84:
            raise ValueError("Canonical hardware topology changed")
        for index, radius in enumerate(radii):
            vertices = list(obj.data.vertices)[index * ring_size:(index + 1) * ring_size]
            width = max(v.co.x for v in vertices) - min(v.co.x for v in vertices)
            height = max(v.co.y for v in vertices) - min(v.co.y for v in vertices)
            outline = builder.rounded_outline(width, height, radius, 20)
            for vertex, (x, y) in zip(vertices, outline):
                vertex.co.x, vertex.co.y = x, y
            if index == len(radii) - 1:
                outlines.append(outline)
        obj.data.update()
    # Every source-screen vertex must remain inside both physical front outlines.
    for outline in outlines:
        for vertex in ui.data.vertices:
            x, y = vertex.co.x, vertex.co.y
            for (ax, ay), (bx, by) in zip(outline, outline[1:] + outline[:1]):
                if (bx - ax) * (y - ay) - (by - ay) * (x - ax) < -1e-6:
                    raise ValueError("Refined hardware would expose a source-screen corner")
    after = ui_geometry_hash(ui)
    if before != after:
        raise ValueError("Hardware refinement altered the original source UI geometry")
    return {"body_corner_radius": 1.02, "front_glass_corner_radius": .885,
            "source_screen_mask_unchanged": True, "source_screen_fully_enclosed": True,
            "ui_geometry_before": before, "ui_geometry_after": after,
            "geometry_helper": str(BUILDER_PATH), "geometry_helper_sha256": digest(BUILDER_PATH)}


def projection(scene, ui, width, height, source):
    """Verify full screen bounds and local sampling density, not just canvas size."""
    bpy.context.view_layer.update()

    def pixel(u, v):
        world = ui.matrix_world @ Vector(((u - .5) * width, (v - .5) * height, .387))
        ndc = world_to_camera_view(scene, scene.camera, world)
        if ndc.z <= 0 or not 0 <= ndc.x <= 1 or not 0 <= ndc.y <= 1:
            raise ValueError("Screen lies outside the frame")
        return Vector((ndc.x * SIZE[0], (1 - ndc.y) * SIZE[1]))

    peak = 0.0
    for x in range(11):
        for y in range(11):
            u, v = x / 10, y / 10
            du, dv = (.001 if u < 1 else -.001), (.001 if v < 1 else -.001)
            here = pixel(u, v)
            peak = max(peak, (pixel(u + du, v) - here).length / (abs(du) * source["width"]),
                       (pixel(u, v + dv) - here).length / (abs(dv) * source["height"]))
    return {"max_output_pixels_per_source_pixel": peak,
            "corners_tl_tr_br_bl": [list(pixel(u, v)) for u, v in [(0, 1), (1, 1), (1, 0), (0, 0)]]}


def render(name, selection, output, samples, inventory_path):
    record = json.loads((SCENE_DIR / "render-manifest.json").read_text())
    original = next(item for item in record["outputs"] if item["path"] == str(SOURCE_SCENE))
    if digest(SOURCE_SCENE) != original["sha256"]:
        raise ValueError("Canonical handset scene changed")
    inventory = json.loads(inventory_path.read_text())
    source = next(item for item in inventory["selected_sources"] if item["id"] == selection["source"])
    source_path = PACKAGE / source["file"]
    if not source["kind"].lower().startswith("genuine") or digest(source_path) != source["sha256"]:
        raise ValueError("Selected full-resolution genuine source changed")
    if not 2.10 <= source["height"] / source["width"] <= 2.25:
        raise ValueError("A cropped panel cannot substitute for a full phone screen")
    final = output / f"{name}.png"
    manifest_path = output / f"{name}.json"
    blend_path = output / f"{name}.blend"
    if any(path.exists() for path in (final, manifest_path, blend_path)):
        raise FileExistsError("Preserve prior renders; choose another output directory")
    output.mkdir(parents=True, exist_ok=True)
    snapshot = output / "inventory-at-render.json"
    if snapshot.exists() and digest(snapshot) != digest(inventory_path):
        raise ValueError("Input inventory changed within this render set")
    if not snapshot.exists():
        snapshot.write_bytes(inventory_path.read_bytes())
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE_SCENE))
    scene = bpy.context.scene
    meshes = [obj for obj in scene.objects if obj.type == "MESH"]
    ui = next(obj for obj in meshes if obj.name.startswith("03 • APPROVED REAL iOS UI"))
    source_width = record["phone"]["screen_width"]
    source_height = source_width * source["height"] / source["width"]
    height_ratio = source_height / record["phone"]["screen_height"]
    # Preserve the source's exact aspect ratio while reusing all existing mesh topology.
    for obj in meshes:
        for vertex in obj.data.vertices:
            vertex.co.y *= height_ratio
        obj.location.y *= height_ratio
    hardware = refine_hardware_corners(meshes, ui)
    texture = bpy.data.images.load(str(source_path), check_existing=False)
    texture.colorspace_settings.name = "sRGB"
    if tuple(texture.size) != (source["width"], source["height"]):
        raise ValueError("Decoded source dimensions changed")
    texture.pack()
    material = ui.data.materials[0]
    image_node = next(node for node in material.node_tree.nodes if node.type == "TEX_IMAGE")
    image_node.image = texture
    image_node.interpolation = "Linear"
    emission = next(node for node in material.node_tree.nodes if node.type == "EMISSION")
    emission.inputs["Strength"].default_value = 1
    ui["source_sha256"] = source["sha256"]
    ui["source_manifest"] = json.dumps(source, sort_keys=True)
    ui["source_capture_date"] = "See selected source inventory; export date is not capture proof"
    ui["mapping_policy"] = "Full original UV texture; no redraw, crop, glass or grade over UI"

    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.adaptive_threshold = .01
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 8
    scene.render.resolution_x, scene.render.resolution_y = SIZE
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "16"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.render.dither_intensity = 0
    scene.camera.data.dof.use_dof = False

    # Light only the physical case. The source screen remains an unlit sRGB texture.
    for name_prefix, energy, color, size, location in [
        ("Large neutral key", 1100, (.97, .985, 1.0), 11, (-7, 4, 13)),
        ("Long soft right", 900, (.96, .985, 1.0), 9, (8, 0, 8)),
        ("Restrained Coachi", 650, (1.0, .99, .96), 9, (-2, -8, 9)),
        ("Top separation", 900, (1.0, .99, .97), 10, (0, 11, 8)),
    ]:
        lamp = next(obj for obj in scene.objects if obj.type == "LIGHT" and obj.name.startswith(name_prefix))
        lamp.data.energy, lamp.data.color, lamp.data.size = energy, color, size
        lamp.data.shape = "RECTANGLE"
        lamp.data.size_y = 15
        lamp.location = location
        point_at(lamp, (0, 0, 0))
    world = scene.world.node_tree.nodes["Background"]
    world.inputs["Color"].default_value = (.32, .35, .33, 1)
    world.inputs["Strength"].default_value = .35
    body = bpy.data.materials.get("Graphite brushed metal • procedural geometry")
    metal = body.node_tree.nodes.get("Principled BSDF")
    metal.inputs["Base Color"].default_value = (.075, .083, .092, 1)
    metal.inputs["Metallic"].default_value = .92
    metal.inputs["Roughness"].default_value = .32
    bevel = bpy.data.materials.get("Satin edge highlight").node_tree.nodes.get("Principled BSDF")
    bevel.inputs["Base Color"].default_value = (.24, .27, .29, 1)
    bevel.inputs["Roughness"].default_value = .27

    yaw = math.radians(selection["yaw"])
    distance = 34.0
    scene.camera.location = (math.sin(yaw) * distance, 0, math.cos(yaw) * distance)
    point_at(scene.camera, (0, 0, 0))
    projected = projection(scene, ui, source_width, source_height, source)
    for _ in range(30):
        if projected["max_output_pixels_per_source_pixel"] <= .97:
            break
        distance *= 1.025
        scene.camera.location = (math.sin(yaw) * distance, 0, math.cos(yaw) * distance)
        point_at(scene.camera, (0, 0, 0))
        projected = projection(scene, ui, source_width, source_height, source)
    if projected["max_output_pixels_per_source_pixel"] > 1:
        raise ValueError("Rendering would upscale the source")
    body_points = [world_to_camera_view(scene, scene.camera, obj.matrix_world @ Vector(corner))
                   for obj in meshes for corner in obj.bound_box]
    if any(p.z <= 0 or not .025 < p.x < .975 or not .025 < p.y < .975 for p in body_points):
        raise ValueError("Physical handset or buttons are too close to output edge")
    scene["asset_role"] = "local_unbranded_product_mockup_not_native_screenshot_or_upload_cleared"
    scene["source_screen_sha256"] = source["sha256"]
    scene["render_contract"] = "Cycles studio still; upright yaw only; separate unlit genuine UI"
    scene.render.filepath = str(final)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.render.render(write_still=True)
    result = {
        "id": name, "label": selection["label"], "locale": selection["locale"],
        "status": "LOCAL_3D_DESIGN_REVIEW_NOT_UPLOAD_CLEARED", "hardware": "unbranded procedural handset",
        "source_id": source["id"], "source_path": str(source_path), "source_sha256": source["sha256"],
        "source_dimensions": [source["width"], source["height"]], "source_aspect": source["height"] / source["width"],
        "screen_aspect": source_height / source_width, "source_ui_redrawn": False,
        "base_scene": str(SOURCE_SCENE), "base_scene_sha256": original["sha256"],
        "inventory_sha256": digest(inventory_path), "yaw_degrees": selection["yaw"], "pitch_degrees": 0,
        "camera_roll_degrees": 0, "projection": projected, "size": list(SIZE),
        "engine": scene.render.engine, "samples": samples, "blender_version": bpy.app.version_string,
        "hardware_refinement": hardware,
        "finish": "satin graphite with rounded hardware rings and neutral softbox reflections",
        "color": "sRGB Standard; screen emission 1; no overlaid reflection, grade, glow or invented controls",
        "render": final.name, "sha256": digest(final), "editable_scene": blend_path.name,
        "editable_scene_sha256": digest(blend_path), "published": False,
    }
    manifest_path.write_text(json.dumps(result, indent=2) + "\n")
    print("COACHI_RENDER_RESULT " + json.dumps(result), flush=True)


if __name__ == "__main__":
    arguments = sys.argv[sys.argv.index("--") + 1:]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("names", nargs="+", choices=SELECTIONS)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--samples", type=int, choices=(64, 128, 256), default=256)
    parser.add_argument("--inventory", type=Path, default=PACKAGE / "inventory.json")
    args = parser.parse_args(arguments)
    if not args.output.is_absolute() or not args.inventory.is_absolute():
        raise ValueError("Output and source inventory must be explicit absolute paths")
    for selected in args.names:
        render(selected, SELECTIONS[selected], args.output, args.samples, args.inventory)
