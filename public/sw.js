self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url
  if (url) {
    event.waitUntil(clients.openWindow(url))
  }
})
