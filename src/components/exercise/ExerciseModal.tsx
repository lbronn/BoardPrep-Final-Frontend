import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../styles/exercise.scss";
import QuestionList from "./QuestionList";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../redux/hooks";
import { selectUser } from "../../redux/slices/authSlice";
import axiosInstance from "../../axiosInstance";
import ScoreModal from "./ScoreModal";
import { set } from "lodash";

interface Page {
  id: string;
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

interface ExerciseProps {
  closeModal: () => void;
  lesson?: Lesson | undefined;
  questions: Question[];
  exerciseId: string | null;
}

interface Question {
  id: number;
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: string;
}

const ExerciseModal: React.FC<ExerciseProps> = ({
  closeModal,
  questions,
  lesson,
  exerciseId,
}) => {
  const extractLessonTitle = (content: string = "") => {
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    return titleMatch ? titleMatch[1] : null;
  };

  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const userID = user.token.id;
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const title = extractLessonTitle(lesson?.pages[0].content);
  const lessonId = lesson?.lesson_id ?? "defaultLessonId";
  const [studentName, setStudentName] = useState<string>();
  const [exerciseDateTaken, setExerciseDateTaken] = useState<string>();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [score, setScore] = useState<{ total: number; actual: number }>({
    total: 0,
    actual: 0,
  });
  const [correctAnswers, setCorrectAnswers] = useState<
    {
      index: number;
      questionId: number;
      correctAnswer: string;
      studentAnswer: string | null;
    }[]
  >([]);

  const congrats =
    "Congratulations on successfully passing the exercise! Your hard work and dedication truly paid off, demonstrating your strong skills and understanding. Keep up the excellent work as you continue to tackle new challenges!";

  const [answers, setAnswers] = useState<{ [key: number]: string | null }>(() =>
    questions.reduce(
      (acc, question) => {
        acc[question.id] = null;
        return acc;
      },
      {} as { [key: number]: string | null },
    ),
  );

  const clearTimer = useCallback(() => {
    if (intervalId.current) clearInterval(intervalId.current);
    localStorage.removeItem(`exerciseStartTime-${lessonId}`);
  }, [lessonId]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const startTime = localStorage.getItem(`exerciseStartTime-${lessonId}`);
      if (startTime) {
        const elapsedSeconds = Math.floor(
          (Date.now() - parseInt(startTime)) / 1000,
        );
        return Math.max(1800 - elapsedSeconds, 0);
      } else {
        const now = Date.now();
        localStorage.setItem(`exerciseStartTime-${lessonId}`, now.toString());
        return 1800;
      }
    };

    setTimeRemaining(calculateTimeRemaining());

    intervalId.current = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [lessonId]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      clearInterval(intervalId.current!);
      localStorage.removeItem(`exerciseStartTime-${lessonId}`);
    }
  }, [timeRemaining, lessonId]);

  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (
    questionNumber: number,
    selectedChoice: string,
  ) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [questionNumber]: selectedChoice,
      };
      console.log("Updated Answers: ", updatedAnswers);
      return updatedAnswers;
    });
  };

  const calculateScore = () => {
    let actualScore = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        actualScore++;
      }
    });
    return { total: questions.length, actual: actualScore };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearTimer();
    const { total, actual } = calculateScore();
    const dateTaken = new Date().toISOString().split("T")[0];

    const correctAnswersData = questions.map((question, index) => ({
      index: index - 1 + 1,
      questionId: question.id,
      correctAnswer: question.correctAnswer,
      studentAnswer: answers[question.id],
    }));

    setCorrectAnswers(correctAnswersData);

    const payload = {
      student_id: userID,
      exercise_id: exerciseId,
      score: actual,
      totalQuestions: total,
      exerciseDateTaken: dateTaken,
      feedback: congrats,
      correct_answers: correctAnswersData,
      lesson_id: lesson?.lesson_id,
      page_id: lesson?.pages[0]?.id,
      hasFinished: actual >= 12,
    };

    if (actual >= 12) {
      try {
        const response = await axiosInstance.post(
          `/exercise-scores/${exerciseId}/`,
          payload,
        );
        const { studentName } = response.data;
        setScore({ total, actual });
        setShowScoreModal(true);
        setStudentName(studentName);
        setExerciseDateTaken(dateTaken);
        setFeedbackMessage("Great job! You passed the exercise.");
        console.log(feedbackMessage);
      } catch (error: any) {
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data.error ===
            "A higher or equal score already exists."
        ) {
          setFeedbackMessage(
            "A higher or equal score already exists. Your score has not been updated.",
          );
        } else {
          console.error("Error submitting score:", error);
        }
      }
    } else {
      setScore({ total, actual });
      setShowScoreModal(true);
      setStudentName(user.token.id);
      setExerciseDateTaken(dateTaken);
      setFeedbackMessage("Unfortunately, you didn't pass the exercise.");
    }
  };

  const closeScoreModal = () => {
    setShowScoreModal(false);
    closeModal();
  };

  return (
    <div id="modal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="title">{title}</h2>
          <span className="close-title" onClick={closeModal}>
            &times;
          </span>
        </div>
        {userType === "S" && (
          <div className="exam-timer"> Timer: {formatTime()} </div>
        )}
        <form onSubmit={handleSubmit}>
          <QuestionList
            questions={questions}
            onAnswerChange={handleAnswerChange}
            answers={answers}
          />
          <button type="submit">SUBMIT</button>
        </form>
      </div>
      {showScoreModal && (
        <ScoreModal
          closeModal={closeScoreModal}
          feedback={feedbackMessage}
          score={score}
          lesson={lesson}
          correctAnswers={correctAnswers}
          studentName={studentName}
          studentID={userID}
          exerciseDateTaken={exerciseDateTaken}
        />
      )}
    </div>
  );
};

export default ExerciseModal;

