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
    $('.login-btn').addEventListener('click', ({target:{outerText}}) => {
        if(outerText === 'LOGIN') { // 로그인
            const user = Object.assign({}, {user:'namdeng_2'});

            const requestData = Object.assign({}, {
                url: 'http://127.0.0.1:3000/api/login',
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                content: user
            })

            fetchManager(requestData)
            .then(({login}) => { 
                if(login === 'ok') {
                    alert('로그인 되었습니다.');
                    $('.login-btn').innerText = 'LOGOUT';
                } else alert('로그인에 실패 하였습니다.');
            })
            .catch((error) => alert('서버와 통신중 에러가 발생하였습니다.'))
        } else { // 로그아웃
            const command = Object.assign({}, { command:'deletesession' });
            const requestData = Object.assign({}, {
                url: 'http://127.0.0.1:3000/api/session',
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
                content: command
            })

            fetchManager(requestData)
            .then(({result}) => { 
                if(result === 'ok') {
                    alert('로그아웃 되었습니다.');
                    $('.login-btn').innerText = 'LOGIN';
                } else alert('로그아웃에 실패 하였습니다.');
            })
            .catch((error) => alert('서버와 통신중 에러가 발생하였습니다.'))
        }
    });
}

function fetchManager({url, method, headers, content, callback}) {
    return fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(content),
        // TODO : callback 값 활용. 어떻게(?)
        callback: callback
    }).then(res => res.json());
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
})
