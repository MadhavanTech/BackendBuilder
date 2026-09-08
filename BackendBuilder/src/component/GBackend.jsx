import React from 'react'
import '../style/WorkflowPage.css'
import MaddyChatbot from './MaddyChatbot'

const GBackend = () => {
  return (
    <div className='componentWithChat'>
      <div className='workflowPage'>
        <h3>Backend Generation</h3>
        <p>Review your configuration and generate the backend.</p>
      </div>
      <aside className='componentChat'>
        <MaddyChatbot conversationKey='backend' />
      </aside>
    </div>
  )
}

export default GBackend