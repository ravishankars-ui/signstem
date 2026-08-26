import pickle
import os
import json
import struct

class SafeObject:
    def __init__(self, *args, **kwargs):
        self.state = None
    def __setstate__(self, state):
        self.state = state

class PKLUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        try:
            return super().find_class(module, name)
        except Exception:
            return SafeObject

def extract_smplx_matrix(pkl_path):
    try:
        with open(pkl_path, 'rb') as f:
            data = PKLUnpickler(f).load()
        
        smplx_obj = data.get('smplx')
        if not smplx_obj or not hasattr(smplx_obj, 'state'):
            return None

        st = smplx_obj.state
        if not isinstance(st, tuple) or len(st) < 5:
            return None

        shape = st[1]
        raw_bytes = st[4]

        n_frames, n_dims = shape
        total_floats = n_frames * n_dims

        floats = list(struct.unpack(f'<{total_floats}f', raw_bytes[:total_floats * 4]))

        matrix = []
        for i in range(n_frames):
            row = floats[i * n_dims : (i + 1) * n_dims]
            matrix.append([round(x, 4) for x in row])

        return matrix
    except Exception as e:
        print(f"Error reading {pkl_path}: {e}")
        return None

def convert_all():
    pkl_dir = os.path.join(os.getcwd(), 'hamnosys_pkls_default_shape')
    out_dir = os.path.join(os.getcwd(), 'public', 'motions')
    os.makedirs(out_dir, exist_ok=True)

    count = 0
    for fname in os.listdir(pkl_dir):
        if fname.endswith('.pkl'):
            fpath = os.path.join(pkl_dir, fname)
            matrix = extract_smplx_matrix(fpath)
            if matrix:
                out_name = fname.replace('.pkl', '.json')
                out_path = os.path.join(out_dir, out_name)
                with open(out_path, 'w') as out_f:
                    json.dump({"frames": matrix, "frameCount": len(matrix), "dims": len(matrix[0])}, out_f)
                count += 1

    print(f"Successfully converted {count} PKL files to JSON in {out_dir}")

if __name__ == '__main__':
    convert_all()
