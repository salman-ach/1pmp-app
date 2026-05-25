# FoodTracker — Application Web

Interface sécurisée pour scanner vos repas et suivre votre équilibre alimentaire.

**Stack :** Next.js 14 · Tailwind CSS · Supabase (Auth + DB) · Dark Mode

---

## 🚀 Installation rapide

### 1. Cloner et installer les dépendances

```bash
git clone <votre-repo>
cd foodtracker
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans **SQL Editor** et exécutez le contenu de `supabase-schema.sql`
3. Dans **Settings → API**, copiez votre `URL` et `anon key`

### 3. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Éditez `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

### 4. Lancer en développement

```bash
npm run dev
# → http://localhost:3000
```

---

## 📁 Structure du projet

```
foodtracker/
├── context/
│   └── AuthContext.js        # Provider Auth global (user, signIn, signUp, signOut)
├── lib/
│   └── supabaseClient.js     # Initialisation Supabase
├── components/
│   ├── Navbar.js             # Barre de navigation (routes protégées uniquement)
│   └── ProtectedLayout.js    # HOC de protection des routes
├── pages/
│   ├── _app.js               # Wrapper avec AuthProvider
│   ├── index.js              # Redirection intelligente (/ → /login ou /dashboard)
│   ├── login.js              # Page de connexion
│   ├── register.js           # Page d'inscription
│   └── dashboard.js          # ⭐ Le Plan Marketing en Une Page
├── styles/
│   └── globals.css           # Tokens de design, animations
├── supabase-schema.sql       # Schéma DB à exécuter dans Supabase
├── tailwind.config.js
└── .env.local.example
```

---

## 🎨 Design System

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-bg` | `#0A1118` | Fond principal |
| `--color-accent` | `#1A8669` | Boutons, liens, focus |
| Texte principal | `#e8edf2` | Corps de texte |
| Texte secondaire | `rgba(255,255,255,0.45)` | Labels, hints |
| Fond carte | `#0d1923` | Composants sur fond |

**Polices :** DM Serif Display (titres) · DM Sans (corps) · DM Mono (labels)

---

## 🗄️ Base de données

### Table `calorie_logs`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence `auth.users` |
| `food_name` | TEXT | Nom de l'aliment |
| `calories` | INTEGER | Nombre de calories |
| `meal_type` | TEXT | Type de repas (breakfast, lunch, etc.) |
| `log_date` | DATE | Date de l'entrée |
| `updated_at` | TIMESTAMPTZ | Mise à jour auto |

---

## 🔒 Sécurité

- Row Level Security (RLS) activé sur Supabase
- Sessions gérées côté client avec `@supabase/supabase-js`
- Variables sensibles dans `.env.local` (non commité)
- Validation des formulaires côté client + côté Supabase Auth

---

## 🏗️ Production

```bash
npm run build
npm run start
```

Déployez sur **Vercel** (recommandé) : connectez votre repo, ajoutez les variables d'env dans les settings Vercel.
