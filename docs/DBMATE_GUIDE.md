# Guide dbmate - Gestion des migrations de base de données

## Installation

Dbmate est déjà installé sur la machine du développeur principal. Pour l'installer sur votre machine :

### macOS
```bash
brew install dbmate
```

### Linux
```bash
# Télécharger le binaire
sudo curl -fsSL -o /usr/local/bin/dbmate https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64
sudo chmod +x /usr/local/bin/dbmate
```

### Windows
```powershell
# Avec Scoop
scoop install dbmate
```

## Configuration

La configuration se trouve dans le fichier `.dbmate` à la racine du projet :
```
migrations_dir = "apps/api/db/migrations"
schema_file = "apps/api/db/schema.sql"
```

## Variables d'environnement

Dbmate utilise la variable `DATABASE_URL` pour se connecter à PostgreSQL.

### Avec Docker (recommandé)
La variable est déjà configurée dans `.env`. Aucune action nécessaire.

### En local (sans Docker)
Ajoutez ceci à votre `.env` :
```bash
DATABASE_URL=postgresql://campus:campus@password@localhost:5432/campus
```

Ou exportez-la temporairement :
```bash
export DATABASE_URL="postgresql://campus:campus@password@localhost:5432/campus"
```

## Commandes disponibles

### Depuis la racine du projet

#### Créer une nouvelle migration
```bash
npm run db:new nom_de_la_migration
```
Exemple :
```bash
npm run db:new create_challenges_table
```

Cela créera un fichier dans `apps/api/db/migrations/` avec le format :
```
YYYYMMDDHHMMSS_nom_de_la_migration.sql
```

#### Appliquer les migrations
```bash
npm run db:up
```
Applique toutes les migrations qui n'ont pas encore été exécutées.

#### Annuler la dernière migration
```bash
npm run db:down
```
Exécute le bloc `-- migrate:down` de la dernière migration.

#### Voir le statut
```bash
npm run db:status
```
Affiche quelles migrations ont été appliquées et lesquelles sont en attente.

#### Créer la base de données
```bash
npm run db:create
```

#### Supprimer la base de données
```bash
npm run db:drop
```

#### Générer le fichier schema.sql
```bash
npm run db:dump
```
Génère un fichier `apps/api/db/schema.sql` avec le schéma complet.

### Avec Docker

Si vous utilisez Docker et que dbmate n'est pas installé localement :

```bash
# Entrer dans le container API
docker compose exec api sh

# Puis utiliser dbmate
dbmate up
dbmate down
dbmate status
# etc.
```

## Structure d'une migration

Chaque fichier de migration contient deux sections :

```sql
-- migrate:up
-- Code SQL pour appliquer la migration
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrate:down
-- Code SQL pour annuler la migration
DROP TABLE IF EXISTS users;
```

## Bonnes pratiques

### 1. Toujours tester la migration ET son rollback
```bash
npm run db:up    # Applique la migration
npm run db:down  # L'annule
npm run db:up    # La réapplique
```

### 2. Une migration = une tâche logique
❌ Mauvais : créer plusieurs tables sans lien dans une migration
✅ Bon : une migration par fonctionnalité ou table

### 3. Nommer clairement vos migrations
```bash
# Bon
npm run db:new create_users_table
npm run db:new add_role_to_users
npm run db:new create_challenges_and_submissions

# Moins bon
npm run db:new update
npm run db:new fix
```

### 4. Ne jamais modifier une migration déjà appliquée
Si une migration a été appliquée en production, créez une NOUVELLE migration pour la corriger.

### 5. Toujours inclure un bloc migrate:down
Même si vous pensez ne jamais l'utiliser, cela facilite le développement.

## Workflow typique

### Développement d'une nouvelle fonctionnalité

1. **Créer la migration**
   ```bash
   npm run db:new create_challenges_table
   ```

2. **Éditer le fichier SQL** dans `apps/api/db/migrations/`

3. **Appliquer la migration**
   ```bash
   npm run db:up
   ```

4. **Vérifier que tout fonctionne**
   Testez votre code avec la nouvelle structure

5. **Tester le rollback**
   ```bash
   npm run db:down
   npm run db:up
   ```

6. **Commit et push**
   ```bash
   git add apps/api/db/migrations/
   git commit -m "feat(db): add challenges table"
   git push
   ```

### Mise à jour en équipe

Quand un coéquipier ajoute une migration :

1. **Pull les changements**
   ```bash
   git pull
   ```

2. **Appliquer les nouvelles migrations**
   ```bash
   npm run db:up
   ```

## Exemples de migrations courantes

### Créer une table
```sql
-- migrate:up
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50),
    category VARCHAR(100),
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);

-- migrate:down
DROP TABLE IF EXISTS challenges;
```

### Ajouter une colonne
```sql
-- migrate:up
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- migrate:down
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS is_verified;
```

### Créer une relation
```sql
-- migrate:up
CREATE TABLE user_challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge_id ON user_challenges(challenge_id);

-- migrate:down
DROP TABLE IF EXISTS user_challenges;
```

### Insérer des données de seed
```sql
-- migrate:up
INSERT INTO roles (name, description) VALUES
    ('admin', 'Administrateur système'),
    ('user', 'Utilisateur standard'),
    ('guest', 'Invité');

-- migrate:down
DELETE FROM roles WHERE name IN ('admin', 'user', 'guest');
```

## Dépannage

### Erreur : "database does not exist"
```bash
npm run db:create
```

### Erreur : "migration already applied"
Vérifiez le statut :
```bash
npm run db:status
```

### Erreur de connexion
Vérifiez que PostgreSQL est démarré :
```bash
docker compose ps
```

Si nécessaire, redémarrez :
```bash
npm run docker:down
npm run docker:up
```

### Réinitialiser complètement la base
⚠️ **ATTENTION** : Cela supprime TOUTES les données !
```bash
npm run db:drop
npm run db:create
npm run db:up
```

## Ressources

- [Documentation officielle dbmate](https://github.com/amacneil/dbmate)
- [Guide PostgreSQL](https://www.postgresql.org/docs/)

## Support

Pour toute question, contactez le lead développeur ou créez une issue sur le repo.

