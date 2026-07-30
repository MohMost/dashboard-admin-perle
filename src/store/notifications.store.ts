import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tracks how many pending items the admin has already acknowledged, so the bell
// badge only highlights NEW pending reviews/members. `unread = max(0, total -
// seen)`; "marquer comme lu" sets seen = current total.
interface NotificationsStore {
  seen: number
  markSeen: (total: number) => void
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      seen: 0,
      markSeen: (total) => set({ seen: total }),
    }),
    { name: 'notifications-seen' },
  ),
)
