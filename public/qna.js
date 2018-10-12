function $(selector) {
  return document.querySelector(selector);
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

function addLoginEvent() {
  const loginButton = $('.login-btn');
  loginButton.addEventListener("click", () => {
    if (loginButton.innerText === 'LOGIN') {
      logIn({user: 'hyeyoon'});
      loginButton.innerText = 'LOGOUT';
    } else {
      logOut({'command':'deletesession'});
      loginButton.innerText = 'LOGIN';
    }
  })
}

function logIn(data) {
  fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(data),
    headers:{
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('response:', response);
  })
  .catch(error => {
    console.error(error);
  })
}

function logOut(data) {
  fetch('/api/session', {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers:{
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('response:', response);
  })
  .catch(error => {
    console.error(error);
  })
}

function initEvents() {
  //이벤트등록
  addLoginEvent();
}

document.addEventListener("DOMContentLoaded", () => {
  initEvents();
})