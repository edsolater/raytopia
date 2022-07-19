import { createICSS } from '@edsolater/uikit'
export const icssPointerEventsNoneDeep = createICSS({
  pointerEvents: 'none',
  '*': {
    pointerEvents: 'none'
  }
})
