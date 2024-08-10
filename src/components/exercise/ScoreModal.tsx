import "../../styles/class.scss";

interface Page {
  content: string;
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  content: string;
  syllabus: string;
  pages: Page[];
}

interface CorrectAnswer {
    index: number;
    questionId: number; 
    correctAnswer: string;
    studentAnswer: string | null;
}

interface LessonProps {
  closeModal: () => void;
  unlockNextLesson: (lessonId: string) => void;
  score: { total: number; actual: number };
  lesson?: Lesson | undefined;
  correctAnswers?: CorrectAnswer[];
  studentName?: string;
  exerciseDateTaken?: string;
  student?: string;
  feedback?: string;
}

function ScoreModal({ closeModal, score, lesson, correctAnswers, studentName, exerciseDateTaken, feedback, unlockNextLesson }: LessonProps) {
  const extractLessonTitle = (content: string = "") => {
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    return titleMatch ? titleMatch[1] : null;
  };

  const title = extractLessonTitle(lesson?.pages[0].content);

  const handleClose = () => {
    if (score.actual >= 10 && lesson) {
      unlockNextLesson(lesson.lesson_id);
      console.log(lesson);
      console.log(lesson.lesson_id);
    }
    closeModal();
  };

  return (
    <div id="modal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="title">Exercise Results for {title}</h2>
          <span className="close title" onClick={handleClose}>
            &times;
          </span>
        </div>
        <div>
            Congratulations, <b>{studentName}</b> for completing the exercise for <b>{title}</b>!
        </div>
        <>
          <div>
            <b>Feedback:</b> {feedback}
          </div>
          <div>
            <b>Score:</b> {score.actual} / {score.total}
          </div>
        </>
        {correctAnswers && (
            <div>
              <h4>Correct Answers:</h4>
              <ul>
                {correctAnswers.map(({ correctAnswer, index }) => (
                  <li key={index}>
                    Question {index + 1}: {correctAnswer}
                  </li>
                ))}
              </ul>
              <div>
                Taken on: <b>{exerciseDateTaken}</b>
              </div>            
            </div>
          )}
      </div>
    </div>
  );
}

export default ScoreModal;