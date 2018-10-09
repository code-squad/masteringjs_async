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

// 이벤트등록
function initEvents() {
    addLoginEvent();
    addLogoutEvent();
    addReplyEvent();
}

function addLoginEvent() {
    $('.login-btn').addEventListener('click', ({target: {outerText}}) => {
        if(outerText !== 'LOGIN') return false;
        
        const content = Object.assign({}, {user: 'namdeng_2'});
        const clientData = Object.assign({}, {
            url: 'http://127.0.0.1:3000/api/login',
            method: 'post',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            content: content
        })

        fetchManager(clientData)
            .then(checkHttpStatus)
            .then(getJson)
            .then(({login}) => { 
                if(login === 'ok') {
                    alert('로그인 되었습니다.');
                    $('.login-btn').innerText = 'LOGOUT';
                } else alert('로그인에 실패 하였습니다.');
            })
            .catch(error => alert('에러가 발생하였습니다 : ' + error));
    });
}

function addLogoutEvent() {
    $('.login-btn').addEventListener('click', ({target: {outerText}}) => {
        if(outerText !== 'LOGOUT') return false;
        
        const content = Object.assign({}, { command: 'deletesession' });
        const clientData = Object.assign({}, {
            url: 'http://127.0.0.1:3000/api/session',
            method: 'delete',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            content: content
        })

        fetchManager(clientData)
            .then(checkHttpStatus)
            .then(getJson)
            .then(({result}) => { 
                if(result === 'ok') {
                    alert('로그아웃 되었습니다.');
                    $('.login-btn').innerText = 'LOGIN';
                } else alert('로그아웃에 실패 하였습니다.');
            })
            .catch(error => alert('에러가 발생하였습니다 : ' + error))
    });
}

function addReplyEvent() {
    $('input[type="button"]').addEventListener('click', evt => {
        const reply = $('textarea.form-control').value;

        const content = Object.assign({}, {content: reply});
        const clientData = Object.assign({}, {
            url: 'http://127.0.0.1:3000/api/questions/1/answers',
            method: 'post',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            content: content
        })

        fetchManager(clientData)
            .then(checkHttpStatus)
            .then(getJson)
            .then(appendAnswer)
            .then(html => {
                const answerUl = $('ul.answers');
                const temp = `${answerUl.innerHTML} ${html}`; 
                answerUl.innerHTML = temp;
            })
            .catch(error => alert('에러가 발생하였습니다 : \n' + error));
    });
}

function fetchManager({url, method, headers, content, callback}) {
    return fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(content),
        // TODO : callback 값 활용. 어떻게(?)
        callback: callback
    })
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
})
