import NoSsr from '../components/NoSsr'
import '../styles/initialize.css'

export default function Raytopia({ Component }) {
  return (
    <NoSsr>
      <Component />
    </NoSsr>
  )
}
