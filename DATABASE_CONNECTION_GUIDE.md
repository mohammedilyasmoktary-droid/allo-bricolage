# Guide de connexion à la base de données Hostinger

## ⚠️ Important : Type de base de données

Votre application utilise **PostgreSQL** (d'après `schema.prisma`), mais Hostinger affiche **MySQL**. Vous avez deux options :

### Option 1 : Utiliser PostgreSQL sur Hostinger (Recommandé)
Si Hostinger propose PostgreSQL, créez une base PostgreSQL et utilisez-la.

### Option 2 : Migrer vers MySQL
Si Hostinger ne propose que MySQL, vous devrez modifier votre schéma Prisma pour utiliser MySQL.

---

## 📋 Étapes pour connecter votre base de données

### 1. Obtenir les informations de connexion depuis Hostinger

Dans le panneau Hostinger, vous devriez voir :
- **Host/Server** : (ex: `localhost` ou une adresse IP)
- **Port** : (ex: `3306` pour MySQL, `5432` pour PostgreSQL)
- **Database Name** : Le nom de votre base (ex: `u905810677_alobricolage`)
- **Username** : Le nom d'utilisateur (ex: `u905810677_admin`)
- **Password** : Le mot de passe que vous avez défini

### 2. Construire la chaîne de connexion (Connection String)

#### Pour PostgreSQL :
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?sslmode=require"
```

**Exemple :**
```env
DATABASE_URL="postgresql://u905810677_admin:VotreMotDePasse@localhost:5432/u905810677_alobricolage?sslmode=require"
```

#### Pour MySQL (si vous migrez) :
```env
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
```

**Exemple :**
```env
DATABASE_URL="mysql://u905810677_admin:VotreMotDePasse@localhost:3306/u905810677_alobricolage"
```

### 3. Mettre à jour votre fichier `.env`

Dans `/backend/.env`, ajoutez ou modifiez :

```env
# Base de données de production (Hostinger)
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?sslmode=require"

# Ou pour MySQL :
# DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
```

### 4. Si vous devez migrer vers MySQL

Si Hostinger ne propose que MySQL, vous devrez :

1. **Modifier `schema.prisma` :**
```prisma
datasource db {
  provider = "mysql"  // Changer de "postgresql" à "mysql"
  url      = env("DATABASE_URL")
}
```

2. **Réinstaller Prisma Client :**
```bash
cd backend
npm install @prisma/client
npx prisma generate
```

3. **Pousser le schéma vers la base :**
```bash
npx prisma db push
```

### 5. Tester la connexion

```bash
cd backend
npx prisma db pull  # Pour vérifier la connexion
```

---

## 🔍 Où trouver les informations dans Hostinger

1. **Host/Server** : Généralement `localhost` ou une adresse comme `mysql.hostinger.com`
2. **Port** : 
   - MySQL : `3306`
   - PostgreSQL : `5432`
3. **Database Name** : Le nom que vous avez créé (avec le préfixe `u905810677_`)
4. **Username** : Le nom d'utilisateur que vous avez créé
5. **Password** : Le mot de passe que vous avez défini lors de la création

---

## 🚀 Déploiement

Une fois la connexion configurée :

1. **Pousser le schéma vers la base de production :**
```bash
cd backend
npx prisma db push
```

2. **Générer le client Prisma :**
```bash
npx prisma generate
```

3. **Démarrer votre serveur :**
```bash
npm run dev
```

---

## ⚠️ Notes importantes

- **Sécurité** : Ne commitez jamais votre fichier `.env` avec les mots de passe
- **SSL** : Pour PostgreSQL, utilisez `?sslmode=require` pour une connexion sécurisée
- **Variables d'environnement** : En production, utilisez les variables d'environnement du serveur plutôt que le fichier `.env`

---

## 📞 Besoin d'aide ?

Si vous avez des difficultés :
1. Vérifiez que le type de base de données correspond (PostgreSQL ou MySQL)
2. Vérifiez que les identifiants sont corrects
3. Vérifiez que le port est ouvert et accessible
4. Testez la connexion avec un client de base de données (pgAdmin, MySQL Workbench, etc.)

