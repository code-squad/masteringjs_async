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


function initEvents() {
    // 이벤트등록

    // 1. 로그인 버튼 눌렀을 때 로그인 되도록
    // 선택자 : .login-btn, url : /api/login
    // body.user
    $('.login-btn').addEventListener('click', ({target:{outerText}}) => {
        if(outerText === 'LOGIN') {
            const data = Object.assign({}, {user:'namdeng_2'});
            fetch('http://127.0.0.1:3000/api/login', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(({login}) => { 
                if(login === 'ok') {
                    alert('로그인 되었습니다.');
                    $('.login-btn').innerText = 'LOGOUT';
                }
                else alert('로그인에 실패 하였습니다.');
            })
            .catch((error) => alert('서버와 통신중 에러가 발생하였습니다.'))
        } else {
            const data = Object.assign({}, {command:'deletesession'});
            fetch('http://127.0.0.1:3000/api/session', {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(({result}) => { 
                if(result === 'ok') {
                    alert('로그아웃 되었습니다.');
                    $('.login-btn').innerText = 'LOGIN';
                }
                else alert('로그아웃에 실패 하였습니다.');
            })
            .catch((error) => alert('서버와 통신중 에러가 발생하였습니다.'))
        }
    });
}

function fetchManager({requestUrl, method, headers, content, callback}) {
    fetch(requestUrl, {
        method: method,
        headers: headers,
        body: JSON.stringify(content)
    })
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
})
