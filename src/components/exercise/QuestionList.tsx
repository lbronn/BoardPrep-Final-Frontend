import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  questions: {
    number: number;
    question: string;
    choices: string[];
  }[];
  onAnswerChange: (questionNumber: number, selectedChoice: string) => void;
  answers: { [key: number]: string | null };
}

function QuestionList({
  questions,
  onAnswerChange,
  answers,
}: QuestionListProps) {
  return (
    <div>
      {questions.map((q) => (
        <QuestionCard
          key={q.number}
          number={q.number}
          question={q.question}
          choices={q.choices}
          onAnswerChange={onAnswerChange}
          selectedChoice={answers[q.number] || ""}
        />
      ))}
    </div>
  );
}

export default QuestionList;
