import React, { useState, useEffect } from 'react';
import './App.css';

let devMode = true;
let api_url = "http://192.168.0.6:5000"
if(!devMode){
  api_url = "https://monkfish-app-6xb33.ondigitalocean.app"
}

interface QuizQuestion {
  text: string;
  options: string[];
  correct_option: number;
  difficulty: string;
  categories: string[];
  id: number;
}

interface ResultDetail {
  question: string;
  selectedAnswer: string;
  selectedAnswerText: string;
  correctAnswer: string;
  correctAnswerText: string;
  isCorrect: boolean;
  difficulty: string;
  categories: string[];
  id: number;
}

const QUIZ_STORAGE_KEY = 'dailyQuiz';
const QUIZ_STATE_KEY = 'quizState';
const SESSION_KEY = 'sessionId';

const PlayQuizPage = ({ fetchQuiz }: { fetchQuiz: () => void; }) => {
  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="centered-container">
        <h1 className="title">IM ABOUT TO QUIZ</h1>
        <h2 className="sub-title">The Ultimate Daily Quiz Challenge!</h2>
        <button type="button" className="play-button" onClick={fetchQuiz}>
          Play
        </button>
      </div>
    </div>
  );
};

// @ts-ignore
const QuizPage = ({quizData,quizNo,currentQuestionIndex,userAnswers,onAnswer,onFinish,}: {
  quizData: QuizQuestion[];
  quizNo: number;
  currentQuestionIndex: number;
  userAnswers: ResultDetail[];
  onAnswer: (result: ResultDetail, currentIndex: number) => void;
  onFinish: () => void;
  }) => {
    const currentQuestion = quizData[currentQuestionIndex];
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isDisabled, setIsDisabled] = useState(false);

    const progressPercentage = ((currentQuestionIndex + 1) / quizData.length) * 100;

    const handleAnswer = (choiceIndex: number) => {
      if (isDisabled) return;
      setIsDisabled(true);

      const isCorrect = choiceIndex === currentQuestion.correct_option;
      const result: ResultDetail = {
        question: currentQuestion.text,
        //selectedAnswer: choiceIndex.toString(),                                       // Gives question index as a number
        selectedAnswer: String.fromCharCode(65 + choiceIndex),                          // Gives question index as a letter
        selectedAnswerText: currentQuestion.options[choiceIndex],
        //correctAnswer: currentQuestion.correct_option.toString(),                     // Gives question index as a number
        correctAnswer: String.fromCharCode(65 + currentQuestion.correct_option),        // Gives question index as a letter
        correctAnswerText: currentQuestion.options[currentQuestion.correct_option],
        isCorrect: isCorrect,
        difficulty: currentQuestion.difficulty,
        categories: currentQuestion.categories,
        id: currentQuestion.id,
      };

      setFeedback(isCorrect ? "Correct!" : `Incorrect! The correct answer was ${result.correctAnswerText}.`);
      setTimeout(() => {
        setFeedback(null);
        setIsDisabled(false);

        onAnswer(result, currentQuestionIndex);
      }, 1000);
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
        <h1 className="title top">IM ABOUT TO QUIZ - {quizNo}</h1>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%`, position: 'relative' }}>
            <span className="progress-text">Q{currentQuestionIndex + 1}</span>
          </div>
        </div>

        <div className="question">
          <h2>{currentQuestion.text}</h2>
          <div className="choices">
            {currentQuestion.options.map((option, index) => (
              <button key={`${currentQuestionIndex}-${index}`} onClick={() => handleAnswer(index)} className="choice-button" disabled={isDisabled}>
                {String.fromCharCode(65 + index)}: {option}
              </button>
            ))}
          </div>
        </div>
        {feedback && <div className="feedback">{feedback}</div>}
      </div>
    </div>
  );
};

const ResultsPage = ({ results, quizNo }: { results: ResultDetail[], quizNo: number}) => {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const score = results.filter((result) => result.isCorrect).length;

  const shareResultsToClipboard = () => {
    const emojiResults = results
      .map((result) => (result.isCorrect ? '✅' : '❌'))
      .join('');
    const shareText = `I'm About To Quiz #${quizNo}\nScored ${score}/${results.length}\n${emojiResults}\nhttps://www.imabouttoquiz.com`;
  
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

  /*const shareResultsOnFacebook = () => {
    const score = results.filter((result) => result.isCorrect).length;
    const emojiResults = results.map((result) => (result.isCorrect ? '✅' : '❌')).join('');
    const shareText = `I'm About To Quiz #${quizNo}\nScored ${score}/${results.length}\n${emojiResults}`;
  
    const facebookFeedUrl = `https://www.facebook.com/dialog/feed?app_id=522572457492634&display=popup&link=https://imabouttoquiz.com&caption=${encodeURIComponent(
      'Check out my score!'
    )}&description=${encodeURIComponent(shareText)}&redirect_uri=https://imabouttoquiz.com`;
  
    window.open(facebookFeedUrl, '_blank', 'width=600,height=400');
  };*/

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
        <h1 className="title">IM ABOUT TO QUIZ - {quizNo}</h1>
        <p>You scored {score} out of {results.length}!</p>
        <button onClick={shareResultsToClipboard} className="erahs-button">Share</button>
        {copyMessage && <div className="copy-message">{copyMessage}</div>}
        <div className="results-summary">
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <p><strong>Question:</strong> {result.question}</p>
              <p><strong>Your Answer:</strong> {result.selectedAnswer} - {result.selectedAnswerText}</p>
              <p><strong>Correct Answer:</strong> {result.correctAnswer} - {result.correctAnswerText}</p>
              <p><strong>Categories:</strong> {result.categories.join(', ')}</p>
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
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<ResultDetail[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [playStarted, setPlayStarted] = useState(false);
  const [quizNo, setQuizNo] = useState<number>(0);

  const fetchQuiz = async () => {
    try {
      let sessionId = localStorage.getItem(SESSION_KEY);

      // Check sessionID with the server
      const sessionResponse = await fetch(api_url + '/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId})
      });

      if (!sessionResponse.ok) throw new Error('Failed to validate or create session');
      const sessionData = await sessionResponse.json();
      sessionId = sessionData.session_id;
      if (sessionId) {
        localStorage.setItem(SESSION_KEY, sessionId);
      } else {
        throw new Error('Session ID is invalid');
      }

      // Get quiz from server
      console.log("Fetching Quiz from server!");
      const response = await fetch(api_url + '/api/quiz', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch quiz');
      const quiz = await response.json();

      console.log(quiz);

      const quizData = quiz.questions.map((question: any) => ({
        text: question.text,
        id: question.id,
        options: question.options,
        correct_option: question.correct_option,
        difficulty: question.difficulty,
        categories: question.categories,
      }));

      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ quizData, date: quiz.scheduled_date, quizNo: quiz.id }));
      setQuizData(quizData);
      setCurrentQuestionIndex(0);
      setQuizNo(quiz.id);
      setUserAnswers([]);
      setShowResults(false);
      setPlayStarted(true);

    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const handleAnswer = (result: ResultDetail, currentIndex: number) => {
    const updatedAnswers = [...userAnswers, result];
    setUserAnswers(updatedAnswers);

    // Upload the current answer to the backend
    try {
      const sessionId = localStorage.getItem(SESSION_KEY); // Retrieve the session ID from local storage
      if (!sessionId) {
        throw new Error('Session ID not found');
      }

      const answerPayload = {
        session_id: sessionId,
        answers: [
          {
            question_id: quizData![currentIndex].id,
            answer_text: result.selectedAnswer, // Sending the selected answer text
          },
        ],
      };

      fetch(api_url + '/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerPayload),
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }

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
    setShowResults(true);
  };

  useEffect(() => {
    const storedQuiz = localStorage.getItem(QUIZ_STORAGE_KEY);
    const storedState = localStorage.getItem(QUIZ_STATE_KEY);

    if (storedQuiz) {
      const { quizData, date, quizNo } = JSON.parse(storedQuiz);
      //console.log("stored quiz date: ",new Date(date).toDateString()," | current date: ", new Date().toDateString());
      const isOutdated = new Date().toDateString() !== new Date(date).toDateString();

      if (!isOutdated) {
        setQuizData(quizData);
        setQuizNo(quizNo);
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
      }
    }
  }, []);

  if (!playStarted) return <PlayQuizPage fetchQuiz={fetchQuiz} />;
  if (showResults) return <ResultsPage results={userAnswers} quizNo={quizNo}/>;
  if (quizData) return (
    <QuizPage
      quizData={quizData}
      quizNo={quizNo}
      currentQuestionIndex={currentQuestionIndex}
      userAnswers={userAnswers}
      onAnswer={handleAnswer}
      onFinish={handleFinish}
    />
  );

  return null;
};

export default App;
