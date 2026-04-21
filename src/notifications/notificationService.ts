export function isNotificationSupported(): boolean {
  return 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.requestPermission()
}

export function isNotificationsEnabled(): boolean {
  return localStorage.getItem('notificationsEnabled') !== 'false'
}

export function setNotificationsEnabled(enabled: boolean): void {
  localStorage.setItem('notificationsEnabled', String(enabled))
}

export async function showPrNotification(row: { title: string; author: string; repository: string; link: string; number: number }): Promise<void> {
  const permission = getNotificationPermission()
  const enabled = isNotificationsEnabled()

  if (permission !== 'granted' || !enabled) {
    console.log('[Notifications] Skipped — permission:', permission, 'enabled:', enabled)
    return
  }

  const tag = `${row.repository}/${row.number}`
  const options: NotificationOptions = {
    body: `${row.author} — ${row.repository}`,
    tag,
    icon: '/favicon.ico',
    data: { url: row.link },
  }

  console.log('[Notifications] Showing notification for:', tag, row.title)

  // Prefer service worker notifications (work reliably in background tabs)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(row.title, options)
      console.log('[Notifications] Shown via service worker')
      return
    } catch (e) {
      console.warn('[Notifications] SW notification failed, falling back:', e)
    }
  }

  const notification = new Notification(row.title, options)
  notification.onclick = () => {
    window.open(row.link)
    notification.close()
  }
  console.log('[Notifications] Shown via Notification API')
}
