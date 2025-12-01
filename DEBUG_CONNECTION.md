# 🔍 Diagnostic - Erreur de Connexion

## Le Problème
L'erreur "Impossible de se connecter au serveur" apparaît toujours.

## Diagnostic Étape par Étape

### 1. Vérifier la Console du Navigateur
1. Ouvrez la page d'inscription
2. Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
3. Allez dans l'onglet **Console**
4. Cherchez le message : `🔗 API Base URL: ...`
5. **Copiez** l'URL que vous voyez

**Si vous voyez :**
- `http://localhost:5001/api` → La variable n'est pas configurée
- `https://allo-bricolage-backend.onrender.com/api` → La variable est correcte, mais il y a un autre problème

### 2. Vérifier l'Onglet Network
1. Dans la console, allez dans l'onglet **Network**
2. Essayez de vous inscrire
3. Cherchez la requête vers `/api/auth/register`
4. **Cliquez** dessus
5. Regardez :
   - **Request URL** : Quelle URL est utilisée ?
   - **Status** : Quel code de statut (200, 404, 500, CORS error) ?

### 3. Vérifier Vercel
1. Allez sur : https://vercel.com/dashboard
2. Ouvrez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que `VITE_API_URL` existe
5. **Cliquez** dessus pour voir la valeur
6. Elle doit être : `https://allo-bricolage-backend.onrender.com/api`

### 4. Vérifier le Redéploiement
1. Dans Vercel, allez dans **Deployments**
2. Vérifiez que le dernier déploiement est **récent** (après avoir modifié la variable)
3. Si ce n'est pas le cas, **redéployez**

### 5. Vérifier Render
1. Allez sur : https://render.com/dashboard
2. Ouvrez **allo-bricolage-backend**
3. Vérifiez que le service est **Running** (pas "Stopped")
4. Testez : https://allo-bricolage-backend.onrender.com/health
5. Vous devriez voir : `{"status":"ok","message":"Allo Bricolage API is running"}`

### 6. Vérifier CORS
Dans Render, vérifiez que `FRONTEND_URL` est configuré :
- **Key**: `FRONTEND_URL`
- **Value**: `https://allo-bricolage.vercel.app` (ou votre URL Vercel)

## Solutions Possibles

### Solution 1 : Redéployer Vercel
1. Vercel → **Deployments**
2. **3 points (⋯)** → **Redeploy**
3. Attendez 2-3 minutes

### Solution 2 : Vérifier l'URL Preview
Si vous êtes sur une URL Preview (comme `allo-bricolage-nx1b96d2m-...`), vérifiez que la variable est configurée pour **Preview** aussi.

### Solution 3 : Vider le Cache
1. Ouvrez la console (F12)
2. Clic droit sur le bouton de rafraîchissement
3. **Vider le cache et actualiser**

### Solution 4 : Tester l'URL de Production
Essayez l'URL de production Vercel (pas preview) :
- https://allo-bricolage.vercel.app

## 🆘 Si Rien Ne Fonctionne

Partagez avec moi :
1. L'URL que vous voyez dans la console (`🔗 API Base URL`)
2. Le code de statut de la requête dans Network
3. Les erreurs dans la console

