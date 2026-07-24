import type { ContentCollection, ContentRecord } from '@/services/content.service'

// Field kinds the generic content form knows how to render/parse.
//  - imageUrl      : text input for a hosted image URL (upload comes later)
//  - linesList     : textarea, one item per line  <->  string[]
//  - keyValueLines : textarea, "label | valeur" per line  <->  {label,qty}[]
export type FieldType =
  | 'text'
  | 'textarea'
  | 'imageUrl'
  | 'number'
  | 'boolean'
  | 'select'
  | 'category'
  | 'linesList'
  | 'keyValueLines'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  options?: { value: string; label: string }[]
  placeholder?: string
  // For type 'category': the category namespace on the backend (recipe/video/…).
  scope?: string
}

export interface CollectionDef {
  key: ContentCollection
  label: string // tab label
  singular: string // e.g. "recette"
  columns: { header: string; accessor: (item: ContentRecord) => string }[]
  fields: FieldDef[]
}

const str = (v: unknown) => (v == null ? '' : String(v))

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'recipes',
    label: 'Recettes',
    singular: 'recette',
    columns: [
      { header: 'Titre', accessor: (r) => str(r.title) },
      { header: 'Catégorie', accessor: (r) => str(r.category) },
      { header: 'Difficulté', accessor: (r) => str(r.difficulty) },
      { header: 'Temps', accessor: (r) => str(r.time) },
    ],
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'image', label: 'Image', type: 'imageUrl' },
      { name: 'category', label: 'Catégorie', type: 'category', scope: 'recipe' },
      {
        name: 'difficulty',
        label: 'Difficulté',
        type: 'select',
        options: [
          { value: 'Facile', label: 'Facile' },
          { value: 'Moyen', label: 'Moyen' },
          { value: 'Avancé', label: 'Avancé' },
        ],
      },
      { name: 'time', label: 'Temps de préparation', type: 'text', placeholder: '1h30' },
      { name: 'portions', label: 'Portions', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'cookidooUrl', label: 'Lien Cookidoo', type: 'text' },
      {
        name: 'vimeoUrl',
        label: 'Lien Vimeo (vidéo de la recette)',
        type: 'text',
        placeholder: 'https://vimeo.com/17433286?h=6bcdf4c934',
      },
      { name: 'isNew', label: 'Marquer comme nouveau', type: 'boolean' },
      {
        name: 'ingredients',
        label: 'Ingrédients (une ligne par ingrédient : « nom | quantité »)',
        type: 'keyValueLines',
        placeholder: 'Semoule moyenne | 500 g',
      },
      {
        name: 'steps',
        label: 'Étapes (une étape par ligne)',
        type: 'linesList',
      },
    ],
  },
  {
    key: 'videos',
    label: 'Vidéos',
    singular: 'vidéo',
    columns: [
      { header: 'Titre', accessor: (r) => str(r.title) },
      { header: 'Catégorie', accessor: (r) => str(r.category) },
      { header: 'Durée', accessor: (r) => str(r.duration) },
    ],
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'image', label: 'Miniature', type: 'imageUrl' },
      { name: 'category', label: 'Catégorie', type: 'category', scope: 'video' },
      { name: 'duration', label: 'Durée', type: 'text', placeholder: '18:42' },
      {
        name: 'vimeoUrl',
        label: 'Lien Vimeo',
        type: 'text',
        placeholder: 'https://vimeo.com/17433286?h=6bcdf4c934',
      },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'articles',
    label: 'Articles',
    singular: 'article',
    columns: [
      { header: 'Titre', accessor: (r) => str(r.title) },
      { header: 'Catégorie', accessor: (r) => str(r.category) },
      { header: 'Lecture', accessor: (r) => str(r.readTime) },
    ],
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'image', label: 'Image', type: 'imageUrl' },
      { name: 'category', label: 'Catégorie', type: 'category', scope: 'article' },
      { name: 'readTime', label: 'Temps de lecture', type: 'text', placeholder: '4 min' },
      { name: 'excerpt', label: 'Extrait', type: 'textarea' },
    ],
  },
  {
    key: 'lives',
    label: 'Lives',
    singular: 'live',
    columns: [
      { header: 'Titre', accessor: (r) => str(r.title) },
      { header: 'Date', accessor: (r) => str(r.date) },
      { header: 'Statut', accessor: (r) => str(r.status) },
      { header: 'Plateforme', accessor: (r) => str(r.platform) },
    ],
    fields: [
      { name: 'title', label: 'Titre', type: 'text' },
      { name: 'image', label: 'Image', type: 'imageUrl' },
      { name: 'date', label: 'Date', type: 'text', placeholder: '2026-08-01' },
      { name: 'time', label: 'Heure', type: 'text', placeholder: '19:30' },
      {
        name: 'status',
        label: 'Statut',
        type: 'select',
        options: [
          { value: 'À venir', label: 'À venir' },
          { value: 'En direct', label: 'En direct' },
          { value: 'Replay', label: 'Replay' },
        ],
      },
      { name: 'platform', label: 'Plateforme', type: 'text', placeholder: 'Instagram Live' },
      {
        name: 'vimeoUrl',
        label: 'Lien Vimeo (live / replay)',
        type: 'text',
        placeholder: 'https://vimeo.com/17433286?h=6bcdf4c934',
      },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'faq',
    label: 'FAQ',
    singular: 'question',
    columns: [
      { header: 'Question', accessor: (r) => str(r.q) },
      { header: 'Ordre', accessor: (r) => str(r.order) },
    ],
    fields: [
      { name: 'q', label: 'Question', type: 'text' },
      { name: 'a', label: 'Réponse', type: 'textarea' },
      { name: 'order', label: 'Ordre d\'affichage', type: 'number' },
    ],
  },
]

// Events live on their own top-level "Événements" page (WIRING_PLAN B2/D4),
// not in the Content tabs. Events of type "live" are auto-created/kept in sync
// by the backend when a Live is saved (they carry a liveId); admins can also
// add any event here. `remindMinutesBefore` drives the app's push reminder.
export const EVENTS_DEF: CollectionDef = {
  key: 'events',
  label: 'Événements',
  singular: 'événement',
  columns: [
    { header: 'Titre', accessor: (r) => str(r.title) },
    { header: 'Date', accessor: (r) => str(r.date) },
    { header: 'Heure', accessor: (r) => str(r.time) },
    { header: 'Type', accessor: (r) => str(r.type) },
    { header: 'Rappel', accessor: (r) => (r.remindMinutesBefore != null ? `${String(r.remindMinutesBefore)} min avant` : '—') },
  ],
  fields: [
    { name: 'title', label: 'Titre', type: 'text' },
    { name: 'date', label: 'Date', type: 'text', placeholder: '2026-08-01' },
    { name: 'time', label: 'Heure', type: 'text', placeholder: '20:00' },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'live', label: 'Live' },
        { value: 'atelier', label: 'Atelier' },
        { value: 'publication', label: 'Publication' },
        { value: 'rappel', label: 'Rappel' },
      ],
    },
    {
      name: 'remindMinutesBefore',
      label: "Rappel — minutes avant l'événement (0 = à l'heure pile)",
      type: 'number',
    },
    {
      name: 'vimeoUrl',
      label: 'Lien du live (Vimeo)',
      type: 'text',
      placeholder: 'https://vimeo.com/17433286?h=6bcdf4c934',
    },
    { name: 'description', label: 'Description (optionnel)', type: 'textarea' },
  ],
}
