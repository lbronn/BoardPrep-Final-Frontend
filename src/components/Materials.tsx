import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import ReactPaginate from "react-paginate";
import Syllabus from "./Syllabus";
import LessonContent from "./Lessons";
import ExerciseModal from "./exercise/ExerciseModal";
import ScoreModal from "./exercise/ScoreModal";
import "../styles/materials.scss";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from '../redux/slices/authSlice';

interface Page {
  id: string;
  page_number: number;
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

interface Question {
  id: number;
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: string;
}

interface MaterialsProps {
  courseId: string;
}

interface Score {
  exercise_id: string;
  totalQuestions: number;
  score: number;
  studentName: string;
  student: string;
  exerciseDateTaken: string;
  feedback: string;
}

function Materials({ courseId }: MaterialsProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [isSyllabusCollapsed, setIsSyllabusCollapsed] = useState(false);
  const [takeExercise, setTakeExercise] = useState<boolean>(false);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [hasExistingQuestions, setHasExistingQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [exerciseQuestions, setExerciseQuestions] = useState<Question[]>([]);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [scoreData, setScoreData] = useState<{ totalQuestions: number; score: number; studentName: string; student: string; exerciseDateTaken: string, feedback: string } | null>(null);
  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const userID = user.token.id;
  const pageCount = pages.length > 0 ? Math.ceil(pages.length) : 0;

  useEffect(() => {
    const fetchSyllabusAndFirstLesson = async () => {
      try {
        const syllabusResponse = await axiosInstance.get(`/syllabi/${courseId}/`);
        const syllabusData = syllabusResponse.data[0];
        setLessons(syllabusData.lessons);

        if (syllabusData.lessons.length > 0) {
          const firstLessonId = syllabusData.lessons[0].lesson_id;
          setCurrentLesson(firstLessonId);
          await fetchPages(firstLessonId);
        }
      } catch (error) {
        console.error("Error fetching syllabus:", error);
      }
    };

    if (courseId) {
      fetchSyllabusAndFirstLesson();
    }
  }, [courseId]);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const response = await axiosInstance.get(`/syllabi/${courseId}/`);
        const syllabusData = response.data[0];
        setLessons(syllabusData.lessons);
      } catch (error) {
        console.error("Error fetching syllabus:", error);
      }
    };

    if (courseId) {
      fetchSyllabus();
    }
  }, [courseId]);

  const handleCheckboxChange = () => {
    setIsSyllabusCollapsed(!isSyllabusCollapsed);
  };

  const fetchPages = async (lessonId: string) => {
    try {
      const response = await axiosInstance.get(`/pages/${lessonId}/`);
      setPages(response.data);
    } catch (error) {
      setCurrentPage(0);
      console.error("Error fetching pages:", error);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    fetchPages(lessonId);
    setCurrentLesson(lessonId);
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const handleViewAssessment = async () => {
    if (exerciseId) {
      try {
        const response = await axiosInstance.get(`/exercise-scores/`);
        const exerciseScores: Score[] = response.data;
        const relevantScoreData = exerciseScores.find(score => score.exercise_id === exerciseId);
        console.log("Assessment Data:", exerciseScores);
        console.log("Relevant Score Data:", relevantScoreData);
        console.log(exerciseId);
        if (relevantScoreData) {
          setScoreData({
            totalQuestions: relevantScoreData.totalQuestions,
            score: relevantScoreData.score,
            studentName: relevantScoreData.studentName,
            student: relevantScoreData.student,
            exerciseDateTaken: relevantScoreData.exerciseDateTaken,
            feedback: relevantScoreData.feedback,
          });
          setScoreModalVisible(true);
        } else {
          console.error("No relevant exercise scores found.");
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
      }
    }
  };

  const handleTakeExercise = async (lesson_id: string) => {
    if (isLoading) return;
    setIsLoading(true);
    const foundLesson = lessons.find((lesson) => lesson.lesson_id === currentLesson);
    if (foundLesson) {
      setLesson(foundLesson);
    } else {
      setLesson(undefined);
      console.error("Lesson not found");
      setIsLoading(false);
      return;
    }

    if (foundLesson && foundLesson.pages.length > 0) {
      try {
        const response = await axiosInstance.post(`/exercises/${lesson_id}/generate_questions/`, { page_id: foundLesson.pages[0].id, lesson_id: currentLesson });
        const exerciseId = response.data.exercise_id;
        if (response.data.status === 'existing exercise') {
          const questionsResponse = await axiosInstance.get(`/exercise-questions/${exerciseId}`);
          setExerciseQuestions(questionsResponse.data);
          setHasExistingQuestions(true);
        } else {
          const newQuestions = response.data.questions;
          setExerciseQuestions(newQuestions);
          setHasExistingQuestions(false);
          const questionsResponse = await axiosInstance.get(`/exercise-questions/${exerciseId}`);
          setExerciseQuestions(questionsResponse.data);
        }
        setExerciseId(exerciseId);
        setTakeExercise(true);
      } catch (error) {
        console.error("Error generating questions:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("Lesson is undefined or has no pages");
      setIsLoading(false);
    }
  };

  const closeTakeExercise = () => {
    setTakeExercise(false);
  };

  const unlockNextLesson = (lessonId: string) => {
    const nextLessonIndex = lessons.findIndex((lesson) => lesson.lesson_id === lessonId) + 1;
    if (nextLessonIndex < lessons.length) {
      setCurrentLesson(lessons[nextLessonIndex].lesson_id);
    }
  };

  return (
    <div className={`materials-page ${isSyllabusCollapsed ? "collapsed" : ""}`}>
      <input
        type="checkbox"
        id="checkbox"
        className="checkbox"
        checked={isSyllabusCollapsed}
        onChange={handleCheckboxChange}
      />
      <label htmlFor="checkbox" className="toggle">
        <div className="bars" id="bar1"></div>
        <div className="bars" id="bar2"></div>
        <div className="bars" id="bar3"></div>
      </label>

      <div className={`syllabus-main ${isSyllabusCollapsed ? "collapsed" : ""}`}>
        <Syllabus lessons={lessons} onLessonClick={handleLessonClick} />
      </div>
      <div className="box-content">
        <div className="lesson-content-container">
          {pages.length > 0 && pages.map((page, index) => (
            <LessonContent key={index} content={page.content} />
          ))}

          {pageCount > 1 && (
            <ReactPaginate
              previousLabel={currentPage > 0 ? "previous" : ""}
              nextLabel={currentPage < pageCount - 1 ? "next" : ""}
              breakLabel={"..."}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              activeClassName={"active"}
            />
          )}
        </div>
        {userType === 'S' && pages.length > 0 && (
          <div className="buttons-container">
            <button 
              className={`view-assessment-btn ${!hasExistingQuestions ? 'disabled' : ''}`} 
              onClick={hasExistingQuestions  ? handleViewAssessment : undefined}
              disabled={!hasExistingQuestions }
            >
              View Assessment
            </button>
            <button
              className={`exercise-btn ${isLoading ? 'loading' : ''}`}
              onClick={() => handleTakeExercise(pages[currentPage].id)}
              disabled={isLoading}
            >
              {isLoading ? <div className="loading-circle"></div> : "Take Exercise"}
            </button>
          </div>
        )}
        {scoreModalVisible && scoreData && (
          <ScoreModal
            closeModal={() => setScoreModalVisible(false)}
            score={{ total: scoreData.totalQuestions, actual: scoreData.score }}
            student={scoreData.student}
            studentName={scoreData.studentName}
            exerciseDateTaken={scoreData.exerciseDateTaken}
            feedback={scoreData.feedback}
            lesson={lesson}
            unlockNextLesson={unlockNextLesson}
          />
        )}
        {takeExercise && (
          <ExerciseModal
            questions={exerciseQuestions}
            closeModal={closeTakeExercise}
            lesson={lesson}
            exerciseId={exerciseId}
          />
        )}
      </div>
    </div>
  );
}

export default Materials;