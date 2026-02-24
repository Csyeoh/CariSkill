import os
import shutil

diff = """M	app/analyse/page.tsx
A	app/api/analyse/route.ts
A	app/api/extract-job/route.ts
A	app/api/extract-resume/route.ts
A	app/api/suggestions/route.ts
A	app/calendar/page.tsx
M	app/explore/page.tsx
M	app/help/page.tsx
M	app/profile/page.tsx
A	app/report/page.tsx
A	app/resume/page.tsx
M	app/settings/page.tsx
D	app/skill/[id]/overview/OverviewClient.tsx
A	app/target-job/[id]/ad/page.tsx
A	app/target-job/[id]/page.tsx
A	app/target-job/new/page.tsx
A	app/target-job/page.tsx
A	app/upload/page.tsx
A	components/Sidebar.tsx
A	lib/job-detail-data.ts
A	lib/original-ad-data.ts
A	lib/profile-data.ts
A	lib/resume-data.ts
A	lib/target-job-data.ts
D	public/logo.png"""

src_dir = r"D:\Project\CariSkill\temp_zip_repo"
dest_dir = r"D:\Project\CariSkill\amls-root\apps\web"

for line in diff.strip().split('\n'):
    status, path = line.split('\t')
    src_path = os.path.join(src_dir, path.replace('/', '\\'))
    dest_path = os.path.join(dest_dir, path.replace('/', '\\'))
    
    if status in ['A', 'M']:
        if not os.path.exists(src_path):
            print(f"Source file missing: {src_path}")
            continue
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(src_path, dest_path)
        print(f"Copied {path}")
    elif status == 'D':
        if os.path.exists(dest_path):
            os.remove(dest_path)
            print(f"Deleted {path}")
