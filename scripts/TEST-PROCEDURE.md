# Procédure de test Solexi

## 1. Créer les comptes de test (une seule fois)

Aller sur l'app et créer 4 comptes via le formulaire d'inscription :

| Email | Mot de passe | Nom complet |
|---|---|---|
| `test.owner@solexi.ai` | `TestOwner2026!` | Test Owner |
| `test.member@solexi.ai` | `TestMember2026!` | Test Member |
| `test.heir@solexi.ai` | `TestHeir2026!` | Test Héritier |
| `test.viewer@solexi.ai` | `TestViewer2026!` | Test Viewer |

> ⚠️ Les emails doivent être confirmés. Activer temporairement l'auto-confirm
> dans Cloud → Users → Auth Settings, créer les comptes, puis désactiver.

## 2. Peupler l'environnement de test

Exécuter le script de seed dans la console SQL de Lovable Cloud :

```
scripts/seed-test-environment.sql
```

Ce script :
- Met à jour les profils des 4 comptes
- Crée un cercle "Cercle Test Solexi"
- Assigne les rôles : owner, family_member, heir, viewer
- Ajoute des labels familiaux
- Crée 10 items de checklist (toutes catégories)
- Crée 5 responsabilités de gouvernance
- Crée 3 souvenirs (2 publics, 1 privé)

## 3. Scénarios de test

### A. Test des rôles et permissions

| Scénario | Connexion | Vérifier |
|---|---|---|
| Owner voit tout | test.owner | Dashboard complet, tous les menus |
| Member voit souvenirs + governance | test.member | Pas d'accès checklist edit, pas members.manage |
| Heir voit seulement docs héritiers | test.heir | Pas d'accès governance, pas de souvenirs privés |
| Viewer consultation seule | test.viewer | Lecture seule, aucune création possible |

### B. Test du flux d'invitation

1. Se connecter comme `test.owner`
2. Inviter `test.newmember@solexi.ai` comme `family_member`
3. Vérifier que l'invitation apparaît dans l'onglet Invitations
4. Simuler l'acceptation

### C. Test des documents

1. Se connecter comme `test.owner`
2. Uploader un document PDF avec visibilité `heirs_only`
3. Se connecter comme `test.heir` → vérifier qu'il voit le document
4. Se connecter comme `test.member` → vérifier qu'il ne voit PAS le document
5. Se connecter comme `test.viewer` → vérifier qu'il ne voit PAS le document

### D. Test de la checklist

1. Se connecter comme `test.owner`
2. Modifier le statut d'un item (not_started → in_progress)
3. Se connecter comme `test.member` → vérifier lecture seule
4. Se connecter comme `test.heir` → vérifier pas d'accès

### E. Test du paiement (quand Stripe est activé)

1. Se connecter comme `test.owner`
2. Aller sur /pricing
3. Utiliser la carte test Stripe : `4242 4242 4242 4242`
4. Vérifier que le plan passe à Annual Family
5. Vérifier que les limites sont déverrouillées

## 4. Reset de l'environnement

Pour repartir de zéro (sans toucher aux données prod) :

```
scripts/reset-test-environment.sql
```

Puis relancer le seed :

```
scripts/seed-test-environment.sql
```

## 5. Règles de séparation test/prod

- ❌ Ne JAMAIS utiliser les comptes `@solexi.ai` de test en production
- ❌ Ne JAMAIS exécuter le reset sur la base de production
- ✅ Les comptes de test sont identifiables par leur email `test.*@solexi.ai`
- ✅ Le cercle de test est nommé "Cercle Test Solexi"
- ✅ Quand un environnement staging existera, les tests se feront là-bas exclusivement
