import { createCourseMySQL, createEnrollmentMySQL, editCourseMySQL, getCoursesMySQL, getMyActiveEnrollmentsMySQL, getPricesOfCoursesMySQL } from "../data/index.js"

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

let enrollToCourse=async(...obj)=>{
    return await createEnrollmentMySQL(...obj)
}
let getActiveEnrollments=async(...obj)=>{
return await getMyActiveEnrollmentsMySQL(...obj)
}
export {createCourse,editCourse,getCourses,getPricesOfCourses,enrollToCourse,getActiveEnrollments}