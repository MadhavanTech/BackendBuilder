import React from 'react'
import '../style/WorkflowPage.css'
import MaddyChatbot from './MaddyChatbot'

const API = () => {
  return (
    <div className='componentWithChat'>
      <div className='workflowPage'>
        <h3>API Configuration</h3>
        <p>Define the endpoints your backend should expose.</p>
      </div>
      <aside className='componentChat'>
        <MaddyChatbot conversationKey='api' />
      </aside>
    </div>
  )
}

export default API