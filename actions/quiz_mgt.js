let initiateQuiz=async({title,desc,courseID,numOfQuestions,durationMode,contentID,creatorID})=>{
  try {
    //create quiz session
createQuizMySQL({title,desc,courseID,numOfQuestions,durationMode,contentID,creatorID})
  } catch (error) {
    console.log(error)
  }
}

let getQuizSession=async(quizSessionID)=>{

}