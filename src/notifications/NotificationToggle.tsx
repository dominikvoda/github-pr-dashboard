import React, { useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationsEnabled,
  setNotificationsEnabled,
} from './notificationService'

export default function NotificationToggle() {
  const [permission, setPermission] = useState(getNotificationPermission())
  const [enabled, setEnabled] = useState(isNotificationsEnabled())

  if (!isNotificationSupported()) {
    return null
  }

  const handleClick = async () => {
    if (permission === 'default') {
      const result = await requestNotificationPermission()
      setPermission(result)
      if (result === 'granted') {
        setEnabled(true)
        setNotificationsEnabled(true)
      }
      return
    }

    if (permission === 'granted') {
      const next = !enabled
      setEnabled(next)
      setNotificationsEnabled(next)
      return
    }
  }

  const isActive = permission === 'granted' && enabled

  const tooltip =
    permission === 'denied'
      ? 'Notifications blocked — enable in browser settings'
      : permission === 'default'
        ? 'Enable notifications for new PRs'
        : enabled
          ? 'Notifications on (click to disable)'
          : 'Notifications off (click to enable)'

  return (
    <Tooltip title={tooltip}>
      <span>
        <IconButton
          onClick={handleClick}
          disabled={permission === 'denied'}
          sx={{ color: isActive ? '#4caf50' : '#999', mr: 1 }}
          size="small"
        >
          {isActive ? <NotificationsIcon /> : <NotificationsOffIcon />}
        </IconButton>
      </span>
    </Tooltip>
  )
}
