# Troubleshooting: Missions Not Showing

## Problème
Les missions ne s'affichent pas sur la page "Mes Missions" pour les techniciens.

## Étapes de diagnostic

### 1. Vérifier la console du navigateur (F12)

Ouvrez la console du navigateur et vérifiez :

1. **URL de l'API** : Cherchez le log `🔗 API Base URL:` 
   - Devrait être : `https://allo-bricolage-backend.onrender.com/api` (ou votre URL Render)
   - Si c'est `http://localhost:5001/api`, la variable d'environnement `VITE_API_URL` n'est pas configurée sur Vercel

2. **Erreurs réseau** : Vérifiez l'onglet "Network" dans la console
   - Cherchez la requête vers `/bookings/my-bookings`
   - Vérifiez le statut de la réponse (200, 401, 403, 500, etc.)
   - Vérifiez le message d'erreur

3. **Logs de débogage** : Cherchez les logs suivants :
   - `🔄 Loading technician jobs...`
   - `Current user:` (doit afficher l'ID et le rôle)
   - `✅ Technician jobs loaded:` (doit afficher le nombre de missions)
   - `❌ Failed to load jobs:` (si erreur)

### 2. Vérifier la configuration Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `allo-bricolage`
3. Allez dans "Settings" > "Environment Variables"
4. Vérifiez que `VITE_API_URL` est définie avec la valeur :
   ```
   https://allo-bricolage-backend.onrender.com/api
   ```
   (Remplacez par votre URL Render si différente)

5. Si la variable n'existe pas ou est incorrecte :
   - Ajoutez-la ou modifiez-la
   - Redéployez l'application (Vercel redéploie automatiquement)

### 3. Vérifier le backend Render

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Vérifiez que votre service backend est "Live" (pas "Paused" ou "Failed")
3. Vérifiez les logs du backend :
   - Cliquez sur votre service
   - Allez dans l'onglet "Logs"
   - Cherchez les logs lors du chargement des missions :
     - `Getting bookings for user: ...`
     - `🔍 Technician profile lookup: ...`
     - `✅ Found bookings: ...`

4. Testez l'endpoint directement :
   - Ouvrez : `https://votre-backend.onrender.com/api/health`
   - Devrait retourner : `{"status":"ok",...}`

### 4. Vérifier l'authentification

1. Vérifiez que vous êtes bien connecté :
   - Le nom d'utilisateur devrait apparaître dans la sidebar
   - Le rôle devrait être "Technicien"

2. Vérifiez le token d'authentification :
   - Dans la console, tapez : `localStorage.getItem('accessToken')`
   - Devrait retourner un token (pas `null`)

3. Si le token est expiré :
   - Déconnectez-vous et reconnectez-vous
   - Le token devrait être automatiquement rafraîchi

### 5. Vérifier les données dans la base de données

Le problème pourrait venir du fait qu'il n'y a simplement pas de missions assignées au technicien.

Pour vérifier :
1. Connectez-vous en tant que client
2. Créez une nouvelle réservation avec ce technicien
3. Retournez sur la page "Mes Missions" du technicien
4. La mission devrait apparaître

## Solutions possibles

### Solution 1 : Variable d'environnement manquante

**Symptôme** : L'URL de l'API est `http://localhost:5001/api` en production

**Solution** :
1. Allez sur Vercel Dashboard > Settings > Environment Variables
2. Ajoutez `VITE_API_URL` avec la valeur de votre backend Render
3. Redéployez l'application

### Solution 2 : Backend non accessible

**Symptôme** : Erreur "Network Error" ou "ECONNREFUSED" dans la console

**Solution** :
1. Vérifiez que le backend Render est "Live"
2. Vérifiez l'URL du backend dans Render
3. Testez l'endpoint `/api/health` directement dans le navigateur
4. Vérifiez les logs Render pour des erreurs

### Solution 3 : Problème d'authentification

**Symptôme** : Erreur 401 (Unauthorized) dans la console

**Solution** :
1. Déconnectez-vous et reconnectez-vous
2. Vérifiez que le token est présent : `localStorage.getItem('accessToken')`
3. Vérifiez que le backend accepte les tokens JWT

### Solution 4 : Aucune mission assignée

**Symptôme** : Pas d'erreur, mais la liste est vide

**Solution** :
1. C'est normal si aucune mission n'a été créée
2. Créez une mission en tant que client pour tester
3. Vérifiez que le technicien a bien un profil créé

### Solution 5 : Problème avec la requête Prisma

**Symptôme** : Erreur 500 (Internal Server Error) dans la console

**Solution** :
1. Vérifiez les logs Render pour voir l'erreur exacte
2. Vérifiez que la base de données est accessible
3. Vérifiez que les migrations Prisma sont appliquées

## Contact pour support

Si le problème persiste après avoir suivi ces étapes :

1. Copiez les logs de la console du navigateur (F12)
2. Copiez les logs du backend Render
3. Notez les étapes que vous avez suivies
4. Contactez le support avec ces informations

