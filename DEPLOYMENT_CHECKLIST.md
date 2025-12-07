# Checklist de Déploiement - Allo Bricolage

## ✅ Configuration Backend (Render)

### Variables d'Environnement Requises
1. `DATABASE_URL` - URL de connexion MySQL (Hostinger)
2. `JWT_ACCESS_SECRET` - Secret pour les tokens JWT
3. `JWT_REFRESH_SECRET` - Secret pour les refresh tokens
4. `FRONTEND_URL` - `https://allo-bricolage.vercel.app`
5. `BACKEND_URL` - `https://allo-bricolage-backend.onrender.com`
6. `NODE_ENV` - `production`

### Vérifications
- [ ] Le service est démarré sur Render
- [ ] Les logs ne montrent pas d'erreurs
- [ ] L'endpoint `/api/health` répond : `https://allo-bricolage-backend.onrender.com/api/health`
- [ ] CORS est configuré pour accepter `https://allo-bricolage.vercel.app`

## ✅ Configuration Frontend (Vercel)

### Variables d'Environnement Requises
1. `VITE_API_URL` - `https://allo-bricolage-backend.onrender.com/api` ⚠️ **CRITIQUE**

### Étapes de Configuration
1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez le projet `allo-bricolage`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez/modifiez :
   - **Name**: `VITE_API_URL`
   - **Value**: `https://allo-bricolage-backend.onrender.com/api`
   - **Environment**: Cochez **Production**, **Preview**, et **Development**
5. Cliquez sur **Save**
6. **Redéployez** l'application (Deployments → ⋯ → Redeploy)

### Vérifications
- [ ] La variable `VITE_API_URL` est configurée
- [ ] La valeur est correcte (avec `/api` à la fin)
- [ ] L'application a été redéployée après la configuration
- [ ] La console du navigateur affiche l'URL correcte : `🔗 API Base URL: https://allo-bricolage-backend.onrender.com/api`

## 🔍 Test de Connexion

### Test 1 : Health Check
Ouvrez dans votre navigateur :
```
https://allo-bricolage-backend.onrender.com/api/health
```

Vous devriez voir :
```json
{
  "status": "ok",
  "message": "Allo Bricolage API is running",
  "timestamp": "...",
  "environment": "production"
}
```

### Test 2 : Connexion Frontend
1. Ouvrez `https://allo-bricolage.vercel.app`
2. Ouvrez la console du navigateur (F12)
3. Regardez les logs :
   - `🔗 API Base URL: https://allo-bricolage-backend.onrender.com/api`
   - `🔗 VITE_API_URL env: https://allo-bricolage-backend.onrender.com/api`
4. Essayez de vous connecter
5. Si erreur, vérifiez les logs de la console

## 🐛 Dépannage

### Erreur : "Impossible de se connecter au serveur backend"
**Causes possibles :**
1. `VITE_API_URL` n'est pas configurée sur Vercel
2. La variable est configurée mais l'app n'a pas été redéployée
3. L'URL est incorrecte (manque `/api` à la fin)
4. Le backend n'est pas démarré sur Render

**Solutions :**
1. Vérifiez que `VITE_API_URL` est bien configurée sur Vercel
2. Redéployez l'application sur Vercel
3. Vérifiez que l'URL se termine par `/api`
4. Vérifiez les logs sur Render pour voir si le backend est démarré

### Erreur CORS
**Cause :** Le backend n'accepte pas les requêtes depuis le frontend

**Solution :** Vérifiez que `FRONTEND_URL` est configuré sur Render avec `https://allo-bricolage.vercel.app`

### Backend ne démarre pas
**Vérifications :**
1. Les variables d'environnement sont toutes configurées
2. `DATABASE_URL` est correcte
3. Les secrets JWT sont configurés
4. Consultez les logs sur Render pour voir l'erreur exacte

## 📝 Notes Importantes

- ⚠️ **Après avoir modifié les variables d'environnement, redéployez toujours l'application**
- ⚠️ **L'URL du backend doit se terminer par `/api`**
- ⚠️ **Vérifiez toujours les logs dans la console du navigateur pour déboguer**

