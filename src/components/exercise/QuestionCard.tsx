import { useState, ChangeEvent, useEffect } from "react";
import "../../styles/question.scss";

interface QuestionCardProps {
  number: number;
  question: string;
  choices: string[];
  onAnswerChange: (questionNumber: number, selectedChoice: string) => void;
  selectedChoice: string;
}

function QuestionCard({
  number,
  question,
  choices,
  onAnswerChange,
  selectedChoice,
}: QuestionCardProps) {
  const [internalChoice, setInternalChoice] = useState<string>(selectedChoice);

  useEffect(() => {
    setInternalChoice(selectedChoice);
  }, [selectedChoice]);

  const handleChoiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const choice = event.target.value;
    setInternalChoice(choice);
    onAnswerChange(number, choice);
  };

  return (
    <div className="question-card">
      <p>
        {number}. {question}
      </p>
      <div className="choices-form">
        {choices.map((choice, index) => (
          <div key={index} className="choice-item">
            <div className="custom-radio">
              <input
                type="radio"
                id={`choice-${number}-${index}`}
                name={`question-${number}`}
                value={choice}
                checked={selectedChoice === choice}
                onChange={handleChoiceChange}
              />
              <label htmlFor={`choice-${number}-${index}`}>{choice}</label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionCard;
