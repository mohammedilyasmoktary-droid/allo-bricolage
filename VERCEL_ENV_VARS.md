# Variables d'environnement pour Vercel

## Variables à configurer dans Vercel

Allez dans **Settings → Environment Variables** et ajoutez :

### Backend (API)
1. **DATABASE_URL**
   - Value: `mysql://u905810677_adminbrico:ALObricolage11@srv1657.hstgr.io:3306/u905810677_alobricolage`
   - Environments: Production, Preview, Development

2. **JWT_ACCESS_SECRET**
   - Value: (votre secret JWT - gardez-le secret!)
   - Environments: Production, Preview, Development

3. **JWT_REFRESH_SECRET**
   - Value: (votre secret JWT refresh - gardez-le secret!)
   - Environments: Production, Preview, Development

4. **JWT_ACCESS_EXPIRES_IN**
   - Value: `15m`
   - Environments: Production, Preview, Development

5. **JWT_REFRESH_EXPIRES_IN**
   - Value: `7d`
   - Environments: Production, Preview, Development

6. **FRONTEND_URL**
   - Value: `https://allo-bricolage.vercel.app` (ou votre URL Vercel)
   - Environments: Production, Preview, Development

7. **NODE_ENV**
   - Value: `production`
   - Environments: Production

8. **UPLOAD_DIR**
   - Value: `./uploads`
   - Environments: Production, Preview, Development

### Frontend
9. **VITE_API_URL**
   - Value: `https://allo-bricolage.vercel.app/api` (ou votre URL Vercel + /api)
   - Environments: Production, Preview, Development

## Comment ajouter les variables

1. Allez sur votre projet Vercel
2. Cliquez sur **Settings**
3. Cliquez sur **Environment Variables**
4. Cliquez sur **Add New**
5. Entrez le nom et la valeur
6. Cochez les environnements (Production, Preview, Development)
7. Cliquez sur **Save**
8. **Redéployez** votre projet pour que les variables prennent effet

