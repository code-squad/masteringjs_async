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

const REST = {
    get: (url) => {
        return fetchManager(url, 'GET', null);
    },

    post: (url, body) => {
        return fetchManager(url, 'POST', body);
    },

    put: (url, body) => {
        return fetchManager(url, 'PUT', body);
    },

    del: (url, body) => {
        return fetchManager(url, 'DELETE', body);
    }
};

function fetchManager(url, method, body) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const myInit = {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    };

    return fetch(url, myInit).then((res) => {
        if (res.ok) {
            return res.json();
        }
        throw 'response is not ok!!';
    });
}

// 로그아웃 이벤트 리스너
function logoutListener(evt) {
    REST.del('/api/session', {
        command: 'deletesession'
    }).then((json) => {
        if (json.result === 'ok') {
            evt.target.innerText = 'LOGIN';
            evt.target.removeEventListener('click', logoutListener);
            evt.target.addEventListener('click', loginListener);
            return false;
        }

        throw '로그아웃 실패!!';
    }).catch((err) => {
        console.error(err.message);
        alert('로그아웃에 실패하였습니다.');
    });
}

// 로그인 이벤트 리스너
function loginListener(evt) {
    REST.post('/api/login', {
        user: 'jjori.master'
    }).then((json) => {
        if (json.login === 'ok') {
            evt.target.innerText = 'LOGOUT';
            evt.target.removeEventListener('click', loginListener);
            evt.target.addEventListener('click', logoutListener);
            return false;
        }

        throw '로그인 실패!! json result is ' + json.result;
    }).catch((err) => {
        console.error(err.message);
        alert('로그인에 실패하였습니다.');
    });
}

function initEvents() {
    //이벤트등록

    // 로그인 이벤트 리스너 등록
    $('header .login-btn').addEventListener('click', loginListener);
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
});
