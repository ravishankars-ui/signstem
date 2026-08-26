import bpy
import json
import os
from mathutils import Euler

# ==============================================================================
# Universal Blender Python Script for SignSTEM Avatars (with Posture Fixes)
#
# Fixes:
# - Head downward tilt (adds upright head & neck pitch correction)
# - Arm elevation (raises arms into proper chest/face signing box)
# - Compatible with both Mixamo FBX (Ch33_nonPBR.fbx) and GLB (zhenja.glb)
# ==============================================================================

PROJECT_DIR = r"E:\koo"

# Input Motion & Avatar
MOTION_JSON = os.path.join(PROJECT_DIR, "public", "motions", "10014.json")  # 10014 = HELLO

# --- Posture Correction Parameters ---
# Values calibrated to bring both arms forward into the natural ISL signing space in front of the chest
HEAD_PITCH_OFFSET = 0.45   # Lifts head upright (~25 degrees)
NECK_PITCH_OFFSET = 0.25   # Lifts neck straight

# Forward angle offsets to prevent arms from rotating behind the back
LEFT_ARM_PITCH    = 0.35   # Forward/up elevation
LEFT_ARM_YAW      = 0.60   # Swings left arm forward in front of chest
LEFT_ARM_ROLL     = -0.25

RIGHT_ARM_PITCH   = 0.35   # Forward/up elevation
RIGHT_ARM_YAW     = -0.60  # Swings right arm forward in front of chest
RIGHT_ARM_ROLL    = 0.25

BONE_MAPPING = {
    'Head': ['mixamorigHead', 'Head'],
    'Neck': ['mixamorigNeck', 'Neck'],
    'Spine2': ['mixamorigSpine2', 'Spine2', 'mixamorigSpine1', 'Spine1'],
    'LeftArm': ['mixamorigLeftArm', 'LeftArm'],
    'LeftForeArm': ['mixamorigLeftForeArm', 'LeftForeArm'],
    'LeftHand': ['mixamorigLeftHand', 'LeftHand'],
    'RightArm': ['mixamorigRightArm', 'RightArm'],
    'RightForeArm': ['mixamorigRightForeArm', 'RightForeArm'],
    'RightHand': ['mixamorigRightHand', 'RightHand'],

    # Left & Right Finger Bones
    'LeftHandThumb1': ['mixamorigLeftHandThumb1', 'LeftHandThumb1'],
    'LeftHandIndex1': ['mixamorigLeftHandIndex1', 'LeftHandIndex1'],
    'LeftHandMiddle1': ['mixamorigLeftHandMiddle1', 'LeftHandMiddle1'],
    'LeftHandRing1': ['mixamorigLeftHandRing1', 'LeftHandRing1'],
    'LeftHandPinky1': ['mixamorigLeftHandPinky1', 'LeftHandPinky1'],

    'RightHandThumb1': ['mixamorigRightHandThumb1', 'RightHandThumb1'],
    'RightHandIndex1': ['mixamorigRightHandIndex1', 'RightHandIndex1'],
    'RightHandMiddle1': ['mixamorigRightHandMiddle1', 'RightHandMiddle1'],
    'RightHandRing1': ['mixamorigRightHandRing1', 'RightHandRing1'],
    'RightHandPinky1': ['mixamorigRightHandPinky1', 'RightHandPinky1'],
}

def find_target_bone(pose_bones, target_key):
    """Finds bone matching standard or Mixamo naming (mixamorig)."""
    aliases = BONE_MAPPING.get(target_key, [target_key])
    for name in aliases:
        if name in pose_bones:
            return pose_bones[name]
        for b in pose_bones:
            if b.name == name or b.name.endswith(name):
                return b
    return None

def apply_smplx_motion_to_armature(armature, motion_json_path):
    if not os.path.exists(motion_json_path):
        print(f"Error: Motion JSON not found at {motion_json_path}")
        return

    with open(motion_json_path, 'r') as f:
        data = json.load(f)

    frames = data.get('frames', [])
    frame_count = len(frames)
    print(f"[Blender Script] Keyframing {frame_count} frames on {armature.name}...")

    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='POSE')

    pose_bones = armature.pose.bones
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = frame_count
    scene.render.fps = 30

    for f_idx, row in enumerate(frames):
        current_frame = f_idx + 1
        scene.frame_set(current_frame)

        def set_bone_rotation(target_key, rx, ry, rz):
            bone = find_target_bone(pose_bones, target_key)
            if bone:
                bone.rotation_mode = 'XYZ'
                bone.rotation_euler = Euler((rx, ry, rz), 'XYZ')
                bone.keyframe_insert(data_path="rotation_euler", frame=current_frame)

        def get_dim(idx):
            return row[idx] if idx < len(row) else 0.0

        # 1. Head & Neck (SMPL-X neck: 36..38, head: 45..47)
        set_bone_rotation('Head', (get_dim(45) or 0) * 0.4 + HEAD_PITCH_OFFSET, (get_dim(46) or 0) * 0.4, (get_dim(47) or 0) * 0.4)
        set_bone_rotation('Neck', (get_dim(36) or 0) * 0.4 + NECK_PITCH_OFFSET, (get_dim(37) or 0) * 0.4, (get_dim(38) or 0) * 0.4)

        # Rig type detection (Mixamo vs ReadyPlayerMe)
        is_mixamo = any('mixamorig' in b.name for b in pose_bones)

        if is_mixamo:
            # Mixamo Armature: Arms along +/-X axis in rest pose.
            # Forward swing is along Z axis; elbow flexion is along Z/Y.
            targetL_rotX = (get_dim(48) or 0) * 0.4
            targetL_rotY = 0.25 + (get_dim(49) or 0) * 0.3
            targetL_rotZ = -0.75 - abs(get_dim(50) or 0) * 0.35
            set_bone_rotation('LeftArm', targetL_rotX, targetL_rotY, targetL_rotZ)

            left_elbow = min(2.2, abs(get_dim(55) or get_dim(54) or 0))
            set_bone_rotation('LeftForeArm', 0.0, (get_dim(54) or 0) * 0.2, -1.25 - left_elbow * 0.55)
            set_bone_rotation('LeftHand', (get_dim(60) or 0) * 0.5, (get_dim(61) or 0) * 0.5, (get_dim(62) or 0) * 0.5)

            targetR_rotX = (get_dim(51) or 0) * 0.4
            targetR_rotY = -0.25 - (get_dim(52) or 0) * 0.3
            targetR_rotZ = 0.75 + abs(get_dim(53) or 0) * 0.35
            set_bone_rotation('RightArm', targetR_rotX, targetR_rotY, targetR_rotZ)

            right_elbow = min(2.2, abs(get_dim(58) or get_dim(57) or 0))
            set_bone_rotation('RightForeArm', 0.0, (get_dim(57) or 0) * -0.2, 1.25 + right_elbow * 0.55)
            set_bone_rotation('RightHand', (get_dim(63) or 0) * 0.5, (get_dim(64) or 0) * 0.5, (get_dim(65) or 0) * 0.5)
        else:
            # ReadyPlayerMe / GLB Armature: Bones point along +Y axis.
            # Forward pitch is X axis; inward tuck is Z axis; elbow flexion is X axis.
            targetL_rotX = 0.72 + (get_dim(48) or 0) * 0.35
            targetL_rotY = 0.15 + (get_dim(49) or 0) * 0.25
            targetL_rotZ = -0.35 - (get_dim(50) or 0) * 0.20
            set_bone_rotation('LeftArm', targetL_rotX, targetL_rotY, targetL_rotZ)

            left_elbow = min(1.8, abs(get_dim(55) or get_dim(54) or 0))
            set_bone_rotation('LeftForeArm', 1.05 + left_elbow * 0.45, (get_dim(54) or 0) * 0.2, 0)
            set_bone_rotation('LeftHand', (get_dim(60) or 0) * 0.5, (get_dim(61) or 0) * 0.5, (get_dim(62) or 0) * 0.5)

            targetR_rotX = 0.72 + (get_dim(51) or 0) * 0.35
            targetR_rotY = -0.15 + (get_dim(52) or 0) * 0.25
            targetR_rotZ = 0.35 - (get_dim(53) or 0) * 0.20
            set_bone_rotation('RightArm', targetR_rotX, targetR_rotY, targetR_rotZ)

            right_elbow = min(1.8, abs(get_dim(58) or get_dim(57) or 0))
            set_bone_rotation('RightForeArm', 1.05 + right_elbow * 0.45, (get_dim(57) or 0) * -0.2, 0)
            set_bone_rotation('RightHand', (get_dim(63) or 0) * 0.5, (get_dim(64) or 0) * 0.5, (get_dim(65) or 0) * 0.5)

        # 4. Finger Flexions (L: 75..119, R: 120..164)
        def flex_l(finger, offset):
            val = abs(get_dim(75 + offset)) * 0.8
            set_bone_rotation(f'{finger}1', val, 0, 0)
            set_bone_rotation(f'{finger}2', val * 0.7, 0, 0)

        def flex_r(finger, offset):
            val = abs(get_dim(120 + offset)) * 0.8
            set_bone_rotation(f'{finger}1', val, 0, 0)
            set_bone_rotation(f'{finger}2', val * 0.7, 0, 0)

        flex_l('LeftHandIndex', 9); flex_l('LeftHandMiddle', 18); flex_l('LeftHandRing', 27); flex_l('LeftHandPinky', 36)
        flex_r('RightHandIndex', 9); flex_r('RightHandMiddle', 18); flex_r('RightHandRing', 27); flex_r('RightHandPinky', 36)

    bpy.ops.object.mode_set(mode='OBJECT')
    print(f"[Blender Script] Done! Successfully keyframed {frame_count} frames with posture corrections.")

# Locate active Armature object in your open Blender scene
armature = None
for obj in bpy.context.scene.objects:
    if obj.type == 'ARMATURE':
        armature = obj
        break

if armature:
    apply_smplx_motion_to_armature(armature, MOTION_JSON)
else:
    print("No Armature found in open Blender scene! Please select your avatar armature.")
