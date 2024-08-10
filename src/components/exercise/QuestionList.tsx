import React from "react";
import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  questions: {
    id: number;
    question: string;
    choiceA: string;
    choiceB: string;
    choiceC: string;
    choiceD: string;
  }[];
  onAnswerChange: (questionNumber: number, selectedChoice: string) => void;
  answers: { [key: number]: string | null };
}

function QuestionList({
  questions = [],
  onAnswerChange,
  answers,
}: Readonly<QuestionListProps>) {
  return (
    <div>
      {questions.map((q, index) => (
        <QuestionCard
          key={q.id}
          id={q.id}
          displayNumber={index + 1}
          question={q.question}
          choiceA={q.choiceA}
          choiceB={q.choiceB}
          choiceC={q.choiceC}
          choiceD={q.choiceD}
          onAnswerChange={onAnswerChange}
          selectedChoice={answers[q.id] ?? ""}
        />
      ))}
    </div>
  );
}

export default QuestionList;