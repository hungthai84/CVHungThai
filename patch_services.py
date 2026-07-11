import re

with open('components/ServicesPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="info-card is-services"', 'className="info-card is-services" style={{ background: "transparent", boxShadow: "none", border: "none" }}')
content = content.replace('className="services-grid no-scrollbar"', 'className="services-grid no-scrollbar" style={{ background: "transparent" }}')

with open('components/ServicesPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
