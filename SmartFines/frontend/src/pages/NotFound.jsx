import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Page not found</h1>
        <p className="auth-subtitle">The page you are looking for does not exist.</p>
        <Link to="/" className="link-button">Back to home</Link>
      </div>
    </div>
  )
}

export default NotFound
