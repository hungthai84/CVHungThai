import re

with open('components/EducationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="education-card-front" style={{ display: \'flex\', flexDirection: \'column\', justifyContent: \'space-between\', height: \'110px\' }}', 'className="education-card-front" style={{ display: \'flex\', flexDirection: \'column\', justifyContent: \'space-between\', height: \'110px\', background: "transparent", border: "none", boxShadow: "none" }}')
content = content.replace('className="education-card-back" style={{ display: \'flex\', flexDirection: \'column\', justifyContent: \'center\' }}', 'className="education-card-back" style={{ display: \'flex\', flexDirection: \'column\', justifyContent: \'center\', background: "transparent", border: "none", boxShadow: "none" }}')

with open('components/EducationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
