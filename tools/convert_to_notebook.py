"""Convert practical_ml.md to a Jupyter Notebook (.ipynb)"""
import json
import re

def md_to_notebook(md_path, ipynb_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    cells = []
    # Split on code fences
    parts = re.split(r'(```python\n.*?```)', content, flags=re.DOTALL)

    for part in parts:
        part = part.strip()
        if not part:
            continue

        if part.startswith('```python\n') and part.endswith('```'):
            # Code cell
            code = part[len('```python\n'):-len('```')].strip()
            cells.append({
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [line + '\n' for line in code.split('\n')]
            })
        else:
            # Markdown cell — split on double newlines to keep cells manageable
            # but keep headers with their content
            lines = part.split('\n')
            current_chunk = []
            for line in lines:
                if line.startswith('# ') and current_chunk:
                    # New major section — flush previous chunk
                    text = '\n'.join(current_chunk).strip()
                    if text:
                        cells.append({
                            "cell_type": "markdown",
                            "metadata": {},
                            "source": [l + '\n' for l in text.split('\n')]
                        })
                    current_chunk = [line]
                else:
                    current_chunk.append(line)

            if current_chunk:
                text = '\n'.join(current_chunk).strip()
                if text:
                    cells.append({
                        "cell_type": "markdown",
                        "metadata": {},
                        "source": [l + '\n' for l in text.split('\n')]
                    })

    # Fix: remove trailing \n from last line of each cell's source
    for cell in cells:
        if cell['source']:
            cell['source'][-1] = cell['source'][-1].rstrip('\n')

    notebook = {
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.11.0",
                "mimetype": "text/x-python",
                "file_extension": ".py"
            }
        },
        "cells": cells
    }

    with open(ipynb_path, 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=1, ensure_ascii=False)

    print(f"Created {ipynb_path}")
    print(f"  Total cells: {len(cells)}")
    print(f"  Markdown cells: {sum(1 for c in cells if c['cell_type'] == 'markdown')}")
    print(f"  Code cells: {sum(1 for c in cells if c['cell_type'] == 'code')}")

if __name__ == '__main__':
    md_to_notebook('practical_ml.md', 'practical_ml.ipynb')
