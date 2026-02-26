@echo off
cd /d d:\Project\CariSkill\amls-root
git add -A
git commit -m "fix: unify AuthProvider, add api/chat to ai-worker, fix gemini model"
git push origin csmerge
