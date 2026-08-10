@echo off
echo Initializing Git Repository and Pushing to GitHub...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/YuvasriArumugasamy/LMS.git
git branch -M main
git rm -r --cached .vscode 2>nul
git add .
git commit -m "Clean up repository, add .gitignore and README documentation"
git push -u origin main -f
echo Completed Git Push!
pause
