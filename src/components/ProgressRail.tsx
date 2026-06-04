interface SectionItem {
  id: string
  label: string
}

interface Props {
  activeSection: string
  sections: SectionItem[]
}

const ProgressRail = ({ activeSection, sections }: Props) => {
  return (
    <aside className="progress-rail" aria-label="页面进度">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`progress-dot ${activeSection === section.id ? 'active' : ''}`}
          aria-label={section.label}
        />
      ))}
    </aside>
  )
}

export default ProgressRail
