import os
import sys
sys.path.insert(0, os.path.abspath('../..'))

# Project information
project = 'Education Platform'
copyright = '2025'
author = 'Второв Андрей, Кузьменко Всеволод, Лащенков Евгений'
release = '1.0.0'

# General extensions
extensions = [
    'sphinx.ext.autodoc',      # Автоматическая документация из docstrings
    'sphinx.ext.napoleon',     # Поддержка Google/NumPy стиля docstrings
    'sphinx.ext.viewcode',     # Добавляет ссылки на исходный код
]

# HTML output
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

# Language
language = 'ru'

# Автоматически добавлять в документацию все модули
autodoc_default_options = {
    'members': True,
    'member-order': 'bysource',
    'special-members': '__init__',
    'undoc-members': True,
    'exclude-members': '__weakref__',
}