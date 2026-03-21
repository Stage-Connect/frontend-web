const ROLE_LABELS: Record<string, string> = {
  ADMIN_PLATFORM: 'Administrateur plateforme',
  OPS_ADMIN: 'Administrateur opérations',
  COMPANY_RECRUITER: 'Recruteur entreprise',
  STUDENT: 'Étudiant'
};

const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  PENDING_VERIFICATION: 'En attente de vérification',
  VERIFIED: 'Vérifiée',
  REJECTED: 'Rejetée',
  IN_REVIEW: 'En cours de revue'
};

const RCCM_STATUS_LABELS: Record<string, string> = {
  NOT_PROVIDED: 'Non fourni',
  MISSING: 'Manquant',
  PENDING: 'En attente',
  RECEIVED: 'Reçu',
  VERIFIED: 'Vérifié',
  REJECTED: 'Rejeté'
};

const REPORT_REASON_LABELS: Record<string, string> = {
  POLICY_VIOLATION: 'Violation de politique',
  INAPPROPRIATE_CONTENT: 'Contenu inapproprié',
  SPAM: 'Spam',
  FRAUD_SUSPECTED: 'Fraude suspectée',
  ABUSE: 'Abus',
  OTHER: 'Autre'
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  CRITICAL: 'Critique',
  URGENT: 'Urgente'
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Ouvert',
  CLOSED: 'Clos',
  PENDING: 'En attente',
  RESOLVED: 'Résolu',
  REJECTED: 'Rejeté',
  ESCALATED: 'Escaladé',
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publiée',
  ARCHIVED: 'Archivée',
  SUSPENDED: 'Suspendue',
  OFF_SUSPENDED: 'Suspendue',
  OFFER_SUSPENDED: 'Suspendue',
  'OFF-SUSPENDED': 'Suspendue'
};

const SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyenne',
  HIGH: 'Élevée',
  CRITICAL: 'Critique'
};

const RESOURCE_KIND_LABELS: Record<string, string> = {
  STATUS_REFERENTIAL: 'Référentiel de statuts',
  STATUS: 'Statut',
  SKILL_REFERENTIAL: 'Référentiel de compétences',
  SECTOR: 'Secteur',
  FILIERE: 'Filière',
  COMPETENCE: 'Compétence'
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  CREATED: 'Création',
  UPDATED: 'Mise à jour',
  ACTIVATE: 'Activation',
  DEACTIVATE: 'Désactivation',
  LOGIN_SUCCEEDED: 'Connexion réussie',
  LOGIN_FAILED: 'Échec de connexion',
  LOGOUT_SUCCEEDED: 'Déconnexion réussie'
};

const SOURCE_KIND_LABELS: Record<string, string> = {
  AUTH_AUDIT: 'Journal d’authentification',
  COMPANY_PROFILE_AUDIT: 'Journal entreprise',
  CRITICAL_INCIDENT: 'Incident critique'
};

const INTERNAL_ROLE_LABELS: Record<string, string> = {
  OWNER: 'Propriétaire',
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
  RECRUITER: 'Recruteur'
};

const MEMBERSHIP_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  INVITED: 'Invité',
  PENDING: 'En attente',
  SUSPENDED: 'Suspendu'
};

const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Publique',
  PRIVATE: 'Privée',
  INTERNAL: 'Interne'
};

const ACTION_CODE_LABELS: Record<string, string> = {
  CLOSE: 'Clore',
  ESCALATE: 'Escalader',
  REJECT: 'Rejeter',
  APPROVE: 'Approuver'
};

function prettifyCode(value: string | null | undefined): string {
  if (!value) {
    return 'Non renseigné';
  }

  return value
    .replace(/[-_]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function translate(value: string | null | undefined, map: Record<string, string>): string {
  if (!value) {
    return 'Non renseigné';
  }

  return map[value] ?? prettifyCode(value);
}

export const backendLabels = {
  role: (value: string | null | undefined) => translate(value, ROLE_LABELS),
  verificationStatus: (value: string | null | undefined) => translate(value, VERIFICATION_STATUS_LABELS),
  rccmStatus: (value: string | null | undefined) => translate(value, RCCM_STATUS_LABELS),
  reasonCode: (value: string | null | undefined) => translate(value, REPORT_REASON_LABELS),
  priority: (value: string | null | undefined) => translate(value, PRIORITY_LABELS),
  status: (value: string | null | undefined) => translate(value, STATUS_LABELS),
  severity: (value: string | null | undefined) => translate(value, SEVERITY_LABELS),
  resourceKind: (value: string | null | undefined) => translate(value, RESOURCE_KIND_LABELS),
  eventType: (value: string | null | undefined) => translate(value, EVENT_TYPE_LABELS),
  sourceKind: (value: string | null | undefined) => translate(value, SOURCE_KIND_LABELS),
  internalRole: (value: string | null | undefined) => translate(value, INTERNAL_ROLE_LABELS),
  membershipStatus: (value: string | null | undefined) => translate(value, MEMBERSHIP_STATUS_LABELS),
  visibility: (value: string | null | undefined) => translate(value, VISIBILITY_LABELS),
  actionCode: (value: string | null | undefined) => translate(value, ACTION_CODE_LABELS),
  prettify: prettifyCode
};
