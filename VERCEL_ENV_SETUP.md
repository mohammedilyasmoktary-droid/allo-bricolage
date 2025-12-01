# 🔧 Configuration Vercel - URL Backend

## Problème
Le frontend Vercel essaie de se connecter à `localhost:5001/api` qui n'existe pas en production.

## Solution : Configurer VITE_API_URL dans Vercel

### Étape 1 : Trouver votre URL Backend Render

1. Allez sur **https://render.com**
2. Connectez-vous
3. Cliquez sur votre service backend
4. Copiez l'URL (exemple: `https://allo-bricolage-backend.onrender.com`)

### Étape 2 : Configurer dans Vercel

1. Allez sur **https://vercel.com**
2. Connectez-vous
3. Cliquez sur votre projet **allo-bricolage**
4. Allez dans **Settings** → **Environment Variables**
5. Cliquez sur **Add New**
6. Remplissez :
   - **Key**: `VITE_API_URL`
   - **Value**: `https://votre-backend-url.onrender.com/api`
     - ⚠️ Remplacez `votre-backend-url.onrender.com` par votre vraie URL Render
     - ⚠️ N'oubliez pas `/api` à la fin
   - Cochez toutes les cases : **Production**, **Preview**, **Development**
7. Cliquez sur **Save**

### Étape 3 : Redéployer

1. Allez dans **Deployments**
2. Cliquez sur les **3 points (⋯)** du dernier déploiement
3. Cliquez sur **Redeploy**
4. Attendez 2-3 minutes

### Étape 4 : Vérifier le Backend CORS

Dans Render, vérifiez que `FRONTEND_URL` est configuré :

1. Allez sur **https://render.com**
2. Ouvrez votre service backend
3. Allez dans **Environment**
4. Vérifiez/modifiez :
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://allo-bricolage.vercel.app`
5. Si vous modifiez, Render redéploiera automatiquement

## ✅ Test

1. Ouvrez votre site Vercel
2. Ouvrez la console du navigateur (F12)
3. Essayez de vous inscrire
4. Vous devriez voir dans la console :
   - `🔗 API Base URL: https://votre-backend-url.onrender.com/api`
5. L'inscription devrait fonctionner !

## 🆘 Si ça ne marche toujours pas

1. Vérifiez que le backend Render est en ligne :
   - Ouvrez : `https://votre-backend-url.onrender.com/health`
   - Vous devriez voir : `{"status":"ok","message":"Allo Bricolage API is running"}`

2. Vérifiez les logs Render pour voir les erreurs

3. Vérifiez les logs Vercel pour voir les erreurs de build

