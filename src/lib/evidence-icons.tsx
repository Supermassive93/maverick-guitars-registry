import {
  IconQuote,
  IconPhoto,
  IconDatabase,
  IconUserCheck,
  IconReceipt,
  IconBulb,
  IconGitBranch,
  IconQuestionMark,
  IconBook,
  IconCamera,
  IconBuildingBank,
  type Icon,
} from '@tabler/icons-react'

// Maps evidence_types.icon (a Tabler icon slug) to its component.
const ICONS: Record<string, Icon> = {
  quote: IconQuote,
  photo: IconPhoto,
  database: IconDatabase,
  'user-check': IconUserCheck,
  receipt: IconReceipt,
  bulb: IconBulb,
  'git-branch': IconGitBranch,
  'question-mark': IconQuestionMark,
  book: IconBook,
  camera: IconCamera,
  'building-bank': IconBuildingBank,
}

export function EvidenceIcon({ name, size = 11 }: { name: string; size?: number }) {
  const Cmp = ICONS[name] ?? IconQuestionMark
  return <Cmp size={size} stroke={2} />
}
