import { addContentMySQL, editCourseMySQL, editContentMySQL} from "../data/index.js"

let addContent=async(obj)=>{
    return await addContentMySQL(obj)
}
let editContent=async({editorID, ...rest})=>{
    return await editContentMySQL(obj)
}

export {addContent,editContent}