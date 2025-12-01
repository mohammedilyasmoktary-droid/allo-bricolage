# 📋 Guide Étape par Étape - Configurer BACKEND_URL dans Render

## 🎯 Objectif
Configurer `BACKEND_URL` dans Render pour que les images utilisent la bonne URL au lieu de `localhost:5001`.

---

## ✅ Étape 1 : Ouvrir Render Dashboard

👉 **Cliquez ici** : https://render.com/dashboard

Ou allez manuellement :
1. Ouvrez votre navigateur
2. Tapez : `render.com`
3. Cliquez sur **Sign In** (en haut à droite)
4. Connectez-vous avec votre compte

---

## ✅ Étape 2 : Trouver votre Service Backend

1. Dans le dashboard Render, vous verrez une liste de vos services
2. **Cherchez** le service nommé : `allo-bricolage-backend`
   - Il devrait avoir le statut "Live" (vert)
3. **Cliquez** sur le nom du service

---

## ✅ Étape 3 : Ouvrir les Variables d'Environnement

1. Dans la page du service, regardez le **menu de gauche**
2. **Cliquez** sur **"Environment"** (ou "Variables d'environnement")
   - C'est généralement la 4ème ou 5ème option dans le menu

---

## ✅ Étape 4 : Ajouter la Variable BACKEND_URL

1. Vous verrez une liste de variables d'environnement existantes
2. **Cliquez** sur le bouton **"Add Environment Variable"** (ou "Ajouter une variable")
3. Remplissez les champs :
   - **Key** (Clé) : `BACKEND_URL`
   - **Value** (Valeur) : `https://allo-bricolage-backend.onrender.com`
4. **Cliquez** sur **"Save Changes"** (ou "Enregistrer")

---

## ✅ Étape 5 : Vérifier le Redéploiement

1. Après avoir sauvegardé, Render va **automatiquement redéployer** votre service
2. Vous verrez un message comme : "Deploying..." ou "Déploiement en cours..."
3. **Attendez 2-3 minutes** que le déploiement se termine
4. Le statut devrait revenir à **"Live"** (vert)

---

## ✅ Étape 6 : Vérifier que ça fonctionne

1. Allez sur votre site Vercel : https://allo-bricolage.vercel.app
2. Ouvrez la **console du navigateur** (F12)
3. Allez dans l'onglet **Network**
4. Rechargez la page
5. Cherchez les requêtes vers `/uploads/`
6. Les URLs devraient maintenant utiliser : `https://allo-bricolage-backend.onrender.com/uploads/...`

---

## 🔗 Liens Rapides

- **Render Dashboard** : https://render.com/dashboard
- **Votre Backend** : https://allo-bricolage-backend.onrender.com
- **Votre Frontend** : https://allo-bricolage.vercel.app
- **Health Check Backend** : https://allo-bricolage-backend.onrender.com/health

---

## ✅ Vérification Finale

Testez votre site :
1. Les techniciens devraient s'afficher avec leurs images
2. Plus d'erreurs "Failed to load technicians"
3. Les images devraient se charger correctement

---

## 🆘 Si vous ne trouvez pas votre service

1. Vérifiez que vous êtes connecté au bon compte Render
2. Vérifiez dans **"Services"** (menu de gauche du dashboard)
3. Cherchez un service avec "backend" dans le nom

---

## 📸 Capture d'écran de référence

La page Environment dans Render ressemble à ceci :
```
┌─────────────────────────────────────┐
│  Environment Variables              │
├─────────────────────────────────────┤
│  Key              Value              │
│  ───────────────────────────────────│
│  DATABASE_URL     mysql://...        │
│  JWT_ACCESS_SECRET dev-secret...     │
│  FRONTEND_URL     https://...         │
│  [Add Environment Variable]          │
└─────────────────────────────────────┘
```

---

## ✅ C'est tout !

Une fois configuré, toutes les nouvelles images uploadées utiliseront automatiquement la bonne URL Render.

