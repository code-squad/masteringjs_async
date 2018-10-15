const $ = (selector) => document.querySelector(selector);
// 이벤트등록
const initEvents = () => {
    attachLoginEvent();
    attachLogoutEvent();
    attachAppendAnswerEvent();
    attachRemoveAnswerEvent();
}

const attachLoginEvent = () => {
    $('.login-btn').addEventListener('click', ({target: {outerText}}) => {
        if(outerText !== 'LOGIN') return;
        
        const clientData = {
            url: 'http://127.0.0.1:3000/api/login',
            method: 'post',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            content: {user: 'namdeng_2'},
            callback: login
        };
        fetchManager(clientData);
    });
}

const login = ({login}) => {
    if(login === 'ok') {
        alert('로그인 되었습니다.');
        $('.login-btn').innerText = 'LOGOUT';
    } else alert('로그인에 실패 하였습니다.');
    
    return fetchLogging('login');
}

const attachLogoutEvent = () => {
    $('.login-btn').addEventListener('click', ({target: {outerText}}) => {
        if(outerText !== 'LOGOUT') return;
        
        const clientData = {
            url: 'http://127.0.0.1:3000/api/session',
            method: 'delete',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            content: {command: 'deletesession'},
            callback: logout
        };
        fetchManager(clientData);
    });
}

const logout = ({result}) => {
    if(result === 'ok') {
        alert('로그아웃 되었습니다.');
        $('.login-btn').innerText = 'LOGIN';
    } else alert('로그아웃에 실패 하였습니다.');

    return fetchLogging('logout');
}

const attachAppendAnswerEvent = () => {
    $('input[type="submit"]').addEventListener('click', evt => {
        evt.preventDefault();

        const inputText = $('textarea.form-control').value;
        const clientData = {
            url: 'http://127.0.0.1:3000/api/questions/1/answers',
            method: 'post',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            content: {content: inputText},
            callback: appendAnswer
        };
        fetchManagerAsync(clientData);
        emptyTextArea('textarea.form-control');
    });
}

const appendAnswer = ({content, writer, date, answerId}) => {
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

    const answers = $('ul.answers');
    answers.innerHTML = `${answers.innerHTML} ${commentHTML}`;

    attachRemoveAnswerEvent();
}

const attachRemoveAnswerEvent = () => {
    const liList = document.querySelectorAll('ul.answers .answer-delete');
    Array.from(liList).forEach(li => {
        li.addEventListener('click', (evt) => {
            evt.preventDefault();

            const path = evt.target.getAttribute('href');
            if(window.confirm('답변을 삭제 하시겠습니까?')) {
                const url = `http://127.0.0.1:3000${path}`;
                const clientData = {
                    url: url,
                    method: 'delete',
                    callback: removeAnswer
                };
                fetchManagerAsync(clientData);
            }
        })
    });
}

const removeAnswer = ({answerid}) => alert(`${answerid}번 답변이 삭제되었습니다.`);
const emptyTextArea = selector => $(selector).value = '';
const fetchManager = ({url, method, headers, content, callback}) => {
    return fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(content),
    })
    .then(checkHttpStatus)
    .then(getJson)
    .then(callback)
    .catch(error => alert(`에러가 발생하였습니다. + ${error}`));
}

const fetchManagerAsync = async ({url, method, headers, content, callback}) => {
    try {
        const fetchInit = {
            method: method,
            headers: headers,
            body: JSON.stringify(content),
        };
        const response = await fetch(url, fetchInit);
        const json = await getJson(await checkHttpStatus(response));
        await callback(json);
    } catch (error) {
        alert(`에러가 발생하였습니다. + ${error}`);
    }
}

const fetchLogging = type => {
    return fetch('http://127.0.0.1:3000/api/logging', {
        method: 'post',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({logType: type})
    })
    .then(checkHttpStatus)
    .then(getJson)
    .then(({loggin}) => console.log('loggin :', loggin))
    .catch(error => alert(`에러가 발생하였습니다. ${error}`));
}
const checkHttpStatus = response => {
    const {status, statusText} = response;
    if(status >= 200 && status < 300) return Promise.resolve(response);
    else return Promise.reject(new Error(statusText));
}
const getJson = response => response.json();

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
})
