import React, { createContext, useState } from 'react'

const Appcontext = createContext();

const Backend = ({ children }) => {

    const [Databases, setDatabases] = useState([]);
    const [Defitions , setDefitions] = useState([]);
    const [steps , setSteps] = useState(1);
    const [LoginStatus, setLoginStatus] = useState(false);
    const [NumberofTables, setNumberofTables] = useState(0);
    const [TableNames, setTableNames] = useState([]);
    const [Tables, setTables] = useState([]);
    const [chatMessages, setChatMessages] = useState({});
    const [Tableconstains , setTableconstains] = useState([]);
    

    class Table {

        TableNames = '';
        colamnsname = [];
        Datatype = [];
        Length = [];
        Constraints = [];

        constructor(TableNames) {
            this.TableNames = TableNames
        }

        addColumns(name, datatype, length, constraints) {
            this.colamnsname.push(name);
            this.Datatype.push(datatype);
            this.Length.push(length);
            this.Constraints.push(constraints);
        }

        addfully(colamnsname , Datatype , Length , Constraints){
            this.colamnsname = colamnsname;
            this.Datatype = Datatype;
            this.Length = Length;
            this.Constraints = Constraints;
        }

        
    }

    class Database {

        DBname = '';
        Username = '';
        Password = '';
        DBurl = '';
        type = '';
        Tables = [];
        DBconnection = [];

        constructor (DBname , Username , DBpassword , DBurl , type) {

            this.DBname =DBname;
            this.Username = Username ;
            this.Password = DBpassword; 
            this.DBurl = DBurl;
            this.type = type;

        }

        setTable (Table) {

            this.Tables.push(Table)
        }

        setAllTables(Tables) {

            this.Tables = Tables;
        }

        setConection(DBconnection) {
            this.DBconnection.push(DBconnection) 
        }

        setAllConnection(DBconnection) {
            this.DBconnection = DBconnection;
        }

    }

    class TableConnections {

        ParentTable = '';
        ChildTable = '';
        ParentRelation = '';
        childRelation = '';

    constructor(ParentTable , ChildTable , ParentRelation , childRelation){

        this.ParentTable = ParentTable;
        this.ChildTable = ChildTable;
        this.ParentRelation = ParentRelation;
        this.childRelation = childRelation;
    }
        
    }

    const PreventTablename = () => {

    }


    return (
        <Appcontext.Provider 
        value={{ Databases, setDatabases, LoginStatus, setLoginStatus, NumberofTables, setNumberofTables,Defitions, setDefitions , TableNames, setTableNames, steps, setSteps , Tables, setTables , Table , Database, chatMessagesByScope: chatMessages, setChatMessagesByScope: setChatMessages , PreventTablename, TableConnections}}>
            {children}
        </Appcontext.Provider>
    )
}

export { Appcontext }
export default Backend