// Global variables
let emails = [];            // will be loaded from emails.json
let filteredEmails = [];
let currentEmail = null;
let score = 0;
let totalAnswered = 0;

// DOM references
const emailListEl = document.getElementById('emailList');
const emailContentEl = document.getElementById('emailContent');
const actionsEl = document.getElementById('actions');
const feedbackEl = document.getElementById('feedback');
const scoreValueEl = document.getElementById('scoreValue');
const gameContainer = document.querySelector('.game-container');
const summaryEl = document.querySelector('.summary');
const finalScoreEl = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const startBtn = document.getElementById('startGameBtn');
const reasonEl = document.getElementById('reason');

// Initial button states
startBtn.disabled = true; // will enable after emails load
playAgainBtn.addEventListener('click', resetGame);

// Fetch emails from external JSON
fetch('emails.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    emails = data;
    console.log('✅ Emails loaded successfully:', emails);
    // Now enable the Start button
    startBtn.disabled = false;
  })
  .catch(error => {
    console.error('❌ Failed to load emails.json:', error);
    alert('Error loading email dataset. Check console for details.');
  });

// Event listeners
document.getElementById('startGameBtn').addEventListener('click', startGame);
document.getElementById('safeBtn').addEventListener('click', () => checkAnswer(false));
document.getElementById('scamBtn').addEventListener('click', () => checkAnswer(true));

function startGame() {
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  filteredEmails = emails.filter(e => e.difficulty === difficulty);

  if (filteredEmails.length === 0) {
    alert('No emails found for difficulty: ' + difficulty);
    return;
  }

  renderInbox();
  document.querySelector('.level-select').style.display = 'none';
  gameContainer.style.display = 'flex';
  summaryEl.style.display = 'none';

  feedbackEl.textContent = '';
  reasonEl.textContent = '';
  actionsEl.style.display = 'none';
}

function renderInbox() {
  emailListEl.innerHTML = '';
  filteredEmails.forEach((email, index) => {
    const li = document.createElement('li');
    li.classList.add('email-item');
    li.innerHTML = `
      <div class="email-sender">${email.sender}</div>
      <div class="email-subject">${email.subject}</div>
      <div class="email-preview">${email.body.slice(0, 60)}...</div>
    `;
    li.addEventListener('click', () => openEmail(index));
    emailListEl.appendChild(li);
  });
}

function openEmail(index) {
  currentEmail = filteredEmails[index];
  const hoverDomain = currentEmail.actualDomain || currentEmail.sender;

  emailContentEl.innerHTML = `
    <strong>From:</strong> 
    <span class="sender-tooltip" title="Actual domain: ${hoverDomain}">
      ${currentEmail.sender}
    </span><br>
    <strong>Subject:</strong> ${currentEmail.subject}<br><br>
    ${currentEmail.body}
  `;

  actionsEl.style.display = 'block';
  feedbackEl.textContent = '';
  reasonEl.textContent = '';

  document.getElementById('safeBtn').disabled = false;
  document.getElementById('scamBtn').disabled = false;
}

function checkAnswer(playerChoiceIsScam) {
  if (!currentEmail) return;

  document.getElementById('safeBtn').disabled = true;
  document.getElementById('scamBtn').disabled = true;

  const correct = currentEmail.isScam === playerChoiceIsScam;
  feedbackEl.innerHTML = correct ? "✅ <span>Correct!</span>" : "❌ <span>Incorrect!</span>";
  feedbackEl.style.color = correct ? "green" : "red";

  if (currentEmail.reason) {
    reasonEl.textContent = currentEmail.reason;
  } else {
    reasonEl.textContent = "";
  }

  totalAnswered++;
  if (correct) score++;
  scoreValueEl.textContent = score;
  filteredEmails = filteredEmails.filter(e => e !== currentEmail);
  renderInbox();

  if (filteredEmails.length === 0) {
    endLevel();
  }
}

function endLevel() {
  gameContainer.style.display = 'none';
  summaryEl.style.display = 'block';
  finalScoreEl.textContent = `You scored ${score} out of ${totalAnswered}!`;
}

function resetGame() {
  document.querySelector('.level-select').style.display = 'block';
  gameContainer.style.display = 'none';
  summaryEl.style.display = 'none';
  reasonEl.textContent = '';
  feedbackEl.textContent = '';
}

// draggable window behavior
(function () {
  const windowEl = document.getElementById('emailWindow');
  const titleBar = document.getElementById('titleBar');
  let offsetX = 0, offsetY = 0, isDragging = false;

  titleBar.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - windowEl.offsetLeft;
    offsetY = e.clientY - windowEl.offsetTop;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    windowEl.style.left = (e.clientX - offsetX) + 'px';
    windowEl.style.top = (e.clientY - offsetY) + 'px';
    windowEl.style.transform = 'none';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = 'auto';
  });
})();
