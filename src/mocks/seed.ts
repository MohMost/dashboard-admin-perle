import type { AdminUser, Member, ContentItem, ActivityItem } from '@/types'

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: '1',
    email: 'superadmin@perledelys.fr',
    firstName: 'Sophie',
    lastName: 'Martin',
    role: 'super_admin',
    status: 'active',
    avatar: undefined,
    lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    email: 'admin@perledelys.fr',
    firstName: 'Marie',
    lastName: 'Dubois',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: '3',
    email: 'editor@perledelys.fr',
    firstName: 'Camille',
    lastName: 'Bernard',
    role: 'editor',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
  },
  {
    id: '4',
    email: 'moderator@perledelys.fr',
    firstName: 'Léa',
    lastName: 'Petit',
    role: 'moderator',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-04-05T10:00:00Z',
  },
  {
    id: '5',
    email: 'suspended@perledelys.fr',
    firstName: 'Julie',
    lastName: 'Moreau',
    role: 'editor',
    status: 'suspended',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
]

const firstNames = ['Emma', 'Chloé', 'Alice', 'Manon', 'Lucie', 'Sarah', 'Jade', 'Inès', 'Léa', 'Clara', 'Elisa', 'Anaïs', 'Laura', 'Mathilde', 'Charlotte']
const lastNames = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia']
const tags = ['VIP', 'Premium', 'Standard', 'Trial', 'Newsletter', 'Ambassador']
const statuses: Member['status'][] = ['active', 'active', 'active', 'pending', 'suspended', 'expired']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomTags(): string[] {
  const count = Math.floor(Math.random() * 3)
  const shuffled = [...tags].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const MOCK_MEMBERS: Member[] = Array.from({ length: 80 }, (_, i) => {
  const firstName = randomFrom(firstNames)
  const lastName = randomFrom(lastNames)
  const status = randomFrom(statuses)
  const createdAt = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString()
  return {
    id: `m${i + 1}`,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
    firstName,
    lastName,
    phone: `+33 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
    status,
    accessCode: generateCode(),
    accessCodeExpiresAt: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
    accessCodeSentAt: createdAt,
    tags: randomTags(),
    notes: i % 5 === 0 ? 'Cliente fidèle depuis le début.' : undefined,
    createdAt,
    updatedAt: createdAt,
  }
})

const contentTitles = [
  'Guide ultime du bien-être au quotidien',
  'Les secrets de beauté de Perle de Lys',
  'Routine matinale pour une peau parfaite',
  'Nutrition et éclat : ce que vous devez savoir',
  '10 exercices fitness pour rester en forme',
  'Tendances mode automne-hiver',
  'Meditation guidée pour débutantes',
  'Recettes healthy et gourmandes',
  'Soins capillaires : les meilleures pratiques',
  'Interview exclusive : secrets de star',
  'Les indispensables de la trousse beauté',
  'Yoga matinal : 20 minutes pour bien commencer',
  'Skincare : routine jour et nuit complète',
  'Mode durable : bien s\'habiller responsable',
  'Bien dormir : conseils et astuces',
]

export const MOCK_CONTENT: ContentItem[] = contentTitles.map((title, i) => {
  const types: ContentItem['type'][] = ['article', 'video', 'audio', 'article', 'article']
  const statuses: ContentItem['status'][] = ['published', 'published', 'draft', 'published', 'archived']
  const categories = ['Bien-être', 'Beauté', 'Lifestyle', 'Nutrition', 'Fitness', 'Mode']
  const createdAt = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180).toISOString()
  const status = randomFrom(statuses)
  return {
    id: `c${i + 1}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    type: randomFrom(types),
    status,
    excerpt: `Découvrez ${title.toLowerCase()} avec nos expertes...`,
    body: `<p>Contenu complet de l'article "${title}"...</p>`,
    categories: [randomFrom(categories)],
    tags: randomTags(),
    author: 'Sophie Martin',
    authorId: '1',
    publishedAt: status === 'published' ? createdAt : undefined,
    views: Math.floor(Math.random() * 5000),
    createdAt,
    updatedAt: createdAt,
  }
})

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    type: 'member_joined',
    description: 'Nouvelle membre inscrite',
    actorName: 'Système',
    targetName: 'Emma Dupont',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'a2',
    type: 'content_published',
    description: 'Nouveau contenu publié',
    actorName: 'Camille Bernard',
    targetName: 'Guide ultime du bien-être',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'a3',
    type: 'code_generated',
    description: 'Code d\'accès régénéré',
    actorName: 'Marie Dubois',
    targetName: 'Chloé Martin',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'a4',
    type: 'user_created',
    description: 'Nouvel utilisateur admin créé',
    actorName: 'Sophie Martin',
    targetName: 'Léa Petit',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'a5',
    type: 'member_suspended',
    description: 'Membre suspendue',
    actorName: 'Marie Dubois',
    targetName: 'Julie Moreau',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'a6',
    type: 'content_published',
    description: 'Article programmé publié',
    actorName: 'Système',
    targetName: 'Routine matinale pour une peau parfaite',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
]
