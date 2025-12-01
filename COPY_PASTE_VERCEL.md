# 📋 Copier-Coller pour Vercel

## ✅ Votre Backend est Opérationnel !
Testé et fonctionne : `https://allo-bricolage-backend.onrender.com`

---

## 🎯 Configuration Vercel - Copier-Coller

### Étape 1 : Ouvrez Vercel
👉 https://vercel.com/dashboard → Projet **allo-bricolage** → **Settings** → **Environment Variables**

### Étape 2 : Ajoutez cette variable

**Key (copiez exactement):**
```
VITE_API_URL
```

**Value (copiez exactement):**
```
https://allo-bricolage-backend.onrender.com/api
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

### Étape 3 : Cliquez sur **Save**

### Étape 4 : Redéployez
**Deployments** → **3 points (⋯)** → **Redeploy**

---

## 🔧 Vérification Render CORS (Optionnel mais Recommandé)

Dans Render : https://render.com/dashboard → **allo-bricolage-backend** → **Environment**

Vérifiez que cette variable existe :
- **Key**: `FRONTEND_URL`
- **Value**: `https://allo-bricolage.vercel.app`

Si elle n'existe pas, ajoutez-la.

---

## ✅ Test

Après redéploiement (2-3 minutes) :
1. Ouvrez : https://allo-bricolage.vercel.app
2. Console (F12) → Vous devriez voir : `🔗 API Base URL: https://allo-bricolage-backend.onrender.com/api`
3. Essayez de vous inscrire → Ça devrait fonctionner ! 🎉

