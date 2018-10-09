'use strict';

class RestError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function $(selector) {
    return document.querySelector(selector);
}

function errorHandler(err) {
    if(err instanceof RestError) {
        return alert(err.message);
    }

    if(err instanceof Error) {
        console.error(err.message);
    }
    alert('웁스~!! 처리가 지연되고 있네요\n담당자에게 문의 부탁드립니다.');
}

function appendAnswer({content, writer, date, answerId}) {
    // noinspection UnnecessaryLocalVariableJS
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
    </li> `;

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

        let message;
        switch (res.status) {
            case 401:
                message = '로그인 후 다시 시도해 주시기 바랍니다.';
                break;
            default:
                message = '처리도중 에러가 발생되었습니다.'
        }

        throw new RestError(res.status, message);
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

        throw new RestError(500, '로그아웃에 실패 하였습니다.\n재시도 해주세요');
    }).catch(errorHandler);
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

        throw new RestError(401, '로그인 실패');
    }).catch((errorHandler));
}

// 답글 달기 로그인상태가 아닐경우 status 401반환
function answerListener() {
    const contentEl = $('.answer-form .form-control');
    const content = contentEl.value;

    if(!content) {
        return alert('답변은 빈값이 될수 없습니다.!!');
    }

    REST.post('/api/questions/1/answers', {
        content: content
    }).then((json) => {
        if(json['error']
            && json['error'] === 400) {
            throw new RestError(400, '답변은 빈값이 될수 없습니다.!!');
        }

        const targetEl = $('ul.answers');
        targetEl.innerHTML = appendAnswer(json) + targetEl.innerHTML;

        contentEl.value = '';

    }).catch(errorHandler);
}

function initEvents() {
    //이벤트등록

    // 로그인 이벤트 리스너 등록
    $('header .login-btn').addEventListener('click', loginListener);

    // 답변하기 이벤트 리스너 등록
    $('.answer-form .btn').addEventListener('click', answerListener);
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
});
