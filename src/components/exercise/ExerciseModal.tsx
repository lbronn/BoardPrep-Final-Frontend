import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../styles/exercise.scss";
import QuestionList from "./QuestionList";
import { useDispatch } from 'react-redux';
import { useAppSelector } from "../../redux/hooks";
import { selectUser } from '../../redux/slices/authSlice';
import axiosInstance from '../../axiosInstance';

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

interface ExerciseProps {
  closeModal: () => void;
  lesson?: Lesson | undefined;
}

const sampleQuestions = [
  {
    number: 1,
    question: "What is the capital of France?",
    choices: ["Paris", "London", "Rome", "Berlin"],
  },
  {
    number: 2,
    question: "What is the capital of Spain?",
    choices: ["Madrid", "Barcelona", "Valencia", "Seville"],
  },
  {
    number: 3,
    question: "What is the capital of Italy?",
    choices: ["Rome", "Milan", "Naples", "Turin"],
  },
  {
    number: 4,
    question: "What is the capital of Germany?",
    choices: ["Berlin", "Munich", "Frankfurt", "Hamburg"],
  },
  {
    number: 5,
    question: "What is the capital of Portugal?",
    choices: ["Lisbon", "Porto", "Braga", "Coimbra"],
  },
  {
    number: 6,
    question: "What is the capital of Netherlands?",
    choices: ["Amsterdam", "Rotterdam", "Utrecht", "The Hague"],
  },
  {
    number: 7,
    question: "What is the capital of Belgium?",
    choices: ["Brussels", "Antwerp", "Ghent", "Bruges"],
  },
  {
    number: 8,
    question: "What is the capital of Austria?",
    choices: ["Vienna", "Salzburg", "Innsbruck", "Graz"],
  },
  {
    number: 9,
    question: "What is the capital of Switzerland?",
    choices: ["Bern", "Zurich", "Geneva", "Basel"],
  },
  {
    number: 10,
    question: "What is the capital of Norway?",
    choices: ["Oslo", "Bergen", "Trondheim", "Stavanger"],
  },
];

function ExerciseModal({ closeModal, lesson }: ExerciseProps) {
  const extractLessonTitle = (content: string = "") => {
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    return titleMatch ? titleMatch[1] : null;
  };

  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const [timeRemaining, setTimeRemaining] = useState(2700);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string | null }>({});

  const title = extractLessonTitle(lesson?.pages[0].content);

  const clearTimer = useCallback(() => {
    console.log("Clearing timer...");
    if (intervalId.current) clearInterval(intervalId.current);
    localStorage.removeItem('exerciseStartTime');
  }, []);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const startTime = localStorage.getItem('exerciseStartTime');
      if (startTime) {
        const elapsedSeconds = Math.floor((Date.now() - parseInt(startTime)) / 1000);
        return Math.max(2700 - elapsedSeconds, 0);
      } else {
        const now = Date.now();
        localStorage.setItem('exerciseStartTime', now.toString());
        return 2700;
      }
    };

    setTimeRemaining(calculateTimeRemaining());

    intervalId.current = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) {
      clearInterval(intervalId.current!);
      localStorage.removeItem('exerciseStartTime');
    }
  }, [timeRemaining]);

  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (
    questionNumber: number,
    selectedChoice: string,
  ) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNumber]: selectedChoice,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form Submitted", answers);
    clearTimer();
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
        {userType === 'S' && (
          <div className="exam-timer"> Timer: {formatTime()} </div>
        )}
        <form onSubmit={handleSubmit}>
          <QuestionList
            questions={sampleQuestions}
            onAnswerChange={handleAnswerChange}
            answers={answers}
          />
          <button type="submit">SUBMIT</button>
        </form>
      </div>
    </div>
  );
}

export default ExerciseModal;
