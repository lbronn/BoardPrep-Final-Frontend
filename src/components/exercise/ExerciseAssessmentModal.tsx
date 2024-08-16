import React, { useEffect, useState } from "react";
import { Doughnut, Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  LineController,
  BarController,
} from "chart.js";
import axiosInstance from "../../axiosInstance";
import "../../styles/studentperformancemodal.scss";
import { useAppSelector } from "../../redux/hooks";
import { selectUser } from "../../redux/slices/authSlice";

ChartJS.register(
  Title,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  LineController,
  BarController,
);

interface CorrectAnswer {
  index: number;
  questionId: number;
  correctAnswer: string;
  studentAnswer: string | null;
}

interface AssessmentData {
  score: number;
  totalQuestions: number;
  correctAnswers: CorrectAnswer[];
  studentName: string;
  exerciseDateTaken: string;
  feedback: string;
}

interface AssessmentModalProps {
  closeModal: () => void;
  studentID?: string;
  lesson?: string | null;
}

function ExerciseAssessmentModal({
  closeModal,
  studentID,
  lesson,
}: AssessmentModalProps) {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(
    null,
  );
  const user = useAppSelector(selectUser);
  const userID = user.token.id;

  const congrats =
    "Congratulations on successfully passing the exercise! Your hard work and dedication truly paid off, demonstrating your strong skills and understanding. Keep up the excellent work as you continue to tackle new challenges!";

  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (studentID) {
        try {
          console.log("Fetching assessment data for student:", studentID);
          const { data } = await axiosInstance.get(`/exercises`);
          let exerciseId: string = "";

          console.log("mao ni ang user", user);
          console.log("mao ni mga exercises: ", data);

          for (let elem of data) {
            if (elem.lesson === lesson && elem.student === studentID) {
              exerciseId = elem.exerciseID;
              break;
            }
          }

          console.log("mao ni exercise id: ", exerciseId);

          const scoresResponse = await axiosInstance.get(`/exercise-scores/`, {
            params: { student_id: studentID },
          });
          const exerciseScores = scoresResponse.data;
          console.log("Exercise Scores:", exerciseScores);

          const score = exerciseScores.find((obj: any) => {
            if(obj.exercise_id === exerciseId) return obj;
          });

          console.log("diri sata: ", score, user.token.id);
          console.log("diara: ", exerciseId);

          console.log("mao nani iya score", score);

          if (score) {
            console.log("score found:", score);
            const correctAnswersResponse = await axiosInstance.get(
              `/exercise-questions/${score.exercise_id}/`,
              {
                params: { student_id: studentID },
              },
            );
            const correctAnswers: CorrectAnswer[] = correctAnswersResponse.data;

            console.log("Correct Answers fetched:", correctAnswers);

            setAssessmentData({
              score: score.score,
              totalQuestions: score.totalQuestions,
              correctAnswers,
              studentName: score.studentName,
              exerciseDateTaken: score.exerciseDateTaken,
              feedback: score.feedback,
            });
          } else {
            console.log("No exercise data found for this student.");
          }
        } catch (err) {
          console.error("Error fetching assessment data:", err);
        }
      } else {
        console.log("StudentID is missing.");
      }
    };

    fetchAssessmentData();
  }, [studentID]);

  const handleCloseClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    closeModal();
  };

  const scoreData = {
    datasets: [
      {
        data: assessmentData
          ? [
              assessmentData.score,
              assessmentData.totalQuestions - assessmentData.score,
            ]
          : [0, 0],
        backgroundColor: ["rgba(182, 80, 244, 1)", "#626b77"],
        borderColor: ["rgba(182, 80, 244, 1)", "#626b77"],
        cutout: "85%",
      },
    ],
  };

  const scoreOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const centerTextPlugin = {
    id: "centerText",
    afterDatasetsDraw(chart: any) {
      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;

      ctx.save();
      ctx.font = `${20}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "white";

      const score = assessmentData?.score;
      const totalQuestions = assessmentData?.totalQuestions;

      const textX = width / 2;
      const textY = height / 2;

      if (score !== undefined && totalQuestions !== undefined) {
        const fractionSize = 20;
        const offset = fractionSize / 2;

        ctx.font = `${fractionSize}px sans-serif`;
        ctx.fillText(`${score}`, textX, textY - offset);
        ctx.fillRect(textX - 30, textY, 60, 1);
        ctx.fillText(`${totalQuestions}`, textX, textY + offset + fractionSize);
      }
    },
  };
  console.log("mao ni iya feedback", assessmentData?.feedback);

  const plugins = [centerTextPlugin];

  return (
    <div id="modal" className="modal">
      <div className="activity-modal">
        <div className="modal-header">
          <div className="h1">Your Assessment</div>
          <span className="close" onClick={handleCloseClick}>
            &times;
          </span>
        </div>
        {assessmentData ? (
          <div className="dashboard">
            <div className="left">
              <div className="group group1">
                <div style={{ width: "100px", height: "100px" }}>
                  <Doughnut
                    data={scoreData}
                    options={scoreOptions}
                    plugins={plugins}
                  />
                </div>
                <div className="group1__data">
                  <span>Student: {assessmentData.studentName}</span>
                  <span>Date Taken: {assessmentData.exerciseDateTaken}</span>
                </div>
              </div>
            </div>
            <div className="group group3">
              <h2 className="title">Feedback</h2>
              <br />
              <div className="feedback">{congrats}</div>
            </div>
          </div>
        ) : (
          <div className="h1">No assessment data available.</div>
        )}
      </div>
    </div>
  );
}

export default ExerciseAssessmentModal;
