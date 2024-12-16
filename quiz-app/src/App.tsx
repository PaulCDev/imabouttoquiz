// Main React Component (App.tsx)
import React, { useState, useEffect } from 'react';
import './App.css';

interface QuizQuestion {
  question: string;
  choices: { [key: string]: string };
  correct_answer: string;
  difficulty: string;
};

interface ResultDetail {
  question: string;
  selectedAnswer: string;
  selectedAnswerText: string;
  correctAnswer: string;
  correctAnswerText: string;
  isCorrect: boolean;
}

const ComingSoonPage = () => {
  const text = "Coming Soon...";
  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="container">
        <h1 className="title">IM ABOUT TO QUIZ</h1>
        <div className="animated-text">
          {text.split('').map((char, index) => (
            <span
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const PlayQuizPage = ({ fetchQuiz }: { fetchQuiz: () => void }) => {
  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="container">
        <h1 className="title">IM ABOUT TO QUIZ</h1>
        <button 
          type="button"
          className="play-button" 
          onTouchStart={() => {
            console.log("touched!");
            fetchQuiz;
          }}
          onClick={fetchQuiz}
          >Play
        </button>
      </div>
    </div>
  );
};

const QuizPage = ({ quizData, onFinish }: { quizData: QuizQuestion[]; onFinish: (results: ResultDetail[]) => void }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<ResultDetail[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentQuestion = quizData[currentQuestionIndex];

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === currentQuestion.correct_answer;

    // Add result to results array
    setResults((prevResults) => [
      ...prevResults,
      {
        question: currentQuestion.question,
        selectedAnswer: choice,
        selectedAnswerText: currentQuestion.choices[choice],
        correctAnswer: currentQuestion.correct_answer,
        correctAnswerText: currentQuestion.choices[currentQuestion.correct_answer],
        isCorrect: isCorrect,
      },
    ]);

    setFeedback(isCorrect ? "Correct!" : `Incorrect! The correct answer was ${currentQuestion.choices[currentQuestion.correct_answer]}.`);

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex + 1 < quizData.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        onFinish(results.concat({
          question: currentQuestion.question,
          selectedAnswer: choice,
          selectedAnswerText: currentQuestion.choices[choice],
          correctAnswer: currentQuestion.correct_answer,
          correctAnswerText: currentQuestion.choices[currentQuestion.correct_answer],
          isCorrect: isCorrect,
        }));
      }
    }, 2000);
  };

  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="quiz-container">
        <h1 className="title top">Im About To Quiz</h1>
        <div className="question">
          <h2>{currentQuestion.question}</h2>
          <div className="choices">
            {Object.entries(currentQuestion.choices).map(([key, value]) => (
              <button key={key} onClick={() => handleAnswer(key)} className="choice-button">
                {key}: {value}
              </button>
            ))}
          </div>
        </div>
        {feedback && <div className="feedback">{feedback}</div>}
      </div>
    </div>
  );
};

const ResultsPage = ({ results }: { results: ResultDetail[] }) => {
  const score = results.filter((result) => result.isCorrect).length;
  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="container">
        <h1 className="title">Im About To Quiz Results</h1>
        <p>You scored {score} out of {results.length}!</p>
        <div className="results-summary">
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <p><strong>Question:</strong> {result.question}</p>
              <p><strong>Your Answer:</strong> {result.selectedAnswer} - {result.selectedAnswerText}</p>
              <p><strong>Correct Answer:</strong> {result.correctAnswer} - {result.correctAnswerText}</p>
              <p><strong>Result:</strong> {result.isCorrect ? "Correct" : "Incorrect"}</p>
              <hr />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isComingSoon, setIsComingSoon] = useState(true);
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ResultDetail[]>([]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch('https://monkfish-app-6xb33.ondigitalocean.app/api/quiz'); // Replace with actual API address
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      const quiz = await response.json();
      console.log('Fetched quiz:', quiz);
      setQuizData(quiz.quiz);
      // Here you can update state or route to the quiz page
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const handleFinish = (finalResults: ResultDetail[]) => {
    setResults(finalResults);
    setShowResults(true);
  };

  useEffect(() => {
    // Logic to determine if "Coming Soon" should be shown
    const releaseDate = new Date('2023-12-10'); // Replace with your release date
    const now = new Date();

    console.log(now, " ", releaseDate);
    if (now >= releaseDate) {
      setIsComingSoon(false);
    }
  }, []);

  if (isComingSoon) {
    return <ComingSoonPage />;
  }

  if (showResults) {
    return <ResultsPage results={results} />;
  }

  if (quizData) {
    return <QuizPage quizData={quizData} onFinish={handleFinish} />;
  }

  return <PlayQuizPage fetchQuiz={fetchQuiz} />;
};

export default App;