# 🐛 Debug Guide: Employee Edit Not Working

## Issue Description
Edit Employee Profile modal opens but:
- Department dropdown empty or not saving
- Designation dropdown empty or not saving  
- Reporting Manager dropdown empty or not saving

---

## 🔍 Debugging Steps

### **Step 1: Open Browser Console**

1. Open your app: http://localhost:5173 (or production URL)
2. Press **F12** (Windows) or **Cmd+Option+I** (Mac)
3. Go to **Console** tab
4. Clear console (trash icon)

### **Step 2: Try to Edit Employee**

1. Go to **Employees** page
2. Click any employee card
3. Click **"Edit Employee Details"** button
4. **Check console for these logs:**

```javascript
[EmployeeModal] Props received: { 
  employeeName: "John Doe", 
  departmentsCount: 5, 
  designationsCount: 8 
}
[EmployeeModal] Managers loaded: 3
```

---

## 📋 Common Issues & Fixes

### **Issue 1: `departmentsCount: 0` in console**

**Problem:** Departments not fetched by parent component

**Fix:**
1. Check Network tab → Look for `/api/departments` request
2. If **404 or 500 error**, backend issue
3. If **no request**, parent component not fetching

**Solution:**
```javascript
// In client/src/pages/Employees.jsx
// Make sure fetchEmployees is called on mount
useEffect(() => {
  fetchEmployees();
}, []);
```

---

### **Issue 2: `designationsCount: 0` in console**

**Problem:** Designations not fetched

**Fix:**
Same as Issue 1, check `/api/designations` endpoint

---

### **Issue 3: Dropdowns show but save doesn't work**

**Problem:** Form data not sending to backend

**Check console for:**
```
PUT /api/employees/<id> 400 Bad Request
```

**Fix:**
1. Check Network tab → Click the failed request
2. Look at **Response** tab for error message
3. Common errors:
   - `"Department not found"` - Invalid department ID
   - `"Email already exists"` - Duplicate email
   - `"Validation failed"` - Missing required fields

---

### **Issue 4: No managers in Reporting Manager dropdown**

**Check console for:**
```
[EmployeeModal] Managers loaded: 0
```

**Problem:** No TEAM_LEAD/HR/ADMIN/CEO users exist

**Fix:**
1. Go to Employees page
2. Edit an employee
3. Change their **Role** to "Team Lead" or "HR"
4. Save
5. Now they'll appear in Reporting Manager dropdown

---

## 🧪 Quick Test

**Run this in browser console:**

```javascript
// Test 1: Check if departments API works
fetch('http://localhost:5000/api/departments', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('elms_access_token')}`
  }
})
.then(r => r.json())
.then(d => console.log('Departments:', d))
.catch(e => console.error('Department API failed:', e));

// Test 2: Check if designations API works
fetch('http://localhost:5000/api/designations', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('elms_access_token')}`
  }
})
.then(r => r.json())
.then(d => console.log('Designations:', d))
.catch(e => console.error('Designation API failed:', e));

// Test 3: Check if employees API works
fetch('http://localhost:5000/api/employees?limit=10', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('elms_access_token')}`
  }
})
.then(r => r.json())
.then(d => console.log('Employees:', d))
.catch(e => console.error('Employee API failed:', e));
```

---

## 🔧 Manual Fix Steps

### **If Departments are Empty:**

1. Go to **Departments** page
2. Click **"Create Department"**
3. Add at least 1-2 departments:
   - Name: Engineering, Code: ENG
   - Name: HR, Code: HR

### **If Designations are Empty:**

1. Go to **Designations** page
2. Click **"Create Designation"**
3. Add at least 1-2 designations:
   - Name: Software Engineer, Code: SE
   - Name: Team Lead, Code: TL

### **If No Managers Available:**

1. Go to **Employees** page
2. Select an employee
3. Click **"Edit Employee Details"**
4. Change **Role** to "Team Lead"
5. Save
6. Now edit another employee → Reporting Manager dropdown will show the Team Lead

---

## 📸 What to Check in Network Tab

1. Open DevTools → **Network** tab
2. Filter: **Fetch/XHR**
3. Try to edit employee
4. Look for these requests:

| Request | Expected Status | Response Should Have |
|---------|----------------|---------------------|
| `GET /api/employees?limit=200` | 200 OK | List of employees |
| `GET /api/departments` | 200 OK | List of departments |
| `GET /api/designations` | 200 OK | List of designations |
| `PUT /api/employees/<id>` | 200 OK | Updated employee data |

---

## ✅ Expected Behavior After Fix

1. Open Edit Employee modal
2. Department dropdown shows: **Engineering, HR, Sales**, etc.
3. Designation dropdown shows: **Software Engineer, Team Lead**, etc.
4. Reporting Manager dropdown shows: **Team Leads, HR, Admins**
5. Select values → Click **"Save Changes"**
6. See success message: `✅ Employee details updated successfully!`
7. Modal closes
8. Employee card shows updated department/designation

---

## 🚨 If Still Not Working

**Share these details:**

1. **Console logs** (copy all red errors)
2. **Network tab screenshot** of failed request
3. **Backend logs** from terminal/Render

**Example what to share:**
```
Console Error:
PUT http://localhost:5000/api/employees/123abc 400 (Bad Request)
{
  "status": "error",
  "message": "Department validation failed"
}

Backend Log:
[Server] PUT /api/employees/123abc
Error: Cast to ObjectId failed for value "" at path "department"
```

---

## 💡 Common Mistakes

1. ❌ **Forgetting to save after selecting dropdown**
   - ✅ Select dept → designation → role → Click "Save Changes"

2. ❌ **Editing while backend is down**
   - ✅ Check if `http://localhost:5000/api/health` responds

3. ❌ **Old browser cache**
   - ✅ Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. ❌ **Authentication expired**
   - ✅ Logout → Login again

---

## 📞 Debugging Checklist

Before asking for help, verify:

- [ ] Browser console shows no errors
- [ ] Network tab shows all API requests return 200 OK
- [ ] Departments page has at least 1 department
- [ ] Designations page has at least 1 designation
- [ ] At least 1 employee has TEAM_LEAD role
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked both frontend and backend are running
- [ ] Tried with different browser (Chrome/Edge/Firefox)

---

**Debug Logs Added:** ✅
- Modal props logging
- Managers fetch logging
- Warnings for empty dropdowns

**Next:** Open browser console and share the logs! 🔍
