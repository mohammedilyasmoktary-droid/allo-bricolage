# 🎯 Guide Étape par Étape - Configuration Complète

## 📋 Étape 1: Vérifier Node.js (DÉJÀ FAIT ✅)

Node.js est installé. Passons à l'étape suivante.

---

## 📋 Étape 2: Configurer MongoDB Atlas (5 minutes)

### 2.1 Créer un compte MongoDB Atlas

1. **Ouvrez votre navigateur**
2. **Allez sur:** https://www.mongodb.com/cloud/atlas/register
3. **Remplissez le formulaire:**
   - Email: Votre email
   - Password: Créez un mot de passe
   - First Name: Votre prénom
   - Last Name: Votre nom
4. **Cochez** "I agree to the Terms of Service"
5. **Cliquez** sur "Create your Atlas account"

### 2.2 Créer un cluster gratuit

1. **Après la connexion**, vous verrez "Deploy a cloud database"
2. **Choisissez** l'option "M0 FREE" (gratuit)
3. **Choisissez** votre région (ex: "Europe - Frankfurt" ou "Europe - Ireland")
4. **Laissez** le nom par défaut (ex: "Cluster0")
5. **Cliquez** sur "Create Deployment"
6. **Attendez** 3-5 minutes que le cluster se crée

### 2.3 Créer un utilisateur de base de données

1. **Pendant que le cluster se crée**, vous verrez "Create Database User"
2. **Username:** Entrez `restaurant` (ou un nom de votre choix)
3. **Password:** 
   - Cliquez sur "Autogenerate Secure Password"
   - **⚠️ IMPORTANT:** Copiez le mot de passe généré et sauvegardez-le (vous en aurez besoin!)
   - Ou créez votre propre mot de passe fort
4. **Cliquez** sur "Create Database User"

### 2.4 Autoriser votre IP

1. **Vous verrez** "Where would you like to connect from?"
2. **Cliquez** sur "Add My Current IP Address"
3. **OU** pour tester facilement, cliquez sur "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ Note: Pour la production, utilisez seulement votre IP
4. **Cliquez** sur "Finish and Close"

### 2.5 Obtenir la chaîne de connexion

1. **Une fois le cluster créé**, cliquez sur "Connect"
2. **Choisissez** "Connect your application"
3. **Vous verrez** une chaîne de connexion comme:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Copiez** cette chaîne complète
5. **Remplacez:**
   - `<username>` par le nom d'utilisateur que vous avez créé (ex: `restaurant`)
   - `<password>` par le mot de passe que vous avez créé
   - Ajoutez `/restaurant` avant le `?` pour spécifier la base de données
   
   **Exemple final:**
   ```
   mongodb+srv://restaurant:VotreMotDePasse123@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
   ```

---

## 📋 Étape 3: Mettre à jour .env.local

1. **Ouvrez** le fichier `.env.local` dans votre éditeur
2. **Trouvez** la ligne `MONGODB_URI=`
3. **Remplacez** la valeur par votre chaîne de connexion complète (celle que vous venez de créer)
4. **Sauvegardez** le fichier

**Exemple de .env.local complet:**
```env
# Database
MONGODB_URI=mongodb+srv://restaurant:VotreMotDePasse123@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
MONGODB_DB=restaurant

# Auth
JWT_SECRET=restaurant_jwt_secret_key_change_in_production_2024

# App
RESTAURANT_NAME=For You Restaurant
BASE_URL=http://localhost:3000

# WhatsApp
WHATSAPP_PROVIDER=meta
```

---

## 📋 Étape 4: Charger le menu dans la base de données

1. **Ouvrez** le terminal dans VS Code (ou votre terminal)
2. **Assurez-vous** d'être dans le dossier du projet:
   ```bash
   cd /Users/ilyasmoktary/Documents/foryou
   ```
3. **Exécutez** la commande:
   ```bash
   npm run seed-menu
   ```

**Résultat attendu:**
```
Connected to MongoDB
Cleared existing menu items
Successfully inserted 130 menu items

Menu categories:
  - Loaded Fries: 7 items
  - Premium Sandwiches: 5 items
  - Combos: 3 items
  - Sandwiches: 8 items
  - Sides: 6 items
  - Loaded Mac: 3 items
  - Sundae: 2 items
  - For You Rolls: 9 items
  - Spring Rolls: 5 items
  - Makis: 6 items
  - Futomakis: 3 items
  - Californias: 5 items
  - Boxes: 6 items
  - Sushi Burrito: 3 items
  - Bowls: 3 items
  - Desserts: 4 items
  - Drinks: 12 items
  - Coffee: 6 items

Menu seeding completed!
```

**Si vous voyez une erreur:**
- Vérifiez que votre `MONGODB_URI` est correct dans `.env.local`
- Vérifiez que votre IP est autorisée dans MongoDB Atlas
- Vérifiez que le mot de passe dans l'URI correspond à celui de l'utilisateur

---

## 📋 Étape 5: Créer un utilisateur admin

1. **Dans le terminal**, exécutez:
   ```bash
   npm run create-admin
   ```

**Résultat attendu:**
```
Connected to MongoDB
Admin user "admin" created successfully
```

**Pour créer un admin avec un nom personnalisé:**
```bash
npm run create-admin monnom mesuperpassword
```

---

## 📋 Étape 6: Vérifier que tout fonctionne

1. **Ouvrez** votre navigateur
2. **Allez sur:** http://localhost:3000/menu
3. **Vous devriez voir:**
   - ✅ Tous les plats organisés par catégorie
   - ✅ Les prix en DH
   - ✅ Les boutons de filtre par catégorie
   - ✅ Les boutons "Add" pour ajouter au panier

**Si le menu est toujours vide:**
- Vérifiez que `npm run seed-menu` a réussi
- Rafraîchissez la page (Cmd+R ou F5)
- Vérifiez la console du navigateur pour les erreurs

---

## 📋 Étape 7: Tester l'admin

1. **Allez sur:** http://localhost:3000/admin/login
2. **Connectez-vous avec:**
   - Username: `admin`
   - Password: `admin123` (ou celui que vous avez créé)
3. **Vous devriez voir** le tableau de bord admin

---

## 📋 Étape 8: Générer des QR codes pour les tables

1. **Connectez-vous** en tant qu'admin
2. **Allez sur:** http://localhost:3000/admin/qr
3. **Ajustez** le nombre de tables si nécessaire
4. **Imprimez** la page pour placer les QR codes sur les tables

---

## 🎉 Félicitations!

Votre restaurant est maintenant complètement configuré! Vous pouvez:
- ✅ Voir tous les plats du menu
- ✅ Ajouter des plats au panier
- ✅ Passer des commandes
- ✅ Gérer le menu via l'admin
- ✅ Voir les commandes via l'admin
- ✅ Générer des QR codes pour les tables

---

## ❓ Problèmes courants

### Erreur: "MONGODB_URI is not set"
→ Vérifiez que le fichier `.env.local` existe et contient `MONGODB_URI`

### Erreur: "Authentication failed"
→ Vérifiez que le mot de passe dans `MONGODB_URI` correspond à celui de l'utilisateur MongoDB

### Erreur: "Connection timeout"
→ Vérifiez que votre IP est autorisée dans MongoDB Atlas (Network Access)

### Le menu est vide après seed-menu
→ Rafraîchissez la page, vérifiez les erreurs dans la console du navigateur

### Le serveur ne démarre pas
→ Vérifiez que le port 3000 est libre, ou tuez le processus: `lsof -ti:3000 | xargs kill -9`

---

## 📞 Besoin d'aide?

Si vous êtes bloqué à une étape, dites-moi à quelle étape vous êtes et je vous aiderai!

