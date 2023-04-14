import { getClientOAUTHDataByIDMySQL,createClientOAUTHDataMySql } from "../data/index.js"

let createClientOAUTHData=async({sessID,clientID,clientSecret,redirectURIs})=>{
   return await createClientOAUTHDataMySql({sessID,clientID,clientSecret,redirectURIs})
}
let getClientOAUTHDataByID=async(clientID)=>{
    getClientOAUTHDataByIDMySQL(clientID)
}

export {getClientOAUTHDataByID,createClientOAUTHData}