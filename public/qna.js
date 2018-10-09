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
    addReplyAddEvent();
    addReplyDeleteEvent();
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
            content: content
        })

        fetchManagerAsync(clientData)
            .then(checkHttpStatus)
            .then(getJson)
            .then(({login}) => { 
                if(login === 'ok') {
                    alert('로그인 되었습니다.');
                    $('.login-btn').innerText = 'LOGOUT';
                } else alert('로그인에 실패 하였습니다.');
                
                return fetchLogging('login');
            })
            .then(response => console.log(response))
            .catch(error => alert('에러가 발생하였습니다 : ' + error));
    });
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
            content: content
        })

        fetchManagerAsync(clientData)
            .then(checkHttpStatus)
            .then(getJson)
            .then(({result}) => { 
                if(result === 'ok') {
                    alert('로그아웃 되었습니다.');
                    $('.login-btn').innerText = 'LOGIN';
                } else alert('로그아웃에 실패 하였습니다.');
        
                return fetchLogging('logout');
            })
            .catch(error => alert('에러가 발생하였습니다 : ' + error))
    });
}

function addReplyAddEvent() {
    $('input[type="button"]').addEventListener('click', evt => {
        const inputText = $('textarea.form-control').value;
        const content = Object.assign({}, {content: inputText});
        const clientData = Object.assign({}, {
            url: 'http://127.0.0.1:3000/api/questions/1/answers',
            method: 'post',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            content: content
        })

        fetchManagerAsync(clientData)
            .then(checkHttpStatus)
            .then(getJson)
            .then(appendAnswer)
            .then(reply => {
                addReply('ul.answers', reply);
                clearTextArea('textarea.form-control');

                return fetchLogging('add reply');
            })
            .catch(error => alert('에러가 발생하였습니다 : \n' + error));
    });
}

function addReplyDeleteEvent() {
    $('input[type="button"]').addEventListener('click', evt => {
        const inputText = $('textarea.form-control').value;
        const content = Object.assign({}, {content: inputText});
        const clientData = Object.assign({}, {
            url: 'http://127.0.0.1:3000/api/questions/1/answers',
            method: 'post',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            content: content
        })

        fetchManagerAsync(clientData)
            .then(checkHttpStatus)
            .then(getJson)
            .then(appendAnswer)
            .then(reply => {
                addReply('ul.answers', reply);
                clearTextArea('textarea.form-control');

                return fetchLogging('add reply');
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

async function fetchManagerAsync({url, method, headers, content, callback}) {
    return await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(content),
        // TODO : callback 값 활용. 어떻게(?)
        callback: callback
    })
}

function fetchLogging(type) {
    const content = Object.assign({}, {logType: type});
    return fetch('http://127.0.0.1:3000/api/logging', {
        method: 'post',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(content)
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

function clearTextArea(selector) {
    $(selector).value = '';
}

function addReply(selector, html) {
    const base = $(selector);
    const temp = `${base.innerHTML} ${html}`; 
    base.innerHTML = temp;
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
    fetchLogging('add reply');
})
