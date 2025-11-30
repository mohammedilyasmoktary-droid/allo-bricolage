# Guide de Configuration - For You Restaurant

## 📋 Prérequis
- Node.js installé ✅ (vous l'avez déjà)
- MongoDB (à installer ou utiliser MongoDB Atlas)

## 🗄️ Option 1: MongoDB Atlas (Cloud - Recommandé - GRATUIT)

### Étapes:
1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Créez un compte gratuit
3. Créez un cluster gratuit (Free tier)
4. Créez un utilisateur de base de données
5. Ajoutez votre IP dans "Network Access" (ou 0.0.0.0/0 pour toutes les IPs)
6. Cliquez sur "Connect" → "Connect your application"
7. Copiez la chaîne de connexion (elle ressemble à: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Mettre à jour .env.local:
Remplacez `MONGODB_URI` dans `.env.local` par votre chaîne de connexion Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant?retryWrites=true&w=majority
```

## 🗄️ Option 2: MongoDB Local

### Sur macOS (avec Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Vérifier que MongoDB tourne:
```bash
brew services list
```

## 🚀 Après avoir configuré MongoDB:

1. **Peupler le menu:**
   ```bash
   npm run seed-menu
   ```

2. **Créer un utilisateur admin:**
   ```bash
   npm run create-admin
   ```

3. **Redémarrer le serveur:**
   ```bash
   npm run dev
   ```

4. **Accéder au site:**
   - Site: http://localhost:3000
   - Admin: http://localhost:3000/admin/login
     - Username: `admin`
     - Password: `admin123` (par défaut)

## ✅ Vérification
- Le menu devrait maintenant afficher tous les plats
- Vous pouvez vous connecter en tant qu'admin
- Vous pouvez générer des QR codes pour les tables

