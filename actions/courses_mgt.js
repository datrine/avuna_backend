import { createCourseMySQL, editCourseMySQL } from "../data/index.js"

let createCourse=async(obj)=>{
    return await createCourseMySQL(obj)
}
let editCourse=async({editorID, ...rest})=>{
    return await editCourseMySQL(obj)
}

export {createCourse,editCourse}