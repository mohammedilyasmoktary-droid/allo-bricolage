# ✅ Vercel - Variable Existe Déjà

## Le Problème
La variable `VITE_API_URL` existe déjà, mais vous essayez de l'ajouter à nouveau.

## La Solution

### Étape 1 : Modifier la variable existante
1. **Ne cliquez pas** sur "Add Another"
2. **Cliquez** sur la variable existante `VITE_API_URL` dans la liste en bas
3. **Vérifiez** que la valeur est : `https://allo-bricolage-backend.onrender.com/api`
4. **Vérifiez** que "All Environments" est sélectionné (Production, Preview, Development)
5. Si la valeur est différente, **modifiez-la**
6. **Cliquez** sur **Save**

### Étape 2 : Redéployer
1. Allez dans **Deployments** (menu de gauche)
2. Cliquez sur les **3 points (⋯)** du dernier déploiement
3. Cliquez sur **Redeploy**
4. Attendez 2-3 minutes

### Étape 3 : Tester
1. Ouvrez : https://allo-bricolage.vercel.app
2. Ouvrez la console (F12)
3. Vous devriez voir : `🔗 API Base URL: https://allo-bricolage-backend.onrender.com/api`
4. Essayez de vous inscrire

## Si la variable a une mauvaise valeur
1. Cliquez sur `VITE_API_URL` dans la liste
2. Modifiez la valeur en : `https://allo-bricolage-backend.onrender.com/api`
3. Assurez-vous que tous les environnements sont cochés
4. Cliquez sur **Save**
5. Redéployez

