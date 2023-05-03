import { addContentMySQL, editCourseMySQL, editContentMySQL, getLessonsMySQL} from "../data/index.js"

let getLessons=async(...obj)=>{
    return await getLessonsMySQL(...obj)
}

let addContent=async(obj)=>{
    return await addContentMySQL(obj)
}
let editContent=async({editorID, ...rest})=>{
    return await editContentMySQL(obj)
}

export {addContent,editContent,getLessons}