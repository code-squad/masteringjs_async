function $(selector) {
    return document.querySelector(selector);
}

function appendReply({content, writer, date, answerId}) {
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

    const base = $('ul.answers');
    base.innerHTML = `${base.innerHTML} ${commentHTML}`;
}

// 이벤트등록
function initEvents() {
    addLoginEvent();
    addLogoutEvent();
    addReplyAppendEvent();
    // addReplyRemoveEvent();
}

function addLoginEvent() {
    $('.login-btn').addEventListener('click', ({target: {outerText}}) => {
        if(outerText !== 'LOGIN') return;
        
        const content = Object.assign({}, {user: 'namdeng_2'});
        const clientData = Object.assign({}, {
            url: 'http://127.0.0.1:3000/api/login',
            method: 'post',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            content: content,
            callback: loginCallback
        })

        fetchManager(clientData);
    });
}

function loginCallback({login}) {
    if(login === 'ok') {
        alert('로그인 되었습니다.');
        $('.login-btn').innerText = 'LOGOUT';
    } else alert('로그인에 실패 하였습니다.');
    
    return fetchLogging('login');
}

function addLogoutEvent() {
    $('.login-btn').addEventListener('click', ({target: {outerText}}) => {
        if(outerText !== 'LOGOUT') return;
        
        const content = Object.assign({}, { command: 'deletesession' });
        const clientData = Object.assign({}, {
            url: 'http://127.0.0.1:3000/api/session',
            method: 'delete',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            content: content,
            callback: logoutCallback
        })

        fetchManager(clientData);
    });
}

function logoutCallback({result}) {
    if(result === 'ok') {
        alert('로그아웃 되었습니다.');
        $('.login-btn').innerText = 'LOGIN';
    } else alert('로그아웃에 실패 하였습니다.');

    return fetchLogging('logout');
}

function addReplyAppendEvent() {
    $('input[type="button"]').addEventListener('click', evt => {
        const inputText = $('textarea.form-control').value;
        const content = Object.assign({}, {content: inputText});
        const clientData = Object.assign({}, {
            url: 'http://127.0.0.1:3000/api/questions/1/answers',
            method: 'post',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            content: content,
            callback: appendReply
        })

        fetchManagerAsync(clientData);
        clearTextArea('textarea.form-control');
    });
}

function clearTextArea(selector) {
    $(selector).value = '';
}

function addReply(selector, html) {
    const base = $(selector);
    const temp = `${base.innerHTML} ${html}`; 
    base.innerHTML = temp;
}

function fetchManager({url, method, headers, content, callback}) {
    return fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(content),
    })
    .then(checkHttpStatus)
    .then(getJson)
    .then(callback)
    .catch(error => alert('에러가 발생하였습니다.' + error));
}

async function fetchManagerAsync({url, method, headers, content, callback}) {
    return await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(content),
    })
    .then(checkHttpStatus)
    .then(getJson)
    .then(callback)
    .catch(error => alert('에러가 발생하였습니다.' + error));
}

function fetchLogging(type) {
    const content = Object.assign({}, {logType: type});
    return fetch('http://127.0.0.1:3000/api/logging', {
        method: 'post',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(content)
    })
    .then(checkHttpStatus)
    .then(getJson)
    .then(({loggin}) => console.log('loggin :', loggin))
    .catch(error => alert('에러가 발생하였습니다.' + error));
}

function checkHttpStatus(response) {
    const {status, statusText} = response;
    if(status >= 200 && status < 300) return Promise.resolve(response);
    else return Promise.reject(new Error(statusText));
}

function getJson(response) {
    return response.json();
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
    fetchLogging('add reply');
})
