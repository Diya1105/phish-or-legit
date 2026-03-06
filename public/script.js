// DOM Elements
const emailText = document.getElementById("email-text");
const legitBtn = document.getElementById("legit-btn");
const phishBtn = document.getElementById("phish-btn");
const feedback = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");

let timeLeft = 10;
let timer;

let score = 0;
let currentIndex = 0;
let emails = [];

// Shuffle emails
function shuffleEmails(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Load email
function loadEmail() {
    if (currentIndex < emails.length) {
        emailText.textContent = emails[currentIndex].message;
        feedback.textContent = "";
        legitBtn.disabled = false;
        phishBtn.disabled = false;
        startTimer();
    } else {
        endGame();
    }
}

// Start timer
function startTimer() {
    timeLeft = 10;
    timerDisplay.textContent = "Time Left: " + timeLeft + "s";

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = "Time Left: " + timeLeft + "s";

        if (timeLeft === 0) {
            clearInterval(timer);
            checkAnswer(null);
        }
    }, 1000);
}

// Check answer
function checkAnswer(userChoice) {
    clearInterval(timer);
    legitBtn.disabled = true;
    phishBtn.disabled = true;

    if (userChoice === null) {
        score -= 5;
        feedback.textContent = "Time's up! You failed to decide.";
        feedback.style.color = "orange";
        scoreDisplay.textContent = "Score: " + score;
        currentIndex++;

        setTimeout(loadEmail, 1500);
        return;
    }

   const correctAnswer = emails[currentIndex].isPhishing === 1;

    if (userChoice === correctAnswer) {
        score += 10;
        feedback.textContent = "Correct! " + emails[currentIndex].explanation;
        feedback.style.color = "green";
    } else {
        score -= 5;
        feedback.textContent = "Wrong! " + emails[currentIndex].explanation;
        feedback.style.color = "red";
    }

    scoreDisplay.textContent = "Score: " + score;
    currentIndex++;

    setTimeout(loadEmail, 1500);
}

// End game
function endGame() {
    clearInterval(timer);
    timerDisplay.textContent = "";
    emailText.textContent = "Game Over!";

    let rating;

    if (score >= 25) {
        rating = "Cybersecurity Genius 🧠";
    } else if (score >= 10) {
        rating = "Security Aware 👍";
    } else {
        rating = "Easily Phishable 😬";
    }

    feedback.textContent = "Final Score: " + score + " | " + rating;

    legitBtn.style.display = "none";
    phishBtn.style.display = "none";

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Restart Game";
    restartBtn.style.marginTop = "15px";
    restartBtn.onclick = () => location.reload();

    document.querySelector(".container").appendChild(restartBtn);
}

// Button events
legitBtn.addEventListener("click", () => checkAnswer(false));
phishBtn.addEventListener("click", () => checkAnswer(true));


const customInput = document.getElementById("custom-email");
const customBtn = document.getElementById("check-custom");
const customResult = document.getElementById("custom-result");

customBtn.addEventListener("click", () => {
    const message = customInput.value;

    fetch("http://localhost:5000/check-email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(data => {
        customResult.textContent =
            data.isPhishing
                ? "⚠️ Phishing Detected!"
                : "✅ Looks Legit!";
    })
    .catch(err => {
        console.error(err);
        customResult.textContent = "Error checking email.";
    });
});

// Fetch emails from backend
fetch("http://localhost:5000/emails")
    .then(response => response.json())
    .then(data => {
        emails = data;
        shuffleEmails(emails);
        loadEmail();
    })
    .catch(error => {
        console.error("Error loading emails:", error);
        emailText.textContent = "Failed to load emails.";
    });