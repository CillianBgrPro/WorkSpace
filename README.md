# Workspace

Application web de gestion de projet permettant de suivre les tâches, les équipes, le budget et les événements d'un projet collaboratif.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Laravel (PHP) |
| Frontend | React 18 via Inertia.js |
| Bundler | Vite |
| Styles | Tailwind CSS |
| Calendrier | FullCalendar 6 |
| Graphiques | Chart.js / react-chartjs-2 |
| Dates | Day.js |
| Mailing | Resend |

---

## Prérequis

- PHP >= 8.1
- Composer
- Node.js >= 18
- npm

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/CillianBgrPro/WorkSpace.git
cd workspace

# 2. Installer les dépendances PHP
composer install

# 3. Installer les dépendances JavaScript
npm install

# 4. Copier le fichier d'environnement et le configurer
cp .env.example .env

# 5. Générer la clé d'application
php artisan key:generate

# 6. Lancer les migrations
php artisan migrate
```

---

## Lancer l'application

L'application nécessite deux commandes dans deux terminaux séparés.

**Terminal 1 — Serveur Laravel**

```bash
php artisan serve
```

Démarre le serveur PHP sur `http://localhost:8000`.

**Terminal 2 — Vite (assets frontend)**

```bash
npm run dev
```

Compile les assets React et active le hot reload.

---

## Structure du projet

```
├── app/
│   ├── Http/Controllers/     # Contrôleurs Laravel
│   └── Models/               # Modèles Eloquent
│       ├── User.php
│       ├── Task.php
│       ├── Team.php
│       ├── Event.php
│       ├── Budget.php
│       ├── BudgetCategory.php
│       ├── Expense.php
│       ├── TaskComment.php
│       └── TaskAttachment.php
├── resources/
│   └── js/
│       ├── Pages/            # Pages React (via Inertia)
│       │   ├── Dashboard.jsx
│       │   ├── Tasks/
│       │   ├── Teams/
│       │   ├── Calendar/
│       │   ├── Budget/
│       │   └── Auth/
│       └── Components/       # Composants réutilisables
├── routes/
│   ├── web.php               # Routes principales
│   └── auth.php              # Routes d'authentification
└── database/
    └── migrations/           # Migrations de base de données
```

---

## Fonctionnalités

### Tableau de bord
> Description du tableau de bord : résumé de l'activité, statistiques clés, graphiques.

### Gestion des tâches
> Description : création, assignation, suivi du statut des tâches. Possibilité d'ajouter des commentaires et des pièces jointes.

### Gestion des équipes
> Description : création d'équipes, ajout de membres, attribution des rôles au sein du projet.

### Calendrier
> Description : visualisation des événements et des deadlines sur un calendrier mensuel, hebdomadaire ou sous forme de liste, grâce à FullCalendar.

### Budget
> Description : suivi des dépenses par catégorie, création de budgets, visualisation de l'avancement financier du projet.

### Authentification
> Description : inscription, connexion, réinitialisation de mot de passe, vérification d'email.

---

## Variables d'environnement

Les variables importantes à configurer dans le fichier `.env` :

```env
APP_NAME=Workspace
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workspace
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=resend
RESEND_API_KEY=your_api_key
```

---
