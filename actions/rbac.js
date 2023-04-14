import { createRoleMySQL, createScopeMySQL } from "../data/index.js"

let createScope=async({scope,scopeDesc,scopeLabel,creatorID})=>{
   return await createScopeMySQL({scope,scopeDesc,scopeLabel,creatorID})
}

let createRole=async({role,scopes,creatorID})=>{
   return await createRoleMySQL({newRole:role,newRoleScopes:scopes,creatorID})
}

export {createScope,createRole}