import sys

with open('components/WorkExperiencePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Swap in activeJob
# Block 1 (projects):
proj_start = content.find('                    <div>\n                      {activeJob.projects && activeJob.projects.length > 0 && (')
proj_end = content.find('                      )}\n                    </div>', proj_start) + len('                      )}\n                    </div>')

# Block 2 (achievements):
ach_start = content.find('                    <div>\n                      {activeJob.achievements.length > 0 && (', proj_end)
ach_end = content.find('                      )}\n                    </div>', ach_start) + len('                      )}\n                    </div>')

if proj_start != -1 and ach_start != -1:
    b1 = content[proj_start:proj_end]
    # between blocks
    between = content[proj_end:ach_start]
    b2 = content[ach_start:ach_end]
    
    content = content[:proj_start] + b2 + between + b1 + content[ach_end:]

# Swap in popup
popup_proj_start = content.find('                {selectedJobForPopup.projects &&\n                  selectedJobForPopup.projects.length > 0 && (')
popup_proj_end = content.find('                    </div>\n                  )}', popup_proj_start) + len('                    </div>\n                  )}')

popup_ach_start = content.find('                {selectedJobForPopup.achievements &&\n                  selectedJobForPopup.achievements.length > 0 && (', popup_proj_end)
popup_ach_end = content.find('                    </div>\n                  )}', popup_ach_start) + len('                    </div>\n                  )}')

if popup_proj_start != -1 and popup_ach_start != -1:
    pb1 = content[popup_proj_start:popup_proj_end]
    pbetween = content[popup_proj_end:popup_ach_start]
    pb2 = content[popup_ach_start:popup_ach_end]
    
    content = content[:popup_proj_start] + pb2 + pbetween + pb1 + content[popup_ach_end:]

with open('components/WorkExperiencePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Swap completed")
