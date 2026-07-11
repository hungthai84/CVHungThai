import re

with open('components/EducationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="info-card"', 'className="info-card" style={{ background: "transparent", boxShadow: "none", border: "none" }}')

with open('components/EducationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
