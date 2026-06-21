import type { ReactNode } from 'react'

interface Props {
  name?: string
  className?: string
}

const iconPaths: Record<string, ReactNode> = {
  add: <path d="M12 5v14M5 12h14" />,
  account_tree: <path d="M6 5h5v5H6zM13 14h5v5h-5zM6 14h5v5H6zM11 7.5h2.5v9H13M13.5 16.5H11" />,
  article: <path d="M7 4h10l3 3v13H7zM16 4v4h4M10 11h7M10 15h7" />,
  arrow_downward: <path d="M12 4v14M6 12l6 6 6-6" />,
  auto_awesome: <path d="M12 3l1.4 4.2L17 9l-3.6 1.8L12 15l-1.4-4.2L7 9l3.6-1.8zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8zM19 13l.7 1.8L22 16l-2.3 1.2L19 19l-.7-1.8L16 16l2.3-1.2z" />,
  bookmark: <path d="M7 4h10v16l-5-3-5 3z" />,
  bookmark_add: <path d="M7 4h10v16l-5-3-5 3zM12 7v6M9 10h6" />,
  bar_chart: <path d="M5 20V10h3v10M11 20V5h3v15M17 20v-7h3v7M4 20h17" />,
  bolt: <path d="M13 2L4 14h7l-1 8 10-13h-7z" />,
  music_note: <path d="M9 18a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17 16V5l-8 2v11" />,
  check: <path d="M5 12.5l4 4L19 6.5" />,
  chevron_left: <path d="M15 6l-6 6 6 6" />,
  chevron_right: <path d="M9 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  cloud: <path d="M7 18h11a4 4 0 0 0 .7-7.9A6 6 0 0 0 7.4 8.5 4.5 4.5 0 0 0 7 18z" />,
  code: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
  content_copy: <path d="M8 8h10v12H8zM5 16V4h10" />,
  data_object: <path d="M8 7H6a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h2M16 7h2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-2M10 9l-2 3 2 3M14 9l2 3-2 3" />,
  delete: <path d="M5 7h14M10 11v6M14 11v6M7 7l1 14h8l1-14M9 7V4h6v3" />,
  fingerprint: <path d="M12 11a3 3 0 0 1 3 3c0 2-1 3-1 5M9 14a3 3 0 0 1 6-2M7 18c1-2 1-3 1-4a4 4 0 0 1 8 0M5 15a7 7 0 0 1 14 0M8 5a9 9 0 0 1 8 0" />,
  link: <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />,
  leaderboard: <path d="M4 20V9h4v11M10 20V4h4v16M16 20v-7h4v7M3 20h18" />,
  mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  more_horiz: <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="2" />,
  mic: <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v4M9 22h6" />,
  moon: <path d="M19 15.5A8 8 0 0 1 10.5 5 7 7 0 1 0 19 15.5z" />,
  package_2: <path d="M4 8l8-4 8 4v9l-8 4-8-4zM4 8l8 4 8-4M12 12v9" />,
  pause: <path d="M6 4h4v16H6zM14 4h4v16h-4z" />,
  play_arrow: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  rate_review: <path d="M5 5h14v10H9l-4 4zM9 9h6M9 12h4" />,
  schedule: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l4 2" />,
  search: <path d="M10.5 18a7.5 7.5 0 1 1 5.3-2.2L21 21" />,
  volume_down: <path d="M5 10v4h4l5 4V6l-5 4H5zM15 10a3 3 0 0 1 0 4" />,
  skip_next: <path d="M7 6v12l8-6zM17 6v12h-2V6z" />,
  skip_previous: <path d="M17 6v12l-8-6 8-6zM7 6v12h2V6z" />,
  smart_display: <path d="M4 7h16v10H4zM10 9.5v5l5-2.5z" />,
  south: <path d="M12 4v16M6 14l6 6 6-6" />,
  sports_score: <path d="M6 21V4M6 5h11l-2 4 2 4H6" />,
  swap_horiz: <path d="M7 7h12l-3-3M19 7l-3 3M17 17H5l3-3M5 17l3 3" />,
  task_alt: <path d="M5 12l4 4L19 6M12 21a9 9 0 1 1 6.5-15.2" />,
  terminal: <path d="M4 6h16v12H4zM7 10l3 2-3 2M12 15h5" />,
  travel_explore: <path d="M10 20a8 8 0 1 1 5.6-13.7M4 12h16M12 4a12 12 0 0 0 0 16M17 17l4 4M18 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
}

const aliases: Record<string, string> = {
  dark_mode: 'moon',
  light_mode: 'auto_awesome',
  folder: 'bookmark',
  hub: 'link',
  extension: 'package_2',
  construction: 'terminal',
}

const Icon = ({ name = 'link', className = '' }: Props) => {
  const iconName = aliases[name] ?? name
  const path = iconPaths[iconName] ?? iconPaths.link

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      className={`inline-block h-[1em] w-[1em] shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  )
}

export default Icon
