# ⚡ Fix Rapide - Erreur de Connexion

## ✅ Le Backend Fonctionne !
Testé et confirmé : https://allo-bricolage-backend.onrender.com

## 🔧 Solution en 3 Étapes

### Étape 1 : Vérifier la Variable dans Vercel
1. Allez sur : https://vercel.com/dashboard
2. Projet **allo-bricolage** → **Settings** → **Environment Variables**
3. **Cliquez** sur `VITE_API_URL` dans la liste
4. Vérifiez que la valeur est : `https://allo-bricolage-backend.onrender.com/api`
5. Vérifiez que **tous les environnements** sont cochés :
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Si ce n'est pas le cas, **modifiez** et **Save**

### Étape 2 : Redéployer (IMPORTANT)
1. Allez dans **Deployments**
2. Cliquez sur les **3 points (⋯)** du dernier déploiement
3. Cliquez sur **Redeploy**
4. ⚠️ **ATTENDEZ 2-3 minutes** que le déploiement se termine

### Étape 3 : Tester
1. **Fermez** complètement votre navigateur
2. **Rouvrez** le navigateur
3. Allez sur : https://allo-bricolage.vercel.app/register
4. Ouvrez la console (F12)
5. Vous devriez voir : `🔗 API Base URL: https://allo-bricolage-backend.onrender.com/api`
6. Essayez de vous inscrire

## 🎯 Si Vous Êtes sur une URL Preview

Si votre URL ressemble à : `allo-bricolage-nx1b96d2m-...vercel.app`

C'est une **URL Preview**. Assurez-vous que la variable `VITE_API_URL` est configurée pour **Preview** aussi dans Vercel.

## 🔄 Alternative : Vider le Cache

1. Ouvrez la console (F12)
2. **Clic droit** sur le bouton de rafraîchissement
3. Cliquez sur **"Vider le cache et actualiser"** (ou "Empty Cache and Hard Reload")

## ✅ Vérification Finale

Dans la console du navigateur, vous devriez voir :
```
🔗 API Base URL: https://allo-bricolage-backend.onrender.com/api
🔗 VITE_API_URL env: https://allo-bricolage-backend.onrender.com/api
```

Si vous voyez `http://localhost:5001/api`, la variable n'est pas appliquée → **Redéployez**.

