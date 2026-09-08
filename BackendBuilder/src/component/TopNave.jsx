import React, { useContext } from 'react'
import '../style/TopNave.css'
import { Appcontext } from '../context/Backend'
import { Check } from 'lucide-react';

const TopNave = () => {
  const { steps } = useContext(Appcontext)
  const pages = ['Database', 'Tables', 'Columns', 'Connection', 'API', 'Backend']

  return (
    
    <nav className='topnav'>

        <section className='top'>

            <div className='save'>

                <h5>Save Progress</h5>

            </div>
            <div className='Email'>

                <h4>M</h4>

            </div>

        </section>

        <main className='pages'>
            {pages.map((page, index) => {
              const pageNumber = index + 1
              const status = pageNumber < steps ? 'completed' : pageNumber === steps ? 'active' : ''

              return (
                <div className={`part ${status}`} key={page}>
                    <div className='round'><h6>{pageNumber<steps? <Check size={14}/> : `${pageNumber}`}</h6></div>
                    <h6 className='text'>{page}</h6>
                </div>
              )
            })}
        </main>

    </nav>
  )
}

export default TopNave