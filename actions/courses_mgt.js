import { createCourseMySQL, createEnrollmentMySQL, editCourseMySQL, enrollCourseMySQL, getCourseByCourseIDMySQL, getCoursesMySQL, getMyActiveEnrollmentsMySQL, getPricesOfCoursesMySQL } from "../data/index.js"

let getCourseByCourseID=async(courseID)=>{
    return await getCourseByCourseIDMySQL(courseID)
}
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

let enrollPaidCourse=async(...obj)=>{
    return await createEnrollmentMySQL(...obj)
}

let enrollCourse=async(...obj)=>{
    return await enrollCourseMySQL(...obj)
}

let getActiveEnrollments=async(...obj)=>{
return await getMyActiveEnrollmentsMySQL(...obj)
}
export {createCourse,editCourse,getCourses,getPricesOfCourses,enrollPaidCourse,enrollCourse,getActiveEnrollments,getCourseByCourseID}