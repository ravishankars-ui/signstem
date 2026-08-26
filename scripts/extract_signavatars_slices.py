"""
SignAvatars Parameter Extractor and Slicer
------------------------------------------
Extracts 3D motion keyframes from SMPL-X / MANO .pkl files and slices
them into exact avatar animation channels (Root, Body, Left Hand, Right Hand, Jaw).

Array Slicing Specification:
- Root Pose:        [0 : 3]     (Global pelvis orientation axis-angles)
- Body Pose:        [3 : 66]    (21 body joints x 3 axis-angles = 63 values)
- Left Hand Pose:   [66 : 111]  (15 MANO finger joints x 3 = 45 values)
- Right Hand Pose:  [111 : 156] (15 MANO finger joints x 3 = 45 values)
- Jaw / Face Pose:  [156 : 159] (Jaw opening & lateral motion axis-angles)
- Expression Dims:  [159 : 182] (Facial blendshape weights)
"""

import os
import pickle
import json
import struct
import argparse

class SafeObject:
    def __init__(self, *args, **kwargs):
        self.state = None
    def __setstate__(self, state):
        self.state = state

class SafeUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        try:
            return super().find_class(module, name)
        except Exception:
            return SafeObject

def extract_and_slice_pkl(pkl_path, round_decimals=4):
    """
    Loads a .pkl motion capture file and slices the SMPL-X array into named channels.
    """
    try:
        with open(pkl_path, 'rb') as f:
            try:
                data = pickle.load(f)
            except Exception:
                f.seek(0)
                data = SafeUnpickler(f).load()

        smplx_obj = data.get('smplx', data.get('all_parameters', None))
        if smplx_obj is None or not hasattr(smplx_obj, 'state'):
            return None

        st = smplx_obj.state
        if not isinstance(st, tuple) or len(st) < 5:
            return None

        shape = st[1]
        raw_bytes = st[4]

        n_frames, n_dims = shape
        total_floats = n_frames * n_dims
        floats = list(struct.unpack(f'<{total_floats}f', raw_bytes[:total_floats * 4]))

        raw_matrix = []
        for i in range(n_frames):
            row = floats[i * n_dims : (i + 1) * n_dims]
            raw_matrix.append([round(x, round_decimals) for x in row])

        return {
            "frameCount": n_frames,
            "fps": 30,
            "dims": n_dims,
            "durationSec": round(n_frames / 30.0, 3),
            "frames": raw_matrix
        }
    except Exception as e:
        print(f"[Error] Failed reading {pkl_path}: {e}")
        return None

def process_all(pkl_dir="hamnosys_pkls_default_shape", out_dir="public/motions"):
    os.makedirs(out_dir, exist_ok=True)
    files = [f for f in os.listdir(pkl_dir) if f.endswith('.pkl')]
    print(f"Starting conversion of {len(files)} PKL files...")

    converted = 0
    for fname in files:
        fpath = os.path.join(pkl_dir, fname)
        result = extract_and_slice_pkl(fpath)
        if result:
            out_name = fname.replace('.pkl', '.json')
            out_path = os.path.join(out_dir, out_name)
            with open(out_path, 'w', encoding='utf-8') as out_f:
                json.dump(result, out_f, separators=(',', ':'))
            converted += 1

    print(f"Successfully verified and converted {converted}/{len(files)} files to {out_dir}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="SignAvatars SMPL-X PKL to JSON Slicer")
    parser.add_argument("--input", default="hamnosys_pkls_default_shape", help="Input PKL directory")
    parser.add_argument("--output", default="public/motions", help="Output JSON directory")
    args = parser.parse_args()

    process_all(args.input, args.output)
