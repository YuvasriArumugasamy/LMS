@echo off
echo Initializing Git Repository and Pushing to GitHub...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/YuvasriArumugasamy/LMS.git
git branch -M main
git rm -r --cached .vscode 2>nul
git rm -r --cached node_modules 2>nul
git rm -r --cached client/node_modules 2>nul
git rm -r --cached server/node_modules 2>nul
git rm -r --cached client/dist 2>nul
git add .
git commit -m "feat(ui): add smooth scroll to top behavior when clicking pagination controls"
git push -u origin main
echo Completed Git Push!
pause
