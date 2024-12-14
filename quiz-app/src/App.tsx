// Main React Component (App.tsx)
import React, { useState, useEffect } from 'react';
import './App.css';

interface QuizQuestion {
  question: string;
  choices: { [key: string]: string };
  correct_answer: string;
  difficulty: string;
}

const ComingSoonPage = () => {
  const text = "Coming Soon...";
  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="container">
        <h1 className="title">IM ABOUT TO QUIZ 💦</h1>
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
        <h1 className="title">IM ABOUT TO QUIZ 💦</h1>
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

const QuizPage = ({ quizData, onFinish }: { quizData: QuizQuestion[]; onFinish: (score: number) => void }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentQuestion = quizData[currentQuestionIndex];

  const handleAnswer = (choice: string) => {
    if (choice === currentQuestion.correct_answer) {
      setFeedback("Correct!");
      setScore(score + 1);
    } else {
      setFeedback(`Incorrect! The correct answer was ${currentQuestion.correct_answer}.`);
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex + 1 < quizData.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        onFinish(score);
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

const ResultsPage = ({ score, total }: { score: number; total: number }) => {
  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="container">
        <h1 className="title">Quiz Results</h1>
        <p>You scored {score} out of {total}!</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isComingSoon, setIsComingSoon] = useState(true);
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const fetchQuiz = async () => {
    try {
      const response = await fetch('http://192.168.0.6:5000/api/quiz'); // Replace with actual API address
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

  const handleFinish = (finalScore: number) => {
    setScore(finalScore);
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
    return <ResultsPage score={score} total={quizData?.length || 0} />;
  }

  if (quizData) {
    return <QuizPage quizData={quizData} onFinish={handleFinish} />;
  }

  return <PlayQuizPage fetchQuiz={fetchQuiz} />;
};

export default App;