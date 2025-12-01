# ✅ Configuration Exacte pour Vercel

## Votre URL Backend
```
https://allo-bricolage-backend.onrender.com
```

## Configuration Vercel - Étapes Exactes

### 1. Ouvrez Vercel Dashboard
👉 https://vercel.com/dashboard

### 2. Sélectionnez votre projet
- Cliquez sur **allo-bricolage**

### 3. Allez dans Settings
- Menu de gauche → **Settings**

### 4. Cliquez sur Environment Variables
- Dans le menu Settings → **Environment Variables**

### 5. Ajoutez la variable
Cliquez sur **Add New** et remplissez :

**Key:**
```
VITE_API_URL
```

**Value:**
```
https://allo-bricolage-backend.onrender.com/api
```

⚠️ **IMPORTANT**: N'oubliez pas `/api` à la fin !

**Environments:**
- ✅ Production
- ✅ Preview  
- ✅ Development

### 6. Cliquez sur Save

### 7. Redéployez
1. Allez dans **Deployments**
2. Cliquez sur les **3 points (⋯)** du dernier déploiement
3. Cliquez sur **Redeploy**
4. Attendez 2-3 minutes

## ✅ Vérification Backend

Testez votre backend :
👉 https://allo-bricolage-backend.onrender.com/health

Vous devriez voir :
```json
{"status":"ok","message":"Allo Bricolage API is running"}
```

## 🔧 Vérification CORS sur Render

Dans Render, vérifiez que `FRONTEND_URL` est configuré :

1. Allez sur : https://render.com/dashboard
2. Ouvrez votre service **allo-bricolage-backend**
3. Allez dans **Environment**
4. Vérifiez/modifiez :
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://allo-bricolage.vercel.app`
5. Si vous modifiez, Render redéploiera automatiquement

## ✅ Test Final

1. Ouvrez : https://allo-bricolage.vercel.app
2. Ouvrez la console (F12)
3. Vous devriez voir : `🔗 API Base URL: https://allo-bricolage-backend.onrender.com/api`
4. Essayez de vous inscrire - ça devrait fonctionner ! 🎉

