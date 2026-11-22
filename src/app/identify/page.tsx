import { redirect } from 'next/navigation'

// The Generation Guide section was removed from the models page
export default function IdentifyRedirect() {
  redirect('/models')
}
