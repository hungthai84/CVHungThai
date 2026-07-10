import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const isGeminiAi = wallpaper === 'gemini-ai';",
    "const isGeminiAi = wallpaper === 'gemini-ai';\n    const isGlassmorphismEffect = wallpaper === 'glassmorphism-effect';"
)

content = content.replace(
    "${isGeminiAi ? 'wallpaper-gemini-ai' : ''}",
    "${isGeminiAi ? 'wallpaper-gemini-ai' : ''} ${isGlassmorphismEffect ? 'wallpaper-glassmorphism' : ''}"
)

glass_html = """                ) : isGlassmorphismEffect ? (
                    <div className="glassmorphism-background">
                        <div className="glass-blob glass-blob-1"></div>
                        <div className="glass-blob glass-blob-2"></div>
                        <div className="glass-blob glass-blob-3"></div>
                        <div className="glass-blob glass-blob-4"></div>
                    </div>"""

content = content.replace(
    ") : isGeminiAi ? (",
    glass_html + "\n                ) : isGeminiAi ? ("
)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated App.tsx")
