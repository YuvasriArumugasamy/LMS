@echo off
echo Initializing Git Repository and Pushing to GitHub...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/YuvasriArumugasamy/LMS.git
git branch -M main
git add .
git commit -m "Complete LMS application with Daily Work Reports tracking, employee history, and security updates"
git push -u origin main
echo Completed Git Push!
pause
