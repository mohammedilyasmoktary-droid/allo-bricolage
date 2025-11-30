# 🔍 Vérification de MongoDB

## Pour vérifier si MongoDB est configuré:

### Option 1: Tester la connexion MongoDB
Exécutez cette commande pour tester si votre MongoDB fonctionne:

```bash
npm run seed-menu
```

**Si ça fonctionne:**
- ✅ Vous verrez "Connected to MongoDB"
- ✅ Vous verrez "Successfully inserted X menu items"
- ✅ Le menu sera chargé dans votre base de données

**Si ça ne fonctionne pas:**
- ❌ Erreur "MONGODB_URI is not set" → Vérifiez votre fichier .env.local
- ❌ Erreur de connexion → Vérifiez votre chaîne de connexion MongoDB
- ❌ Timeout → Vérifiez que votre IP est autorisée dans MongoDB Atlas

---

## 📝 Configuration MongoDB Atlas (RAPIDE)

Si vous n'avez pas encore configuré MongoDB:

1. **Allez sur:** https://www.mongodb.com/cloud/atlas/register
2. **Créez un compte gratuit** (5 minutes)
3. **Créez un cluster gratuit** (M0 - FREE)
4. **Créez un utilisateur:**
   - Database Access → Add New Database User
   - Username: `restaurant`
   - Password: **SAUVEZ LE MOT DE PASSE**
   - Rôle: "Atlas admin"
5. **Autorisez votre IP:**
   - Network Access → Add IP Address
   - Cliquez "Allow Access from Anywhere" (0.0.0.0/0)
6. **Obtenez la chaîne de connexion:**
   - Database → Connect → Connect your application
   - Copiez la chaîne (ex: `mongodb+srv://restaurant:password@cluster0.xxxxx.mongodb.net/`)
   - **Remplacez `<password>` par votre mot de passe**
   - Ajoutez `restaurant` à la fin: `...mongodb.net/restaurant?retryWrites=true&w=majority`

7. **Mettez à jour .env.local:**
   ```env
   MONGODB_URI=mongodb+srv://restaurant:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
   ```

8. **Testez:**
   ```bash
   npm run seed-menu
   ```

---

## 🚀 Une fois MongoDB configuré:

1. **Chargez le menu:**
   ```bash
   npm run seed-menu
   ```

2. **Créez un admin:**
   ```bash
   npm run create-admin
   ```

3. **Démarrez le serveur:**
   ```bash
   npm run dev
   ```

4. **Vérifiez:**
   - Allez sur http://localhost:3000/menu
   - Vous devriez voir tous les plats!

---

## ❓ Aide

Si vous avez des problèmes, vérifiez:
- ✅ Le fichier `.env.local` existe
- ✅ `MONGODB_URI` est correct dans `.env.local`
- ✅ Votre IP est autorisée dans MongoDB Atlas
- ✅ Le mot de passe dans l'URI correspond à celui de l'utilisateur MongoDB

