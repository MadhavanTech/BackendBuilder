
import { Children, useContext } from "react";
import Home from "../pages/Home";
import { Appcontext } from "../context/Backend";
import login from "../pages/login"
import sin from "../pages/sin"
import Sing_Page from "../pages/Sing_Page";
import Login_Page from "../pages/Login_Page";

const {LoginStatus , setLoginStatus} = useContext(Appcontext)

const routings = ([

    {
        path: '/',
        element: LoginStatus ?<Sing_Page/>: <Login_Page/>,
        Children: [

            {
                path: LoginStatus ?'/login' : '/Home',
                element:LoginStatus ?<Login_Page/> : <Home/>
            },

            LoginStatus ? {} : {

                path: '/sing',
                element:<Sing_Page/>
            }
        ]
    }
])