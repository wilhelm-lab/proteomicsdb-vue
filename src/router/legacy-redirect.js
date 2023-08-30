export default function legacyRedirect (to, from, next) {
  let fullPath = to.fullPath

  if (fullPath.startsWith('/proteomicsdb/')) {
    fullPath = fullPath.replace('/proteomicsdb/', '/')
  }

  if (fullPath.startsWith('/#')) {
    fullPath = fullPath.replace('/#', '/')
  }

  if (fullPath.startsWith('/vue/')) {
    fullPath = fullPath.replace('/vue/', '/')
  }

  if (fullPath !== to.fullPath) {
    // eslint-disable-next-line no-console
    console.log('Legacy redirect: ' + fullPath)
    next(fullPath)
  } else {
    next()
  }
}
