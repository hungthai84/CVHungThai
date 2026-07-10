import re

with open('components/SettingsPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_colors = "const accentColors = ['#101733', '#ED1B2F', '#AE2070', '#FF6525', '#FFB300', '#49C16C', '#0078D4', '#6C6CE5', '#FFFFFF'];"
new_colors = "const accentColors = ['#101733', '#ED1B2F', '#AE2070', '#FF6525', '#FFB300', '#49C16C', '#0078D4', '#6C6CE5', '#FFFFFF', '#001D39', '#0A4174', '#49769F', '#4E8EA2', '#6EA2B3', '#7BBDE8', '#BDD8E9'];"

content = content.replace(old_colors, new_colors)

with open('components/SettingsPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Colors updated")
