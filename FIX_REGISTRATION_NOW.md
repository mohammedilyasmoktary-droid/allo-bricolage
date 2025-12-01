# 🚨 FIX REGISTRATION ERROR - Guide Rapide

## Le Problème
L'erreur "Failed to register user" apparaît car le frontend ne peut pas se connecter au backend.

## La Solution (5 minutes)

### Option 1 : Via Vercel Dashboard (Recommandé)

1. **Ouvrez** : https://vercel.com/dashboard
2. **Cliquez** sur votre projet `allo-bricolage`
3. **Cliquez** sur **Settings** (dans le menu de gauche)
4. **Cliquez** sur **Environment Variables**
5. **Cliquez** sur **Add New**
6. **Remplissez** :
   ```
   Key: VITE_API_URL
   Value: https://VOTRE-BACKEND-URL.onrender.com/api
   ```
   ⚠️ Remplacez `VOTRE-BACKEND-URL` par votre vraie URL Render
7. **Cochez** : Production, Preview, Development
8. **Cliquez** sur **Save**
9. **Allez** dans **Deployments**
10. **Cliquez** sur les **3 points (⋯)** → **Redeploy**

### Option 2 : Trouver votre URL Backend Render

1. **Ouvrez** : https://render.com/dashboard
2. **Cliquez** sur votre service backend
3. **Copiez** l'URL (exemple: `allo-bricolage-backend.onrender.com`)
4. **Ajoutez** `/api` à la fin
5. **Utilisez** cette URL complète dans Vercel

### Option 3 : Si vous ne connaissez pas votre URL Render

1. **Allez** sur : https://render.com/dashboard
2. **Regardez** la liste de vos services
3. **Cliquez** sur celui qui contient "backend" ou "api"
4. **L'URL** est affichée en haut de la page

## ✅ Vérification

Après avoir configuré et redéployé :

1. **Ouvrez** votre site Vercel
2. **Ouvrez** la console (F12)
3. **Regardez** les messages - vous devriez voir :
   ```
   🔗 API Base URL: https://votre-backend.onrender.com/api
   ```
4. **Essayez** de vous inscrire - ça devrait fonctionner !

## 🆘 Si vous ne trouvez pas votre URL Render

1. **Créez** un nouveau service sur Render si nécessaire
2. **Ou** utilisez Railway à la place (voir RAILWAY_DEPLOYMENT.md)

