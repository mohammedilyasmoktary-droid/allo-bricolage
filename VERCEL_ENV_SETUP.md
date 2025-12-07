# Configuration des Variables d'Environnement Vercel

## Problème Actuel
L'application frontend ne peut pas se connecter au backend. L'erreur indique que l'URL du backend n'est pas correctement configurée.

## Solution : Configurer VITE_API_URL sur Vercel

### Étape 1 : Obtenir l'URL du Backend
1. Allez sur [Render Dashboard](https://dashboard.render.com/)
2. Sélectionnez votre service backend
3. Copiez l'URL du service (ex: `https://allo-bricolage-backend.onrender.com`)
4. Ajoutez `/api` à la fin : `https://allo-bricolage-backend.onrender.com/api`

### Étape 2 : Configurer sur Vercel
1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `allo-bricolage`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez la variable suivante :
   - **Name**: `VITE_API_URL`
   - **Value**: `https://allo-bricolage-backend.onrender.com/api`
   - **Environment**: Sélectionnez **Production**, **Preview**, et **Development**
5. Cliquez sur **Save**
6. **Important** : Redéployez l'application après avoir ajouté la variable

### Étape 3 : Vérifier le Backend
Assurez-vous que le backend est bien démarré sur Render :
1. Vérifiez les logs sur Render
2. Testez l'URL directement : `https://allo-bricolage-backend.onrender.com/api/health` (ou une route similaire)
3. Vérifiez que CORS est configuré pour accepter les requêtes depuis `https://allo-bricolage.vercel.app`

### Étape 4 : Redéployer
Après avoir configuré la variable d'environnement :
1. Sur Vercel, allez dans **Deployments**
2. Cliquez sur les trois points (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Attendez que le déploiement se termine

## Variables d'Environnement Requises

### Frontend (Vercel)
- `VITE_API_URL`: URL complète du backend avec `/api` (ex: `https://allo-bricolage-backend.onrender.com/api`)

### Backend (Render)
- `DATABASE_URL`: URL de connexion MySQL
- `JWT_ACCESS_SECRET`: Secret pour les tokens JWT
- `JWT_REFRESH_SECRET`: Secret pour les refresh tokens
- `FRONTEND_URL`: URL du frontend (ex: `https://allo-bricolage.vercel.app`)
- `BACKEND_URL`: URL du backend (ex: `https://allo-bricolage-backend.onrender.com`)

## Test de Connexion
Après configuration, testez la connexion :
1. Ouvrez la console du navigateur (F12)
2. Regardez les logs qui affichent l'URL API utilisée
3. Essayez de vous connecter
4. Si l'erreur persiste, vérifiez :
   - Que le backend est démarré sur Render
   - Que l'URL est correcte (avec `/api` à la fin)
   - Que CORS est configuré correctement
