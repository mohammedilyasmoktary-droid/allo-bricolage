# Guide de configuration Hostinger MySQL

## Étape 1 : Créer la base de données sur Hostinger

1. Dans le panneau Hostinger, remplissez le formulaire "Create a New MySQL Database And Database User" :
   - **MySQL database name** : `u905810677_alobricolage` (ou un nom de votre choix)
   - **MySQL username** : `u905810677_admin` (ou un nom de votre choix)
   - **Password** : Créez un mot de passe fort et notez-le !
   
2. Cliquez sur le bouton vert "Create"

3. **IMPORTANT** : Notez ces informations :
   - Database Name : `u905810677_alobricolage`
   - Username : `u905810677_admin`
   - Password : (celui que vous avez créé)
   - Host : Généralement `localhost` ou `mysql.hostinger.com` (vérifiez dans les détails de la base)
   - Port : `3306` (port MySQL standard)

## Étape 2 : Obtenir les informations de connexion complètes

Après avoir créé la base, Hostinger devrait afficher :
- Le nom d'hôte (host)
- Le port
- Le nom de la base de données
- Le nom d'utilisateur

## Étape 3 : Modifier le schéma Prisma pour MySQL

Votre application utilise actuellement PostgreSQL, mais Hostinger propose MySQL. Il faut modifier le schéma.

## Étape 4 : Configurer la connexion

Une fois que vous avez toutes les informations, nous configurerons le fichier `.env` avec la chaîne de connexion MySQL.

