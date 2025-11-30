# Instructions de configuration - Base de données Hostinger

## ✅ Informations que vous avez :
- **Database Name** : `u905810677_alobricolage` (visible dans phpMyAdmin)
- **Username** : `u905810677_adminbrico` (avec le préfixe Hostinger)
- **Host** : À déterminer (probablement `localhost` ou `auth-db1657.hstgr.io`)
- **Port** : `3306` (port MySQL standard)
- **Password** : Le mot de passe que vous avez créé lors de la création de la base

## 🔧 Prochaines étapes :

### 1. Trouver le HOST

Dans phpMyAdmin, regardez l'URL ou les informations de connexion. Le host peut être :
- `localhost` (si vous êtes sur le serveur Hostinger)
- `auth-db1657.hstgr.io` (d'après l'URL phpMyAdmin)
- Ou une autre adresse fournie par Hostinger

**Pour trouver le host exact :**
1. Dans le panneau Hostinger, allez dans **Databases** → **Management**
2. Cliquez sur votre base de données
3. Cherchez "Host" ou "Server" dans les détails

### 2. Configurer le fichier `.env`

Ouvrez `/backend/.env` et ajoutez/modifiez :

```env
DATABASE_URL="mysql://u905810677_adminbrico:VOTRE_MOT_DE_PASSE@HOST:3306/u905810677_alobricolage"
```

**Remplacez :**
- `VOTRE_MOT_DE_PASSE` par le mot de passe que vous avez créé
- `HOST` par l'adresse du serveur (localhost ou l'adresse Hostinger)

**Exemple :**
```env
DATABASE_URL="mysql://u905810677_adminbrico:MonMotDePasse123@localhost:3306/u905810677_alobricolage"
```

**⚠️ Si le mot de passe contient des caractères spéciaux**, encodez-les :
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- etc.

### 3. Générer le client Prisma

```bash
cd backend
npx prisma generate
```

### 4. Pousser le schéma vers la base de données

```bash
npx prisma db push
```

Cette commande va créer toutes les tables dans votre base MySQL.

### 5. Vérifier que ça fonctionne

```bash
npx prisma studio
```

Cela ouvrira Prisma Studio dans votre navigateur pour voir vos tables.

## 🚀 Après la configuration

Redémarrez votre serveur backend :

```bash
cd backend
npm run dev
```
