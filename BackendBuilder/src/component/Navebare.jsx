import React from 'react'
import { Zap, Home, FolderPlus, Folder, LayoutGrid, Settings, FileText, HelpCircle } from 'lucide-react'
import '../style/Nave.css'

const Navebare = () => {
  return (

    <nav>

        <section className='icon'>

           
           <div id='icon1'>
            <Zap size={30} />
           </div>
            
            <h2>BackendBuilder</h2>

        </section>

       <section className='options1'>

         <ul>
            
            <li><a href="#"> <Home size={25}/> Dashboard</a></li>
            <li><a href="#"><FolderPlus size={25} />  New Project</a></li>
            <li><a href="#"><Folder size={25}/>  Projects</a></li>
            <li><a href="#"><LayoutGrid size={25}/>  Templates</a></li>

        </ul>
       </section>

       <section id='boder' className='options1'>
        <ul>
            <li><a href="#"><Settings size={25}/>  Settings</a></li>
            <li><a href="#"> <FileText size={25}/>  Docs</a></li>
            <li><a href="#"> <HelpCircle size={25}/>  Support</a></li>
        </ul>
       </section>

    </nav>
  )
}

export default Navebare