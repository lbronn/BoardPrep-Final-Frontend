import React, { ChangeEvent } from "react";
import "../../styles/question.scss";

interface QuestionCardProps {
  id: number;
  displayNumber: number;
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  onAnswerChange: (questionNumber: number, selectedChoice: string) => void;
  selectedChoice: string;
}

function QuestionCard({
  id,
  displayNumber,
  question,
  choiceA,
  choiceB,
  choiceC,
  choiceD,
  onAnswerChange,
  selectedChoice,
}: Readonly<QuestionCardProps>) {
  const handleChoiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const choice = event.target.value;
    onAnswerChange(id, choice);
  };

  return (
    <div className="question-card">
      <p>
        {displayNumber}. {question}
      </p>
      <div className="choices-form">
        <div className="choice-item">
          <div className="custom-radio">
            <input
              type="radio"
              id={`question-${id}-choiceA`}
              name={`question-${id}`}
              value={choiceA}
              checked={selectedChoice === choiceA}
              onChange={handleChoiceChange}
            />
            <label htmlFor={`question-${id}-choiceA`}>{choiceA}</label>
          </div>
        </div>
        <div className="choice-item">
          <div className="custom-radio">
            <input
              type="radio"
              id={`question-${id}-choiceB`}
              name={`question-${id}`}
              value={choiceB}
              checked={selectedChoice === choiceB}
              onChange={handleChoiceChange}
            />
            <label htmlFor={`question-${id}-choiceB`}>{choiceB}</label>
          </div>
        </div>
        <div className="choice-item">
          <div className="custom-radio">
            <input
              type="radio"
              id={`question-${id}-choiceC`}
              name={`question-${id}`}
              value={choiceC}
              checked={selectedChoice === choiceC}
              onChange={handleChoiceChange}
            />
            <label htmlFor={`question-${id}-choiceC`}>{choiceC}</label>
          </div>
        </div>
        <div className="choice-item">
          <div className="custom-radio">
            <input
              type="radio"
              id={`question-${id}-choiceD`}
              name={`question-${id}`}
              value={choiceD}
              checked={selectedChoice === choiceD}
              onChange={handleChoiceChange}
            />
            <label htmlFor={`question-${id}-choiceD`}>{choiceD}</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;