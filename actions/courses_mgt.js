import { createCourseMySQL, editCourseMySQL, getCoursesMySQL, getPricesOfCoursesMySQL } from "../data/index.js"

let createCourse=async(obj)=>{
    return await createCourseMySQL(obj)
}
let editCourse=async({editorID, ...rest})=>{
    return await editCourseMySQL(obj)
}

let getCourses=async({filters,})=>{
    return await getCoursesMySQL({filters})
}

let getPricesOfCourses=async({courseIDs})=>{
    return await getPricesOfCoursesMySQL({courseIDs})
}
export {createCourse,editCourse,getCourses,getPricesOfCourses}