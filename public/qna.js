'use strict';

const API_LOGGING_URL = '/api/logging';
const ANSWER_DELETE_BUTTON_EL_NAME = 'btn-answer-delete';

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
    if (err instanceof RestError) {
        return alert(err.message);
    }

    if (err instanceof Error) {
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
                <button name="btn-answer-delete" class="answer-delete">삭제</button>
            </div>
        </div>
    </li> `;

    return commentHTML;
}

const REST = {
    get(url) {
        return fetchManager(url, 'GET', null);
    },

    post(url, body) {
        return fetchManager(url, 'POST', body);
    },

    put(url, body) {
        return fetchManager(url, 'PUT', body);
    },

    del(url, body) {
        return fetchManager(url, 'DELETE', body);
    }
};

function fetchManager(url, method, body) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const options = {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    };

    return fetch(url, options).then((res) => {
        if (res.ok) {
            if (url !== API_LOGGING_URL) {
                asyncLogging(url, method, body).then();
            }
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

async function fetchManagerAsync(url, method, body) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const myInit = {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    };

    const res = await fetch(url, myInit);
    if (res.ok) {
        if (url !== API_LOGGING_URL) {
            await asyncLogging(url, method, body);
        }
        return await res.json();
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
}

const AsyncREST = {
    get(url) {
        return fetchManagerAsync(url, 'GET', null);
    },

    post(url, body) {
        return fetchManagerAsync(url, 'POST', body);
    },

    put(url, body) {
        return fetchManagerAsync(url, 'PUT', body);
    },

    del(url, body) {
        return fetchManagerAsync(url, 'DELETE', body);
    }
};

async function asyncLogging(url, method, body) {
    try {
        await AsyncREST.post(API_LOGGING_URL, {
            logType: {
                url: url,
                method: method,
                body: body
            }
        });
    } catch (err) {
        errorHandler(err);
    }
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

const answers = [];

function resetAnswerList() {
    // noinspection UnnecessaryLocalVariableJS
    const answersHtml = answers.map((answer) => {
        return appendAnswer(answer);
    }).join('');

    $('ul.answers').innerHTML = answersHtml;
}

// 답글 달기 로그인상태가 아닐경우 status 401반환
function answerListener() {
    const contentEl = $('.answer-form .form-control');
    const content = contentEl.value;

    if (!content) {
        return alert('답변은 빈값이 될수 없습니다.!!');
    }

    AsyncREST.post('/api/questions/1/answers', {
        content: content
    }).then((json) => {
        if (json['error']
            && json['error'] === 400) {
            throw new RestError(400, '답변은 빈값이 될수 없습니다.!!');
        }
        answers.push(json);

        resetAnswerList();

        contentEl.value = '';

    }).catch(errorHandler);
}

function answerDelegationListener(evt) {
    if (evt.target.name === ANSWER_DELETE_BUTTON_EL_NAME) {
        const answerId = evt.currentTarget.children[0].dataset.id;

        AsyncREST.del('/api/questions/1/answers/' + answerId, null).then((json) => {
            console.log('delete result is ', json);

            // 삭제 하기
            const deleteTarget = answers.filter((answer) => {
                return answer.answerId === answerId;
            })[0];

            const targetIndex = answers.indexOf(deleteTarget);
            answers.splice(targetIndex, 1);

            resetAnswerList();

        }).catch(errorHandler);
    }
}

function initEvents() {
    //이벤트등록

    // 로그인 이벤트 리스너 등록
    $('header .login-btn').addEventListener('click', loginListener);

    // 답변하기 이벤트 리스너 등록
    $('.answer-form .btn').addEventListener('click', answerListener);

    // 답변 삭제 하기
    $('ul.answers').addEventListener('click', answerDelegationListener)

}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
});
