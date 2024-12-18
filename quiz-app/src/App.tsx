import React, { useState, useEffect } from 'react';
import './App.css';

interface QuizQuestion {
  question: string;
  choices: { [key: string]: string };
  correct_answer: string;
  difficulty: string;
}

interface ResultDetail {
  question: string;
  selectedAnswer: string;
  selectedAnswerText: string;
  correctAnswer: string;
  correctAnswerText: string;
  isCorrect: boolean;
}

const QUIZ_STORAGE_KEY = 'dailyQuiz';
const QUIZ_STATE_KEY = 'quizState';

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
};

const PlayQuizPage = ({ fetchQuiz }: { fetchQuiz: () => void }) => {
  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="centered-container">
        <h1 className="title">IM ABOUT TO QUIZ</h1>
        <button 
          type="button"
          className="play-button" 
          onClick={fetchQuiz}
        >
          Play
        </button>
      </div>
    </div>
  );
};

const QuizPage = ({
  quizData,
  currentQuestionIndex,
  // @ts-ignore
  userAnswers,
  onAnswer,
  onFinish,
}: {
  quizData: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: ResultDetail[];
  onAnswer: (result: ResultDetail, currentIndex: number) => void;
  onFinish: () => void;
}) => {
  const currentQuestion = quizData[currentQuestionIndex];
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleAnswer = (choice: string) => {
    if (isDisabled) return;
    setIsDisabled(true);

    const isCorrect = choice === currentQuestion.correct_answer;
    const result: ResultDetail = {
      question: currentQuestion.question,
      selectedAnswer: choice,
      selectedAnswerText: currentQuestion.choices[choice],
      correctAnswer: currentQuestion.correct_answer,
      correctAnswerText: currentQuestion.choices[currentQuestion.correct_answer],
      isCorrect: isCorrect,
    };

    setFeedback(isCorrect ? "Correct!" : `Incorrect! The correct answer was ${result.correctAnswerText}.`);
    setTimeout(() => {
      setFeedback(null);
      setIsDisabled(false);

      onAnswer(result, currentQuestionIndex);
    }, 2000);
  };

  useEffect(() => {
    if (feedback === null && isDisabled === false && currentQuestionIndex >= quizData.length) {
      onFinish();
    }
  }, [feedback, isDisabled, currentQuestionIndex, quizData.length, onFinish]);

  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="quiz-container">
        <h1 className="title top">IM ABOUT TO QUIZ</h1>
        <div className="question">
          <h2>{currentQuestion.question}</h2>
          <div className="choices">
            {Object.entries(currentQuestion.choices).map(([key, value]) => (
              <button
                key={`${currentQuestionIndex}-${key}`}
                onClick={() => handleAnswer(key)}
                className="choice-button"
                disabled={isDisabled}
              >
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
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const score = results.filter((result) => result.isCorrect).length;

  const shareResults = () => {
    const emojiResults = results
      .map((result) => (result.isCorrect ? '✅' : '❌'))
      .join('');
    const shareText = `I'm About To Quiz Results\nScored ${score}/${results.length}\n${emojiResults}\nimabouttoquiz.com`;
  
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopyMessage('Results copied to clipboard!');
        setTimeout(() => setCopyMessage(null), 3000);
      }).catch(() => {
        fallbackCopyToClipboard(shareText);
      });
    } else {
      fallbackCopyToClipboard(shareText);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
  
    // Avoid the textarea being visible
    textArea.style.position = 'fixed'; // Prevent scrolling to the bottom of the page
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '1px';
    textArea.style.height = '1px';
    textArea.style.opacity = '0';
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      document.execCommand('copy');
      setCopyMessage('Results copied to clipboard!');
    } catch (err) {
      setCopyMessage('Failed to copy results to clipboard.');
    }
  
    document.body.removeChild(textArea);
    setTimeout(() => setCopyMessage(null), 3000);
  };

  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="container">
        <h1 className="title">IM ABOUT TO QUIZ</h1>
        <p>You scored {score} out of {results.length}!</p>
        <button onClick={shareResults} className="share-button">Share</button>
        {copyMessage && <div className="copy-message">{copyMessage}</div>}
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<ResultDetail[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [playStarted, setPlayStarted] = useState(false);

  const fetchQuiz = async () => {
    try {
      console.log("Fetching Quiz from server!");
      //const response = await fetch('https://monkfish-app-6xb33.ondigitalocean.app/api/quiz');
      const response = await fetch('http://192.168.0.6:5000/api/quiz');
      if (!response.ok) throw new Error('Failed to fetch quiz');
      const quiz = await response.json();

      console.log(quiz);

      const quizInfo = { quiz: quiz.quiz.slice(0, 5), date: quiz.date }; // Ensure only 5 questions are used
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizInfo));
      setQuizData(quizInfo.quiz);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setShowResults(false);
      setPlayStarted(true);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const loadStoredQuiz = () => {
    const storedQuiz = localStorage.getItem(QUIZ_STORAGE_KEY);
    const storedState = localStorage.getItem(QUIZ_STATE_KEY);

    if (storedQuiz) {
      const { quiz, date } = JSON.parse(storedQuiz);
      const isOutdated = new Date().toDateString() !== new Date(date).toDateString();

      if (!isOutdated) {
        setQuizData(quiz);
        if (storedState) {
          const { currentIndex, answers, completed } = JSON.parse(storedState);
          setCurrentQuestionIndex(currentIndex);
          setUserAnswers(answers);
          setShowResults(completed);
          setPlayStarted(true);
        }
      } else {
        localStorage.removeItem(QUIZ_STORAGE_KEY);
        localStorage.removeItem(QUIZ_STATE_KEY);
        setQuizData(null);
        setPlayStarted(false);
      }
    }
  };

  const handleAnswer = (result: ResultDetail, currentIndex: number) => {
    console.log("handle answer");
    const updatedAnswers = [...userAnswers, result];
    setUserAnswers(updatedAnswers);

    const isLastQuestion = currentIndex + 1 >= quizData!.length;
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentIndex + 1);
      localStorage.setItem(
        QUIZ_STATE_KEY,
        JSON.stringify({ currentIndex: currentIndex + 1, answers: updatedAnswers, completed: false })
      );
    } else {
      setShowResults(true);
    }
    localStorage.setItem(
      QUIZ_STATE_KEY,
      JSON.stringify({ currentIndex: currentIndex + 1, answers: updatedAnswers, completed: isLastQuestion })
    );
  };

  const handleFinish = () => {
    console.log("handle finish");
    setShowResults(true);
  };

  useEffect(() => {
    console.log("Using effect...");
    const releaseDate = new Date('2023-12-10');
    const now = new Date();
    if (now >= releaseDate) setIsComingSoon(false);
    loadStoredQuiz();
  }, []);

  if (isComingSoon) return <ComingSoonPage />;
  if (!playStarted) return <PlayQuizPage fetchQuiz={fetchQuiz} />;
  if (showResults) return <ResultsPage results={userAnswers} />;
  if (quizData) return (
    <QuizPage
      quizData={quizData}
      currentQuestionIndex={currentQuestionIndex}
      userAnswers={userAnswers}
      onAnswer={handleAnswer}
      onFinish={handleFinish}
    />
  );

  return null;
};

export default App;
