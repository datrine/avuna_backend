import { createCourseMySQL, editCourseMySQL, getCoursesMySQL } from "../data/index.js"

let createCourse=async(obj)=>{
    return await createCourseMySQL(obj)
}
let editCourse=async({editorID, ...rest})=>{
    return await editCourseMySQL(obj)
}

let getCourses=async({filters,})=>{
    return await getCoursesMySQL({filters})
}
export {createCourse,editCourse,getCourses}