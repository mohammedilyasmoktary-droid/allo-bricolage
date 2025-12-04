# 🔧 Configurer BACKEND_URL dans Render

## Problème
Les images de profil utilisent `http://localhost:5001` au lieu de l'URL Render.

## Solution

### Étape 1 : Configurer BACKEND_URL dans Render

1. Allez sur : https://render.com/dashboard
2. Ouvrez votre service **allo-bricolage-backend**
3. Allez dans **Environment**
4. Cliquez sur **Add Environment Variable**
5. Ajoutez :
   - **Key**: `BACKEND_URL`
   - **Value**: `https://allo-bricolage-backend.onrender.com`
6. Cliquez sur **Save Changes**
7. Render redéploiera automatiquement

### Étape 2 : Vérifier

Après le redéploiement (2-3 minutes), testez :
- Les nouvelles images uploadées utiliseront la bonne URL
- Les images existantes seront corrigées par le frontend

## ✅ Note

Le frontend corrige automatiquement les URLs `localhost` existantes, mais pour les nouvelles images, il faut que `BACKEND_URL` soit configuré dans Render.


