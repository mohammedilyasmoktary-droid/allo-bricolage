#!/bin/bash

echo "🔧 Configuration de la base de données MySQL Hostinger"
echo ""

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "❌ Erreur: Le fichier .env n'existe pas!"
    exit 1
fi

echo "📋 Étapes à suivre:"
echo ""
echo "1. Assurez-vous d'avoir mis à jour DATABASE_URL dans .env avec:"
echo "   DATABASE_URL=\"mysql://u905810677_adminbrico:VOTRE_MOT_DE_PASSE@HOST:3306/u905810677_alobricolage\""
echo ""
echo "2. Appuyez sur Entrée pour continuer..."
read

echo ""
echo "🔄 Génération du client Prisma..."
npx prisma generate

echo ""
echo "📤 Poussage du schéma vers la base de données..."
npx prisma db push

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "Pour vérifier, vous pouvez lancer:"
echo "  npx prisma studio"

