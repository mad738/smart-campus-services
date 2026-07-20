import os, glob

for file in glob.glob('*.html'):
    if file in ['index.html', 'profile.html', 'home.html', 'food.html']: continue
    with open(file, 'r', encoding='utf-8') as f: content = f.read()
    
    if '<div class="user-profile">' in content:
        content = content.replace(
            '<div class="user-profile">\n                <img src="https://ui-avatars.com/api/?name=Alex+Student&background=a476f5&color=fff" alt="User Profile">\n            </div>',
            '<div class="user-profile" style="position: relative; cursor: pointer;">\n                <img src="https://ui-avatars.com/api/?name=Alex+Student&background=a476f5&color=fff" alt="User Profile" id="profile-img">\n            </div>'
        )
    
    if '<script type="module" src="home.js"></script>' not in content and '</body>' in content:
        content = content.replace('</body>', '    <script type="module" src="home.js"></script>\n</body>')
    
    with open(file, 'w', encoding='utf-8') as f: f.write(content)
