@echo off
cd /d d:\Project\CariSkill\amls-root
echo Current branch:
git branch --show-current
echo.
echo Git status:
git status --short
echo.
echo Switching to csmerge...
git checkout csmerge
echo.
echo Staging all changes...
git add -A
echo.
echo Committing...
git commit -m "fix: unify AuthProvider, add /api/chat to ai-worker, fix gemini model name"
echo.
echo Pushing with upstream set...
git push --set-upstream origin csmerge
echo.
echo Done!
