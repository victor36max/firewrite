import mixpanel from 'mixpanel-browser'
import { isDev } from '../utils'
import { LlmProvider } from './ai'
import { Theme } from '@renderer/types'

export const initTracking = () => {
  const mixpanelProjectToken = import.meta.env.RENDERER_VITE_MIXPANEL_PROJECT_TOKEN
  if (!mixpanelProjectToken) {
    console.log('Mixpanel project token is not set, opting out tracking')
    mixpanel.opt_out_tracking()
    return
  }

  mixpanel.init(mixpanelProjectToken, {
    autocapture: false,
    record_sessions_percent: 0,
    track_pageview: false,
    debug: isDev(),
    loaded: () => {
      trackEvent('app-opened')
      console.log('Mixpanel initialized')
    }
  })
}

type TrackEvents = {
  'app-opened': undefined
  'llm-added': {
    provider: LlmProvider
    model: string
  }
  'llm-removed': {
    provider: LlmProvider
    model: string
  }
  'llm-updated': {
    provider: LlmProvider
    model: string
  }
  'tool-added': {
    tool: 'web-search'
    provider: 'tavily'
  }
  'tool-removed': {
    tool: 'web-search'
    provider: 'tavily'
  }
  'note-created': undefined
  'note-deleted': undefined
  'improvement-triggered': undefined
  'improvement-accepted': undefined
  'chat-message-sent': undefined
  'autocomplete-triggered': undefined
  'autocomplete-accepted': undefined
  'theme-updated': {
    theme: Theme
  }
}

type TrackEventNames = keyof TrackEvents

export const trackEvent = <T extends TrackEventNames>(event: T, properties?: TrackEvents[T]) => {
  if (mixpanel.has_opted_out_tracking()) return
  mixpanel.track(event, properties)
}

// TODO: Add a way to toggle tracking in the settings
export const toggleTracking = () => {
  if (mixpanel.has_opted_out_tracking()) {
    mixpanel.opt_in_tracking()
  } else {
    mixpanel.opt_out_tracking()
  }
}
