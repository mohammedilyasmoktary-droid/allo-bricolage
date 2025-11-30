# Guide de Déploiement Backend sur Railway

## Étape 1 : Créer un compte Railway

1. Allez sur https://railway.app
2. Cliquez sur "Start a New Project"
3. Connectez-vous avec GitHub

## Étape 2 : Créer un nouveau projet

1. Cliquez sur "New Project"
2. Sélectionnez "Deploy from GitHub repo"
3. Choisissez votre repository : `mohammedilyasmoktary-droid/allo-bricolage`
4. Railway détectera automatiquement que c'est un projet Node.js

## Étape 3 : Configurer le projet

1. Railway va automatiquement détecter le dossier `backend/`
2. Si ce n'est pas le cas, allez dans **Settings → Source**
3. Changez le **Root Directory** en : `backend`

## Étape 4 : Configurer les variables d'environnement

Allez dans **Variables** et ajoutez :

### Variables essentielles :

1. **DATABASE_URL**
   - Value: `mysql://u905810677_adminbrico:ALObricolage11@srv1657.hstgr.io:3306/u905810677_alobricolage`

2. **JWT_ACCESS_SECRET**
   - Value: `dev-secret-key-change-in-production-12345`

3. **JWT_REFRESH_SECRET**
   - Value: `dev-refresh-secret-change-in-production-12345`

4. **JWT_ACCESS_EXPIRES_IN**
   - Value: `15m`

5. **JWT_REFRESH_EXPIRES_IN**
   - Value: `7d`

6. **FRONTEND_URL**
   - Value: `https://allo-bricolage.vercel.app` (votre URL Vercel)
   - ⚠️ **Important** : Mettez à jour avec votre vraie URL Vercel après le déploiement

7. **NODE_ENV**
   - Value: `production`

8. **UPLOAD_DIR**
   - Value: `./uploads`

9. **PORT**
   - ⚠️ **Ne pas ajouter** : Railway fournit automatiquement cette variable

## Étape 5 : Déployer

1. Railway va automatiquement commencer le déploiement
2. Attendez 2-3 minutes
3. Une fois terminé, Railway vous donnera une URL comme : `https://votre-projet.up.railway.app`

## Étape 6 : Tester l'API

1. Ouvrez : `https://votre-projet.up.railway.app/health`
2. Vous devriez voir : `{"status":"ok","message":"Allo Bricolage API is running"}`

## Étape 7 : Lier à Vercel

1. Allez sur votre projet Vercel
2. Allez dans **Settings → Environment Variables**
3. Ajoutez/modifiez :
   - **Key**: `VITE_API_URL`
   - **Value**: `https://votre-projet.up.railway.app/api`
   - Cochez : Production, Preview, Development
4. Cliquez sur **Save**
5. Redéployez votre frontend dans Vercel

## Étape 8 : Mettre à jour FRONTEND_URL dans Railway

1. Retournez sur Railway
2. Allez dans **Variables**
3. Mettez à jour **FRONTEND_URL** avec votre vraie URL Vercel
4. Railway redéploiera automatiquement

## ✅ Vérification finale

1. Testez le frontend : `https://votre-url.vercel.app`
2. Essayez de vous connecter
3. L'erreur "Impossible de se connecter au serveur" devrait disparaître

## 🔧 Dépannage

### Le build échoue
- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez les logs dans Railway

### L'API ne répond pas
- Vérifiez que le port est bien configuré (Railway le fait automatiquement)
- Vérifiez les logs dans Railway

### Erreurs CORS
- Vérifiez que `FRONTEND_URL` dans Railway correspond à votre URL Vercel exacte

