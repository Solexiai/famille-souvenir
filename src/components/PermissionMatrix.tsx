/**
 * Matrice de permissions — Solexi.ai Famille
 * 
 * Ce fichier centralise la logique de permissions côté client.
 * Les véritables contrôles sont appliqués par les RLS policies côté base de données.
 * Ce module sert au masquage UI et à la cohérence de l'affichage.
 */

import type { AppRole } from '@/types/database';

type Permission =
  | 'documents.read'
  | 'documents.create'
  | 'documents.edit'
  | 'checklist.read'
  | 'checklist.edit'
  | 'governance.read'
  | 'governance.edit'
  | 'executor.read'
  | 'executor.notes.create'
  | 'memories.read'
  | 'memories.create'
  | 'members.manage'
  | 'circle.edit'
  | 'documentary_status.edit'
  | 'vault.read';

const matrix: Record<AppRole, Permission[]> = {
  owner: [
    'documents.read', 'documents.create', 'documents.edit',
    'checklist.read', 'checklist.edit',
    'governance.read', 'governance.edit',
    'executor.read', 'executor.notes.create',
    'memories.read', 'memories.create',
    'members.manage', 'circle.edit', 'documentary_status.edit',
    'vault.read',
  ],
  family_manager: [
    'documents.read', 'documents.create', 'documents.edit',
    'checklist.read', 'checklist.edit',
    'governance.read', 'governance.edit',
    'executor.read', 'executor.notes.create',
    'memories.read', 'memories.create',
    'members.manage', 'documentary_status.edit',
    'vault.read',
  ],
  family_member: [
    'documents.read',
    'governance.read',
    'memories.read', 'memories.create',
    'vault.read',
  ],
  heir: [
    'documents.read', // only heir-visible docs (enforced by RLS)
    'memories.read',
  ],
  proposed_executor: [
    'documents.read', // only executor_workspace docs (enforced by RLS)
    'checklist.read',
    'executor.read', 'executor.notes.create',
    'memories.read',
  ],
  verified_executor: [
    'documents.read',
    'checklist.read',
    'executor.read', 'executor.notes.create',
    'memories.read',
  ],
};

export function hasPermission(role: AppRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return matrix[role]?.includes(permission) ?? false;
}

export function canEditDocumentaryStatus(role: AppRole | null | undefined): boolean {
  return hasPermission(role, 'documentary_status.edit');
}

/**
 * Résumé des permissions effectives par rôle (en français)
 */
export const permissionSummaryFr: Record<AppRole, string> = {
  owner: 'Contrôle total du cercle : gestion des membres, documents, checklist, gouvernance, statuts documentaires, espace exécuteur.',
  family_manager: 'Gestion des documents, checklist, gouvernance et membres. Peut proposer un exécuteur. Ne peut pas modifier les paramètres du cercle.',
  family_member: 'Consultation des documents partagés et de la gouvernance. Peut contribuer aux souvenirs. Accès limité en modification.',
  heir: 'Accès uniquement aux documents explicitement partagés avec les héritiers. Pas d\'accès automatique au dossier complet.',
  proposed_executor: 'Accès à l\'espace de préparation exécuteur et aux documents associés. Aucun privilège juridique accordé automatiquement.',
  verified_executor: 'Accès aux documents vérifiés et à l\'espace exécuteur. Accès contrôlé et audité. Ne remplace pas la reconnaissance légale officielle.',
};
