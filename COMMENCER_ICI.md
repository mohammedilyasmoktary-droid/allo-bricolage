# 🚀 COMMENCER ICI - Guide Simple

## ❓ Votre situation actuelle

Vous avez `MONGODB_URI=mongodb://localhost:27017/restaurant` dans votre `.env.local`, mais MongoDB n'est pas installé localement.

## ✅ SOLUTION RECOMMANDÉE: MongoDB Atlas (5 minutes, GRATUIT)

C'est la solution la plus facile! Suivez ces étapes:

---

### ÉTAPE 1: Créer un compte MongoDB Atlas

1. **Ouvrez votre navigateur**
2. **Allez sur:** https://www.mongodb.com/cloud/atlas/register
3. **Créez un compte** (c'est gratuit, 5 minutes)

---

### ÉTAPE 2: Créer un cluster gratuit

1. Après la connexion, cliquez sur **"Build a Database"**
2. Choisissez **"M0 FREE"** (gratuit)
3. Choisissez votre région (ex: "Europe - Frankfurt")
4. Cliquez sur **"Create Deployment"**
5. Attendez 2-3 minutes

---

### ÉTAPE 3: Créer un utilisateur

1. Dans "Create Database User":
   - **Username:** `restaurant`
   - **Password:** Cliquez "Autogenerate Secure Password"
   - **⚠️ IMPORTANT:** Copiez le mot de passe et sauvegardez-le!
2. Cliquez sur **"Create Database User"**

---

### ÉTAPE 4: Autoriser votre IP

1. Dans "Where would you like to connect from?"
2. Cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Cliquez sur **"Finish and Close"**

---

### ÉTAPE 5: Obtenir la chaîne de connexion

1. Cliquez sur **"Connect"** sur votre cluster
2. Choisissez **"Connect your application"**
3. **Copiez** la chaîne de connexion (elle ressemble à):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

### ÉTAPE 6: Mettre à jour .env.local

1. **Ouvrez** le fichier `.env.local` dans VS Code
2. **Remplacez** cette ligne:
   ```env
   MONGODB_URI=mongodb://localhost:27017/restaurant
   ```
   
   Par votre chaîne de connexion (en remplaçant `<username>` et `<password>`):
   ```env
   MONGODB_URI=mongodb+srv://restaurant:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
   ```
   
   **Exemple concret:**
   Si votre mot de passe est `Abc123Xyz`, et votre cluster est `cluster0.abc123.mongodb.net`, ça donne:
   ```env
   MONGODB_URI=mongodb+srv://restaurant:Abc123Xyz@cluster0.abc123.mongodb.net/restaurant?retryWrites=true&w=majority
   ```

3. **Sauvegardez** le fichier (Cmd+S)

---

### ÉTAPE 7: Charger le menu

1. **Ouvrez le terminal** dans VS Code (Terminal → New Terminal)
2. **Exécutez:**
   ```bash
   npm run seed-menu
   ```

**Vous devriez voir:**
```
Connected to MongoDB
Cleared existing menu items
Successfully inserted 130 menu items
Menu seeding completed!
```

---

### ÉTAPE 8: Vérifier dans le navigateur

1. **Allez sur:** http://localhost:3000/menu
2. **Vous devriez voir** tous les plats! 🎉

---

## 🎯 RÉCAPITULATIF RAPIDE

1. ✅ Créer compte MongoDB Atlas → https://www.mongodb.com/cloud/atlas/register
2. ✅ Créer cluster gratuit (M0 FREE)
3. ✅ Créer utilisateur (username: `restaurant`, password: sauvegardez-le!)
4. ✅ Autoriser IP (Allow Access from Anywhere)
5. ✅ Copier la chaîne de connexion
6. ✅ Mettre à jour `.env.local` avec la nouvelle chaîne
7. ✅ Exécuter `npm run seed-menu`
8. ✅ Vérifier sur http://localhost:3000/menu

---

## ❓ Besoin d'aide?

Dites-moi à quelle étape vous êtes et je vous aiderai!

---

## 🔄 Alternative: MongoDB Local (si vous préférez)

Si vous préférez installer MongoDB localement, vous devez d'abord installer Homebrew, puis MongoDB. Mais MongoDB Atlas est beaucoup plus simple et recommandé!

