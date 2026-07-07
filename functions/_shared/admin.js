export const isAdmin = (request, env = {}) => {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  return Boolean(token && env.MUSIC_ADMIN_TOKEN && token === env.MUSIC_ADMIN_TOKEN)
}
