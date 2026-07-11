import os

components = ['AboutPage.tsx', 'EducationPage.tsx', 'ProjectsPage.tsx', 'ServicesPage.tsx', 'SkillsPage.tsx']

for component in components:
    path = os.path.join('components', component)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove info-card inline style
    content = content.replace('style={{ background: "transparent", boxShadow: "none", border: "none" }}', '')
    content = content.replace('style={{ background: "transparent", boxShadow: "none", border: "none", padding: \'1.5rem\' }}', 'style={{ padding: \'1.5rem\' }}')
    
    # Remove EducationPage specific inline styles
    content = content.replace('style={{ display: \'flex\', flexDirection: \'column\', justifyContent: \'space-between\', height: \'110px\', background: "transparent", border: "none", boxShadow: "none" }}', 'style={{ display: \'flex\', flexDirection: \'column\', justifyContent: \'space-between\', height: \'110px\' }}')
    content = content.replace('style={{ display: \'flex\', flexDirection: \'column\', justifyContent: \'center\', background: "transparent", border: "none", boxShadow: "none" }}', 'style={{ display: \'flex\', flexDirection: \'column\', justifyContent: \'center\' }}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
