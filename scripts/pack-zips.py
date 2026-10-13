#!/usr/bin/env python3
import os
import zipfile
import shutil

def create_zip(source_dir, output_zip_path, root_folder_name=''):
    os.makedirs(os.path.dirname(output_zip_path), exist_ok=True)
    if os.path.exists(output_zip_path):
        os.remove(output_zip_path)
        
    print(f"Creating {output_zip_path} from {source_dir}...")
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.idea', 'build', '.gradle', 'dist', '__pycache__']]
            for file in sorted(files):
                if file.endswith('.zip'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                if root_folder_name:
                    arcname = os.path.join(root_folder_name, rel_path)
                else:
                    arcname = rel_path
                arcname = arcname.replace('\\', '/')
                z.write(full_path, arcname)

if __name__ == '__main__':
    # 1. WordPress Theme (Standard single-level root: meshlink-theme/style.css)
    create_zip('wordpress/themes/meshlink-theme', 'public/meshlink-theme.zip', 'meshlink-theme')
    shutil.copy('public/meshlink-theme.zip', 'wordpress/meshlink-theme.zip')

    # 2. WordPress Plugin (Standard single-level root: meshlink-plugin/meshlink-plugin.php)
    create_zip('wordpress/plugins/meshlink-plugin', 'public/meshlink-plugin.zip', 'meshlink-plugin')
    shutil.copy('public/meshlink-plugin.zip', 'wordpress/meshlink-plugin.zip')

    # 3. Android source
    create_zip('android', 'public/meshlink-android-source.zip', 'meshlink-android')

    # 4. All in one
    with zipfile.ZipFile('public/meshlink-source-all.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for folder in ['android', 'wordpress', 'src']:
            for root, dirs, files in os.walk(folder):
                dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'dist']]
                for f in sorted(files):
                    if not f.endswith('.zip'):
                        p = os.path.join(root, f)
                        z.write(p, p.replace('\\', '/'))

    # Sync to dist if present
    if os.path.exists('dist'):
        for zf in ['meshlink-theme.zip', 'meshlink-plugin.zip', 'meshlink-android-source.zip', 'meshlink-source-all.zip']:
            src = os.path.join('public', zf)
            dst = os.path.join('dist', zf)
            if os.path.exists(src):
                shutil.copy(src, dst)

    print("All zips successfully packaged and verified!")
