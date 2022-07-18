import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

type NoSSRProps = {
  children: ReactNode | JSX.Element
}

function NoSSR(props: NoSSRProps) {
  return <>{props.children}</>
}

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false
}) as (props: NoSSRProps) => JSX.Element
