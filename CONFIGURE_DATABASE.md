# Configuration de la base de données Hostinger MySQL

## 📋 Informations nécessaires

Après avoir créé votre base de données sur Hostinger, vous aurez besoin de :

1. **Host** : Généralement `localhost` ou `mysql.hostinger.com`
2. **Port** : `3306` (port MySQL standard)
3. **Database Name** : Ex: `u905810677_alobricolage`
4. **Username** : Ex: `u905810677_admin`
5. **Password** : Le mot de passe que vous avez créé

## 🔧 Configuration

### Étape 1 : Mettre à jour le fichier `.env`

Dans `/backend/.env`, ajoutez ou modifiez la ligne `DATABASE_URL` :

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
```

**Exemple concret :**
```env
DATABASE_URL="mysql://u905810677_admin:MonMotDePasse123@localhost:3306/u905810677_alobricolage"
```

**⚠️ Important :**
- Remplacez `USERNAME`, `PASSWORD`, `HOST`, `PORT`, et `DATABASE_NAME` par vos vraies valeurs
- Si votre mot de passe contient des caractères spéciaux, encodez-les en URL (ex: `@` devient `%40`)

### Étape 2 : Générer le client Prisma

```bash
cd backend
npx prisma generate
```

### Étape 3 : Pousser le schéma vers la base de données

```bash
npx prisma db push
```

Cette commande va créer toutes les tables dans votre base de données MySQL sur Hostinger.

### Étape 4 : Vérifier la connexion

```bash
npx prisma studio
```

Cela ouvrira Prisma Studio dans votre navigateur, vous permettant de voir et gérer vos données.

## 🔍 Trouver les informations de connexion sur Hostinger

1. Allez dans **Databases** → **Management**
2. Cliquez sur votre base de données créée
3. Vous devriez voir :
   - **Host** : L'adresse du serveur
   - **Port** : Le port (généralement 3306)
   - **Database** : Le nom de la base
   - **Username** : Le nom d'utilisateur

## ⚠️ Notes importantes

- **Sécurité** : Ne commitez jamais votre fichier `.env` avec les mots de passe
- **Connexion distante** : Si vous êtes en local et que la base est sur Hostinger, vous devrez peut-être activer l'accès distant dans le panneau Hostinger
- **SSL** : Pour une connexion sécurisée, vous pouvez ajouter `?sslmode=REQUIRED` à la fin de l'URL (mais MySQL utilise généralement SSL par défaut)

## 🚀 Après la configuration

Une fois configuré, redémarrez votre serveur backend :

```bash
cd backend
npm run dev
```

Votre application devrait maintenant être connectée à la base de données Hostinger !

