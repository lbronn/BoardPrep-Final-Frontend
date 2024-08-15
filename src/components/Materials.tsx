import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import ReactPaginate from "react-paginate";
import Syllabus from "./Syllabus";
import LessonContent from "./Lessons";
import ExerciseModal from "./exercise/ExerciseModal";
import ScoreModal from "./exercise/ScoreModal";
import ExerciseAssessmentModal from "./exercise/ExerciseAssessmentModal";
import "../styles/materials.scss";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";

interface Page {
  id: string;
  page_number: number;
  content: string;
}

interface CourseData {
  course_id: string;
  hasMocktest: boolean;
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
  hasFinished: boolean;
}

function Materials({ courseId }: MaterialsProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [isSyllabusCollapsed, setIsSyllabusCollapsed] = useState(false);
  const [takeExercise, setTakeExercise] = useState<boolean>(false);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [exerciseQuestions, setExerciseQuestions] = useState<Question[]>([]);
  const [hasExistingQuestions, setHasExistingQuestions] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [scoreData, setScoreData] = useState<Score | null>(null);
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);
  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const userID = user.token.id;
  const pageCount = pages.length > 0 ? Math.ceil(pages.length) : 0;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axiosInstance.get(`/courses/`);
        const courseData: CourseData[] = response.data;
        console.log(courseData);
        const currentCourse = courseData.find(
          (crs) => crs.course_id === courseId,
        );
        console.log(currentCourse);
        if (currentCourse) {
          setSelectedCourseId(currentCourse.course_id);
        } else {
          setSelectedCourseId(null);
        }
      } catch (error) {
        console.error("Error fetching class data", error);
      }
    };

    fetchCourseData();
  }, []);

  useEffect(() => {
    const fetchSyllabusAndFirstLesson = async () => {
      try {
        const syllabusResponse = await axiosInstance.get(
          `/syllabi/${courseId}/`,
        );
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

  useEffect(() => {
    const fetchExerciseScores = async () => {
      try {
        const scoresResponse = await axiosInstance.get(`/exercise-scores/`);
        const exerciseScores = scoresResponse.data;

        const exercisesResponse = await axiosInstance.get(`/exercises/`);
        const exercises = exercisesResponse.data;

        const passedLessonsSet = new Set<string>();
        for (const score of exerciseScores) {
          if (score.student === userID && score.score >= 12) {
            const matchingExercise = exercises.find(
              (exercise: { exerciseID: any; lesson: string }) =>
                exercise.exerciseID === score.exercise_id,
            );
            if (matchingExercise) {
              const lessonTest = matchingExercise.lesson;
              console.log("Lesson:", lessonTest);
              passedLessonsSet.add(lessonTest);
            }
          }
        }
        setCompletedExercises(passedLessonsSet);
      } catch (error) {
        console.error("Error fetching exercise scores or exercises:", error);
      }
    };
    fetchExerciseScores();
  }, [userID]);

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

  const handleTakeExercise = async (lesson_id: string) => {
    if (isLoading) return;
    setIsLoading(true);
    const foundLesson = lessons.find(
      (lesson) => lesson.lesson_id === currentLesson,
    );
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
        console.log(userID);
        const response = await axiosInstance.post(
          `/exercises/${lesson_id}/generate_questions/`,
          {
            page_id: foundLesson.pages[0].id,
            lesson_id: currentLesson,
            course_id: selectedCourseId,
            student_id: userID,
          },
        );
        const exerciseId = response.data.exercise_id;
        if (response.data.status === "existing exercise") {
          const questionsResponse = await axiosInstance.get(
            `/exercise-questions/${exerciseId}`,
            { params: { student_id: userID } },
          );
          setExerciseQuestions(questionsResponse.data);
          setHasExistingQuestions(true);
        } else {
          const newQuestions = response.data.questions;
          setExerciseQuestions(newQuestions);
          setHasExistingQuestions(false);
          const questionsResponse = await axiosInstance.get(
            `/exercise-questions/${exerciseId}`,
            { params: { student_id: userID } },
          );
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

  const handleScoreModalClose = () => {
    setScoreModalVisible(false);
    if (scoreData && scoreData.hasFinished) {
      setHasExistingQuestions(true);
    }
  };

  const handleViewAssessment = () => {
    setAssessmentModalVisible(true);
  };

  const handleAssessmentModalClose = () => {
    setAssessmentModalVisible(false);
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

      <div
        className={`syllabus-main ${isSyllabusCollapsed ? "collapsed" : ""}`}
      >
        <Syllabus lessons={lessons} onLessonClick={handleLessonClick} />
      </div>
      <div className="box-content">
        <div className="lesson-content-container">
          {pages.length > 0 &&
            pages.map((page, index) => (
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
        {userType === "S" && pages.length > 0 && (
          <div className="buttons-container">
            {completedExercises.has(currentLesson as string) && (
              <button
                className="view-assessment-btn"
                onClick={handleViewAssessment}
              >
                View Assessment
              </button>
            )}
            <button
              className={`exercise-btn ${isLoading ? "loading" : ""}`}
              onClick={() => handleTakeExercise(pages[currentPage].id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-circle"></div>
              ) : completedExercises.has(currentLesson as string) ? (
                "Retake Exercise"
              ) : (
                "Take Exercise"
              )}
            </button>
          </div>
        )}
        {scoreModalVisible && scoreData && (
          <ScoreModal
            closeModal={handleScoreModalClose}
            score={{ total: scoreData.totalQuestions, actual: scoreData.score }}
            student={scoreData.student}
            studentName={scoreData.studentName}
            studentID={userID}
            exerciseDateTaken={scoreData.exerciseDateTaken}
            feedback={scoreData.feedback}
            lesson={lesson}
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
        {assessmentModalVisible && (
          <ExerciseAssessmentModal
            closeModal={handleAssessmentModalClose}
            studentID={userID}
            lesson={currentLesson}
          />
        )}
      </div>
    </div>
  );
}

export default Materials;

