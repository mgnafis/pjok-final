// Load questions from JSON file
let allQuestions = [];
let examQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = null;
let timerInterval = null;

// DOM elements
const startScreen = document.getElementById('start-screen');
const examScreen = document.getElementById('exam-screen');
const resultsScreen = document.getElementById('results-screen');
const startExamBtn = document.getElementById('start-exam-btn');
const submitExamBtn = document.getElementById('submit-exam-btn');
const restartExamBtn = document.getElementById('restart-exam-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionCounter = document.getElementById('question-counter');
const timer = document.getElementById('timer');
const questionNumbers = document.getElementById('question-numbers');

// Load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        allQuestions = await response.json();
        console.log(`Loaded ${allQuestions.length} questions`);
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Error loading questions. Please check if questions.json file exists.');
    }
}

// Shuffle array function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Select random questions for exam
function selectRandomQuestions() {
    const shuffled = shuffleArray(allQuestions);
    examQuestions = shuffled.slice(0, 40);
    userAnswers = new Array(40).fill(null);
    console.log('Selected 40 random questions for exam');
}

// Start exam
function startExam() {
    if (allQuestions.length === 0) {
        alert('Questions not loaded yet. Please wait and try again.');
        return;
    }
    
    selectRandomQuestions();
    currentQuestionIndex = 0;
    startTime = new Date();
    
    startScreen.classList.add('hidden');
    examScreen.classList.remove('hidden');
    
    createQuestionNumbers();
    displayQuestion();
    startTimer();
}

// Create question number navigation
function createQuestionNumbers() {
    questionNumbers.innerHTML = '';
    for (let i = 0; i < examQuestions.length; i++) {
        const numberBtn = document.createElement('div');
        numberBtn.className = 'question-number';
        numberBtn.textContent = i + 1;
        numberBtn.addEventListener('click', () => goToQuestion(i));
        questionNumbers.appendChild(numberBtn);
    }
    updateQuestionNumbers();
}

// Update question number indicators
function updateQuestionNumbers() {
    const numberBtns = questionNumbers.querySelectorAll('.question-number');
    numberBtns.forEach((btn, index) => {
        btn.classList.remove('current', 'answered');
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        }
        if (userAnswers[index] !== null) {
            btn.classList.add('answered');
        }
    });
}

// Display current question
function displayQuestion() {
    const question = examQuestions[currentQuestionIndex];
    questionText.innerHTML = question.question;
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${examQuestions.length}`;
    
    // Create options
    optionsContainer.innerHTML = '';
    question.choices.forEach((choice, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'answer';
        radio.value = choice.letter;
        radio.id = `option-${index}`;
        
        // Check if this option was previously selected
        if (userAnswers[currentQuestionIndex] === choice.letter) {
            radio.checked = true;
        }
        
        radio.addEventListener('change', () => {
            userAnswers[currentQuestionIndex] = choice.letter;
            updateQuestionNumbers();
        });
        
        const label = document.createElement('label');
        label.htmlFor = `option-${index}`;
        label.textContent = `${choice.letter}. ${choice.text}`;
        
        optionDiv.appendChild(radio);
        optionDiv.appendChild(label);
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update navigation buttons
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === examQuestions.length - 1;
    
    updateQuestionNumbers();
}

// Go to specific question
function goToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < examQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timer.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Submit exam
function submitExam() {
    const unanswered = userAnswers.filter(answer => answer === null).length;
    
    if (unanswered > 0) {
        const confirm = window.confirm(`You have ${unanswered} unanswered questions. Do you want to submit anyway?`);
        if (!confirm) return;
    }
    
    stopTimer();
    calculateResults();
    showResults();
}

// Calculate exam results
function calculateResults() {
    let correct = 0;
    let incorrect = 0;
    
    examQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correct_answer;
        
        if (userAnswer === correctAnswer) {
            correct++;
        } else if (userAnswer !== null) {
            incorrect++;
        }
    });
    
    const percentage = Math.round((correct / examQuestions.length) * 100);
    
    document.getElementById('score-percentage').textContent = `${percentage}%`;
    document.getElementById('correct-count').textContent = correct;
    document.getElementById('incorrect-count').textContent = incorrect;
    document.getElementById('total-count').textContent = examQuestions.length;
}

// Show results screen
function showResults() {
    examScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    displayReview();
}

// Display answer review
function displayReview() {
    const reviewContainer = document.getElementById('review-container');
    reviewContainer.innerHTML = '';
    
    examQuestions.forEach((question, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correct_answer;
        const isCorrect = userAnswer === correctAnswer;
        
        reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Question
        const questionDiv = document.createElement('div');
        questionDiv.className = 'review-question';
        questionDiv.innerHTML = `${index + 1}. ${question.question}`;
        reviewItem.appendChild(questionDiv);
        
        // Answers
        const answersDiv = document.createElement('div');
        answersDiv.className = 'review-answers';
        
        // User answer
        const userAnswerDiv = document.createElement('div');
        userAnswerDiv.className = `user-answer ${isCorrect ? 'correct' : (userAnswer ? 'incorrect' : 'no-answer')}`;
        
        if (userAnswer) {
            const userChoice = question.choices.find(choice => choice.letter === userAnswer);
            userAnswerDiv.textContent = `Your answer: ${userAnswer}. ${userChoice ? userChoice.text : ''}`;
        } else {
            userAnswerDiv.textContent = 'Your answer: No answer selected';
        }
        answersDiv.appendChild(userAnswerDiv);
        
        // Correct answer (if user was wrong)
        if (!isCorrect) {
            const correctAnswerDiv = document.createElement('div');
            correctAnswerDiv.className = 'correct-answer';
            const correctChoice = question.choices.find(choice => choice.letter === correctAnswer);
            correctAnswerDiv.textContent = `Correct answer: ${correctAnswer}. ${correctChoice ? correctChoice.text : ''}`;
            answersDiv.appendChild(correctAnswerDiv);
        }
        
        reviewItem.appendChild(answersDiv);
        reviewContainer.appendChild(reviewItem);
    });
}

// Restart exam
function restartExam() {
    resultsScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    // Reset variables
    currentQuestionIndex = 0;
    userAnswers = [];
    examQuestions = [];
    startTime = null;
    
    // Reset timer display
    timer.textContent = 'Time: 00:00';
}

// Event listeners
startExamBtn.addEventListener('click', startExam);
submitExamBtn.addEventListener('click', submitExam);
restartExamBtn.addEventListener('click', restartExam);
prevBtn.addEventListener('click', previousQuestion);
nextBtn.addEventListener('click', nextQuestion);

// Load questions when page loads
document.addEventListener('DOMContentLoaded', loadQuestions);

