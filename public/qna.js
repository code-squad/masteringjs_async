'use strict';

function $(selector) {
    return document.querySelector(selector);
}

function appendAnswer({content, writer, date, answerId}) {
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

// 로그아웃 이벤트 리스너
function logoutListener(evt) {
    const loginButtonEl = evt.currentTarget;

    const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/json');

    const myInit = {
        method: 'DELETE',
        headers: myHeaders,
        body: JSON.stringify( {command:'deletesession'})
    };

    fetch('/api/session', myInit).then((res) => {
        if(res.ok) {
            return res.json();
        }
        throw 'fail logout!!';
    }).then((json) => {
        if(json.result === 'ok') {
            loginButtonEl.innerText = 'LOGIN';
            loginButtonEl.removeEventListener('click', logoutListener);
            loginButtonEl.addEventListener('click', loginListener);
            return false;
        }
        throw 'fail logout!!';
    }).catch((err) => {
        alert(err.message);
    });
};

function loginListener(evt) {
    const loginButtonEl = evt.currentTarget;

    const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/json');

    const myInit = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({user: 'jjori.master'})
    };

    fetch('/api/login', myInit).then((res) => {
        if(res.ok) {
            return res.json();
        }
        throw 'fail login!!';
    }).then((json) => {
        if(json.login === 'ok') {
            loginButtonEl.innerText = 'LOGOUT';
            loginButtonEl.removeEventListener('click', loginListener);
            loginButtonEl.addEventListener('click', logoutListener);
            return false;
        }
        throw 'fail login!!';
    }).catch((err) => {
        alert(err.description);
    });
}

function initEvents() {
    //이벤트등록

    // 세션 상태 확인??
    const loginButtonEl = document.querySelector('header .login-btn');
    loginButtonEl.addEventListener('click', loginListener);
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
});
