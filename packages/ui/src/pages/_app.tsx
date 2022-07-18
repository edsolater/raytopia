import NoSsr from '../components/NoSsr'

export default function Raytopia({ Component }) {
  return (
    <NoSsr>
      <Component />
    </NoSsr>
  )
}
