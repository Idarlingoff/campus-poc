# Migrations de base de données

Ce dossier contient les migrations de base de données gérées par [dbmate](https://github.com/amacneil/dbmate).

## Commandes utiles

### Créer une nouvelle migration
```bash
dbmate new nom_de_la_migration
```

### Appliquer les migrations
```bash
# Appliquer toutes les migrations en attente
dbmate up

# Ou via Docker
docker compose exec api dbmate up
```

### Annuler la dernière migration
```bash
dbmate down

# Ou via Docker
docker compose exec api dbmate down
```

### Voir le statut des migrations
```bash
dbmate status
```

### Autres commandes
```bash
# Créer la base de données
dbmate create

# Supprimer la base de données
dbmate drop

# Regénérer le fichier schema.sql
dbmate dump
```

## Configuration

La configuration se trouve dans le fichier `.dbmate` à la racine du projet.

## Variables d'environnement

Dbmate utilise la variable `DATABASE_URL` pour se connecter à la base de données.

Format : `postgresql://user:password@host:port/database`

Pour l'environnement local (hors Docker) :
```bash
export DATABASE_URL="postgresql://campus:campus@password@localhost:5432/campus"
```

Pour Docker, la variable est déjà configurée dans le fichier `.env`.

