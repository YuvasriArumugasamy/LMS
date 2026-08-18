# 🔐 Render Environment Variables Setup - CRITICAL

## ⚠️ MUST DO BEFORE DEPLOYMENT

The application will **NOT START** without these environment variables!

---

## 🚨 CRITICAL: JWT Secrets

Go to: **Render Dashboard → Your Service → Environment**

**Add/Update these variables:**

```env
JWT_SECRET=911891358e7c3ea805b1dbfdefe44563207d22266520f3faa079f2b832fcc66ee91bbce3db4aa212b074f03a4d1225b9d1a79a3733113d51cdb77c64df1dd56c
JWT_REFRESH_SECRET=7c64ff35bf65f27150c29331ddecb60feb5fc58497d4ddd55bf5bee9e90cbb1d59c1fcb2531f5fbe4777c4d60de95f730105973b38ad17206b14de395276a9f2
```

**IMPORTANT:** These are production secrets. **DO NOT share** these values publicly!

---

## 📝 Complete Environment Variables List

Make sure ALL of these are set in Render:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://kuttyy302_db_user:lmsapplication@cluster0.i15fd9q.mongodb.net/elms_enterprise?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=911891358e7c3ea805b1dbfdefe44563207d22266520f3faa079f2b832fcc66ee91bbce3db4aa212b074f03a4d1225b9d1a79a3733113d51cdb77c64df1dd56c
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=7c64ff35bf65f27150c29331ddecb60feb5fc58497d4ddd55bf5bee9e90cbb1d59c1fcb2531f5fbe4777c4d60de95f730105973b38ad17206b14de395276a9f2
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://lms-sand-two.vercel.app
ESCALATION_CHECK_INTERVAL_MS=300000
DEMO_ESCALATION_MINUTES=5
FIREBASE_VAPID_KEY=BGOoVAyqlja4GGzrS4onFGnB_A5eXhhFNNo8twd9_2nr-Hu8C-7OnOJ1IeG1LWO6lu6CqaixzkCQumUSVi7Xp2Q
FIREBASE_PROJECT_ID=lms---application
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@lms---application.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD6r59n7XXbc+LQ\np0G11UTcTgAoe2LMTTeyUc/rxNVclok7QyNQTac7oZWB/MLwrSbiEPnIeNC1wOvz\nN9sw5Sg3CqfFLRrsxvV8DFCgeexqQqfaVB78xBpOKwKQ7o3l1yLTg6U6hYBonqw7\noqXY6qjqJ+X4Ke+BsgZCFRB5nxDak3mQjFknUP113Wxu4vFqyhM/kpQPZlO4X5/w\n4RrqOIbLp+lILR/0pmwcFKBlObiHM2h7/VdbU3ALcb4T6SLc85mc/Xi+gfHFBPyq\nIy/HNLm0ubHZmXEnyMo/ir83RZ5PqJVghku+Ldu9/uBn4+Th6xuW0EnaPJFycduB\lA5V/cfdAgMBAAECggEACtNLhNtRhVhIBr7OR4n4kbM8Q63uWohexnB3ftouujNA\nT62Vcw84u0pomybSi+j3nqK2h/nFo4T7ph1hoFx+ToAt4LB9suoK6aAw2Xk3ucVR\nRnbu/qHWSU1crJcMoXdXSD8tWFgHBJ2OLlDBV4XB+m3zevJj/Bu3XverZjZ1rcaY\n2Qetu58EuDaub1ZAJHNeF7KTQeolzsKqwO0WPt+0TNSdCFXzBHBjV96t5nL2pQo1\niYLiDeYezWX+Qe7uQAw3xy5TPCTFA/O7JRelemo7x+ih2QveVpo7regCTQsHzJaX\nYh5S6GHDDzEdHU1Pa3EWKSOAeFQ/Ft2oY09FBciUiQKBgQD+pmnnLb4Zk6ipDU1r\nGE1DVFhtUNPaOK1spLZC+8fYBBqLyq/qJDLjXyMWgl5MnXFyhaLqxO2kT52u9KD3\nNqiCWCOkMLV9YglDvt7pg2wxei0SOyBokCHbLMz7HcwgJEbRopnWwWLLtuKZ5/dK\n0M2D4lgrzhmu3yvC1+kmlNUEmQKBgQD8A9RTwBS1vqpjgrCFNgPxa21DcVaYQyzh\nifLZrwy0bg2ZlpPQp/U3SeNZpWOYelIYuRVkadEcruds4TJPAUnB4SK7HaO0X0wo\n4+X1nfjdEHEpaeXbGlNNxM2nDuYboPaAKMeOSgkRhkT18raKmyrChft9BQX75ooa\nt0/zgGXj5QKBgF+U6RVL1xnUka76fj+ffIi0JQjLGOnE8ltgK8VSqj1LtQcZihQR\niERN1mbBglGxmv6IaJFEX4qYE7Cyw6RnELL0EFS1r7mjTaTvBM6TdM3RdQ9twAlf\naEXTOBFdqtu5ohdXt/Si28lpGP750Zl0bF9/Wub+UieQPuXAkxPXM2mpAoGASccN\nN995sKM62pr99mGT0e9zM1VQ1o6D6xspf1Th0UiOrrIIYANrpF37MtlaSN82fYph\nmt3nnBAQLC3ZPovP/fRc6I6KyFlFwIrHXZp7qqwPlOItqnEQhinhUtDnyJrczzQh\nB6Tg9sJqGd6OVhGK+RukPjtkPxSExcF4pH6oVYkCgYEAkpC9tSdP70LNz8E3BRbb\nVouXgfScz+LwHZqIggYglKahSCyke0EZ1uKF9xBrhvh4C6hVm83hjHDwPByonGwn\njgAwd7r7Lp+3vCG5YdtJ0xsLGOfNihye1aMMhOTSnFB1zkL63LaqysDXGw3Ftky1\nkqcVh2a4nSJvWZ7IyOodmRo=\n-----END PRIVATE KEY-----\n"
```

---

## ✅ Verification Steps

1. **Save** all environment variables in Render
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 2-3 minutes for deployment
4. Check **Logs** tab for:

**Success:**
```
✅ [MongoDB] Connected successfully
⚡ [Performance] Optimized for 50+ concurrent users
🚨 [Emergency Escalation] Active - checking every 300s
```

**Failure (JWT secrets missing):**
```
❌ CRITICAL ERROR: JWT secrets are not configured!
JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables.
```

If you see the failure message:
1. Double-check JWT_SECRET and JWT_REFRESH_SECRET are set
2. Click "Save Changes" again
3. Redeploy

---

## 🔄 If Secrets Need Regeneration

**Generate new secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Update in Render:**
1. Copy new secret
2. Paste into Render environment variable
3. Save
4. Redeploy

**⚠️ WARNING:** Changing JWT secrets will **log out all users**. They will need to login again.

---

## 📞 Troubleshooting

### Issue: "Server won't start"
**Check:** Render logs show JWT error
**Fix:** Set JWT_SECRET and JWT_REFRESH_SECRET

### Issue: "Users can't login"
**Check:** JWT secrets are correct (no typos, no extra spaces)
**Fix:** Copy-paste carefully, click Save, redeploy

### Issue: "Authentication fails after update"
**Cause:** JWT secrets changed
**Expected:** Users need to login again (one-time)

---

**Status:** ✅ Secrets generated and ready
**Next:** Add to Render → Deploy → Test
