export const PRERELEASE = process.env.NEXT_PUBLIC_PRERELEASE !== 'false'

// True only while running `next dev` on a local machine. Any deployment (Vercel production or
// preview) is a production build, so this is false there. Used to keep pages that are closed on
// the live site — via the site_settings switches — open while developing locally.
export const IS_LOCAL_DEV = process.env.NODE_ENV === 'development'
