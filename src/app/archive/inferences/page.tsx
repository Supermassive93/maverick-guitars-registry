import { redirect } from 'next/navigation'

// Recorded Inferences now live inside the Archive page (#inferences). This route stays so
// any old links to /archive/inferences keep working.
export default function InferencesRedirect() {
  redirect('/archive#inferences')
}
