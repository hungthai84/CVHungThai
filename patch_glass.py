import re

with open('components/SettingsPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_wallpaper = """    {
        id: 'glassmorphism-effect',
        type: 'custom' as const,
        thumbnail: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
    },"""
content = content.replace(
    "const specialAndVideoWallpapers = [",
    "const specialAndVideoWallpapers = [\n" + new_wallpaper
)

with open('components/SettingsPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated SettingsPanel.tsx")
