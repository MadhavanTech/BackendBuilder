import React from 'react'
import { ArrowUpRight, BookOpen, Braces, Database, Download, FileText, GitBranch, Table2 } from 'lucide-react'
import '../style/NavigationPages.css'

const guides = [
  { icon: Database, title: 'Database setup', text: 'Connect a database and save its credentials securely.' },
  { icon: Table2, title: 'Tables and columns', text: 'Define your schema, data types, lengths, and constraints.' },
  { icon: GitBranch, title: 'Relationships', text: 'Link tables with parent and child columns.' },
  { icon: Braces, title: 'API generation', text: 'Configure routes and generate your backend project.' },
]

export function Docs() {
  return (
  <section className='navigationPage docsPage'>
    <div className='docsHeader'>
      <div>
        <span className='navigationEyebrow'>Guides & resources</span>
        <h1>Documentation</h1>
        <p>Everything you need to move from a database connection to a generated backend.</p>
      </div>
      <div className='docsHeaderIcon'><BookOpen size={25} /></div>
    </div>

    <div className='docsGuideGrid'>
      {guides.map(({ icon: Icon, title, text }) => (
        <article className='docsGuide' key={title}>
          <div className='docsGuideIcon'><Icon size={19} /></div>
          <div><h2>{title}</h2><p>{text}</p></div>
          <ArrowUpRight className='docsGuideArrow' size={17} />
        </article>
      ))}
    </div>

    <section className='docsDownloads'>
      <div className='docsSectionTitle'>
        <div><span className='navigationEyebrow'>Downloads</span><h2>Available documents</h2></div>
        <Download size={20} />
      </div>
      <div className='docsDownloadEmpty'>
        <FileText size={20} />
        <div><strong>No documents available yet</strong><span>Downloadable guides and API references will appear here when published.</span></div>
      </div>
    </section>
  </section>
  )
}
