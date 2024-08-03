import { useState, ChangeEvent } from "react";
import "../../styles/question.scss";

interface QuestionCardProps {
  number: number;
  question: string;
  choices: string[];
}

function QuestionCard({ number, question, choices }: QuestionCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleChoiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const choice = event.target.value;

    if (choice) {
      setSelectedChoice(choice);
    } else {
      setSelectedChoice(null);
    }
  };

  return (
    <div className="question-card">
      <p>
        {number}. {question}
      </p>
      <form className="choices-form">
        {choices.map((choice, index) => (
          <div key={index} className="choice-item">
            <input
              type="radio"
              id={`choice-${index}`}
              name="choice"
              value={choice}
              checked={selectedChoice === choice}
              onChange={handleChoiceChange}
            />
            <label htmlFor={`choice-${index}`}>{choice}</label>
          </div>
        ))}
      </form>
    </div>
  );
}

export default QuestionCard;
