function $(selector) {
  return document.querySelector(selector);
}

function addLoginEvent() {
  const loginButton = $('.login-btn');
  loginButton.addEventListener("click", () => {
    if (loginButton.innerText === 'LOGIN') {
      logIn();
    } else {
      logOut();
    }
  })
}

function logIn() {
  fetchManagerAsync({
    url: '/api/login',
    method: 'POST',
    body: JSON.stringify({user: 'crong'}),
    headers:{
      'Content-Type': 'application/json'
    },
    callback: renderButtonText
  })
  .then(logging('Login'))
}

function logOut() {
  fetchManagerAsync({
    url: '/api/session',
    method: 'DELETE',
    body: JSON.stringify({'command':'deletesession'}),
    headers:{
      'Content-Type': 'application/json'
    },
    callback: renderButtonText
  })
  .then(logging('Logout'))
}

function renderButtonText() {
  const loginButton = $('.login-btn');
  if (loginButton.innerText === 'LOGIN') {
    loginButton.innerText = 'LOGOUT';
  } else {
    loginButton.innerText = 'LOGIN';
  }
}

function addAnswerFormEvent() {
  const answerForm = $('.answer-form');
  const answer = $('.form-control');
  answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (answer.value) {
      addAnswer(answer.value);
    } else {
      alert('내용을 입력해주세요.')
    }
    answer.value = '';
  })
}

function addAnswer(content) {
  fetchManagerAsync({
    url: '/api/questions/1/answers',
    method: 'POST',
    body: JSON.stringify({content}),
    headers:{
      'Content-Type': 'application/json'
    },
    callback: appendAnswer
  })
  .then(renderAnswer)
  .then(() => logging('Add answer'))
  .catch(error => {
    console.error(error);
  })
}

function appendAnswer({
  content,
  writer,
  date,
  answerId
}) {
  const commentHTML = `
    <li class="answer" data-id=${answerId}>
      <div class="answer-content"> ${content} </div>
      <div class="answer-metainfo">
        <div class="answer-id">${writer.id}</div>
        <div class="answer-date">${date}</div>
        <div class="answer-util">
          <a class="answer-delete" href="/api/questions/2/answers/${answerId}">삭제</a>
        </div>
      </div>
    </li> `

  return commentHTML;
}

function renderAnswer(htmlEl) {
  const answers = $('.answers');
  if (htmlEl) {
    answers.innerHTML = answers.innerHTML + htmlEl;
  }
}

function addAnswerListEvent() {
  const answers = $('.answers');
  answers.addEventListener('click', event => {
    event.preventDefault();
    delegateEventToChild(event)
  })
}

function delegateEventToChild(event) {
  if (event.target.tagName !== 'A') {
    return;
  }
  fetchManagerAsync({
    url: event.target.href,
    method: 'DELETE',
    headers:{
      'Content-Type': 'application/json'
    },
    callback: deleteAnswer
  })
  .then(logging('Delete answer'))
}

function deleteAnswer({answerid}) {
  const answers = $('.answers');
  const answerList = document.querySelectorAll('.answer');
  let nodeIndex;
  answerList.forEach((answer, index) => {
    if (answer.dataset.id === answerid) {
      nodeIndex = index;
    }
  })
  answers.removeChild(answers.children[nodeIndex]);
  alert('답변이 삭제되었습니다.')
}

function checkResponse(response) {
  // console.log('response:', response);
  if (response.status === 401) {
    alert ('인증되지 않은 사용자입니다. \n로그인 후 사용해주세요.');
    return Promise.reject('인증되지 않은 사용자입니다.'); 
  } else {
    return response.json();
  }
}

function logging(logType) {
  return new Promise((resolve, reject) => {
    if (logType) resolve(logType);
    else reject();
  })
  .then(loggingData)
}

function loggingData(logType) {
  fetchManagerAsync({
    url: '/api/logging',
    method: 'POST',
    body: JSON.stringify({logType}),
    headers:{
      'Content-Type': 'application/json'
    },
    callback: logResult
  })
}

function logResult(response) {
  console.log('loggin:', response.loggin);
}

function fetchManager({url, method, headers, body, callback}) {
  return fetch(url, {
    method,
    headers,
    body
  })
  .then(checkResponse)
  .then(callback)
  .catch(error => {
    console.error(error);
  })
}

async function fetchManagerAsync({url, method, headers, body, callback}) {
  try {
    const response = await fetch(url, {
      method,
      headers,
      body
    })
    const checkedResponse = await checkResponse(response);
    const callbackReturn = await callback(checkedResponse);
    return callbackReturn;
  } catch(error) {
    console.error(error);
  }
}

function initEvents() {
  //이벤트등록
  addLoginEvent();
  addAnswerFormEvent();
  addAnswerListEvent();
}

document.addEventListener("DOMContentLoaded", () => {
  initEvents();
})