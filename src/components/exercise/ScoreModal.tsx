import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import "../../styles/class.scss";
import { useAppSelector } from "../../redux/hooks";
import { selectUser } from '../../redux/slices/authSlice';

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
  score: { total: number; actual: number };
  lesson?: Lesson | undefined;
  correctAnswers?: CorrectAnswer[];
  studentName?: string;
  studentID?: string;
  exerciseDateTaken?: string;
  student?: string;
  feedback?: string;
}

function ScoreModal({ closeModal, score, lesson, correctAnswers, studentName, exerciseDateTaken, feedback, studentID }: LessonProps) {
  const user = useAppSelector(selectUser);
  const userID = user.token.id;
  const [isLoading, setIsLoading] = useState(false);

  const extractLessonTitle = (content: string = "") => {
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    return titleMatch ? titleMatch[1] : null;
  };

  const title = extractLessonTitle(lesson?.pages[0].content);

  const handleClose = async () => {
    if (score.actual >= 12 && lesson) {
      setIsLoading(true);
      setTimeout(() => {
        window.location.reload();
      }, 500); 
    } else if (score.actual < 12 && lesson) {
      try {
        const lessonId = lesson.lesson_id; 
        console.log("lessonId: ", lessonId);
        const exerciseResponse = await axiosInstance.get(`/exercises/${lessonId}/`, { params: { student_id: studentID } });
        const exerciseId = exerciseResponse.data[0].exerciseID;
        console.log("exerciseId: ", exerciseId);
        console.log(studentID, userID);
        if(studentID === userID) {
          await axiosInstance.delete(`/exercise-questions/${exerciseId}/`, { params: { student_id: studentID } });
          await axiosInstance.delete(`/exercises/${lessonId}/`, { params: { student_id: studentID } });
        } else {
          console.log("Skipping deletion: User does not have permission to delete this exercise");
        }
      } catch (error) {
        console.error("Error deleting exercise:", error);
      }
    }
    closeModal();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div id="modal" className="modal">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-circle"></div>
        </div>
      ) : (
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="title">Exercise Results for {title} taken on <i>{formatDate(exerciseDateTaken)}</i></h2>
            <span className="close title" onClick={handleClose}>
              &times;
            </span>
          </div>
          {score.actual < 12 && (
              <div>
                <b>Sorry, you failed the exercise.</b> The passing score is <strong><i>{score.total}</i></strong>, you only got <strong><i>{score.actual}</i></strong>. Please try again, new questions will be generated.
              </div>
          )}
          {score.actual >= 12 && (
            <>
              <div>
                Congratulations for completing the exercise for <b>{title}</b>, you can now proceed to the next lesson!
              </div>
              <div>
                <b>Score:</b> {score.actual} / {score.total}
              </div>
            </>
          )}
          <div>
            <b>Feedback:</b> {feedback}
          </div>
          {correctAnswers && (
              <div>
                <h4>Correct Answers:</h4>
                <ul className="correct-answers">
                  {correctAnswers.map(({ correctAnswer, index }) => (
                    <li key={index}>
                      {index + 1}: {correctAnswer}
                    </li>
                  ))}
                </ul>        
              </div>
            )}   
        </div>
      )}
    </div>
  );
}

export default ScoreModal;