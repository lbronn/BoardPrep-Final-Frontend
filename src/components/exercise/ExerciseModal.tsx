import React, { useState } from "react";
import "../../styles/exercise.scss";
import QuestionCard from "./QuestionCard";

interface Posts {
  author: string;
  dateCreate: string;
  title: string;
  content: string;
  tags: string;
}
interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  content: string;
  syllabus: string;
}

interface ExerciseProps {
  closeModal: () => void;
  lesson: Lesson | undefined;
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

const handleSubmit = (event: React.FormEvent) => {
  event.preventDefault();
  console.log("Form Submitted");
};

function ExerciseModal({ closeModal, lesson }: ExerciseProps) {
  return (
    <div id="modal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="title">{lesson?.lesson_title}</h1>
          <span className="close title" onClick={closeModal}>
            &times;
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          {sampleQuestions.map((q) => (
            <QuestionCard
              key={q.number}
              number={q.number}
              question={q.question}
              choices={q.choices}
            />
          ))}
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default ExerciseModal;
