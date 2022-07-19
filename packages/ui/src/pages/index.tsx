import { Div } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import { tokenAtom } from 'raytopia-sail'
import { useEffect } from 'react'
import CoinInputBox from '../components/CoinInputBox'

export default function SwapPage() {
  const { tokens } = useXStore(tokenAtom)
  useEffect(() => {
    console.log('tokens: ', tokens)
  }, [tokens])
  return (
    <Div icss={{ width: '100vw', height: '100vh' }}>
      <Div icss={{ background: 'white', padding: 16, boxShadow: '0 0 4px black' }}>
        <CoinInputBox />
      </Div>
    </Div>
  )
}
