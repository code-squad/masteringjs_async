function $(selector) {
    return document.querySelector(selector);
}

function $All(selector) {
    return [...document.querySelectorAll(selector)];
}

function appendAnswer({content, writer, questionId, answerId}) {
    const currentDateInfo = new Date().yyyymmdd("-");
    const commentHTML = `
    <li class="answer" data-id=${answerId}>
        <div class="answer-content"> ${content} </div>
        <div class="answer-metainfo">
            <div class="answer-id">${writer.id}</div>
            <div class="answer-date">${currentDateInfo}</div>
            <div class="answer-util">
                <a class="answer-delete" href="/api/questions/${questionId}/answers/${answerId}">삭제</a>
            </div>
        </div>
    </li> `
    return commentHTML;
}

function initEvents() {
    const LOGIN = {
        ok : "ok",
        fail : "fail",
        result : "ok",
        loginStr : "LOGIN",
        logoutStr : "LOGOUT",
        userID : "skyhot"
    };

    const COMMAND = {
        del_session : "deletesession"
    };

    const METHOD = {
        get : "GET",
        post : "POST",
        delete : "DELETE",
        update : "UPDATE"
    };
    const answerTargetObj = $("ul.answers");
    //이벤트등록
    //#1. bind login || logout event
    $(".login-btn").addEventListener("click", (event) => {
        //로그인 or 로그아웃 요청 with innerHTML
        const thisObj = event.target;
        if(thisObj.innerText === 'LOGIN'){
            fetchManager('/api/login',{user:LOGIN.userID}).then((response) => {
                const responseMsg = response.login;
                //로그인 성공
                if(LOGIN.ok === responseMsg){
                    thisObj.innerHTML = LOGIN.logoutStr;
                }else{
                //로그인 실패
                    console.log('fail login!!');
                }
            });
        }else if(thisObj.innerText === 'LOGOUT'){
            //#1. call delete session
            fetchManager('/api/session',{command:COMMAND.del_session},{method : METHOD.delete}).then((response) => {
                const responseMsg = response.result;
                //로그아웃 성공
                if(LOGIN.result === responseMsg){
                    thisObj.innerHTML = LOGIN.loginStr;
                }else{
                //로그아웃 실패
                    console.log('fail logout!!');
                }
            });
        }else{
            throw "unexpected case cause error!!";
        }
    });

    //#2. bind answer btn event
    $("input.btn").addEventListener("click", async (event) => {
        //#1. set param (req.param.questionid & req.body.content)
        const answerInput = $("div.form-group textarea");
        const questionID = new Date().yyyymmdd();
        //#3. call api with("'/api/questions/:questionid/answers'")
        const response = await fetchManagerAsync("/api/questions/"+questionID+"/answers", {content:answerInput.value});
        try{
            if(!response) throw "no passing response data!!!";

            //#3-1 append newly user answer.
            const answerTemplate = appendAnswer(response);
            answerTargetObj.innerHTML += answerTemplate;

            //#3-2. reset input
            answerInput.value = "";
        }catch(error){
            console.log(error);
        }
        
    });

    //#3. delete answer event with data-id (event delegation with answer area)
    answerTargetObj.addEventListener("click", async (event) => {
        if(event.target.className !== "answer-delete") {
            return false;
        }else{
            //click delete btn so, stop moving with default link 
            event.preventDefault();
            const clickObj = event.target;
            const answerID = clickObj.parentNode.parentNode.children[0].innerHTML;

            //#1. 로그인 및 권한 체크
            const response = await fetchManagerAsync("/api/check/login",{user : LOGIN.userID})
            

            if(response.login_id !== answerID){
                alert("권한이 없는 글입니다.");
                return false;
            }else{
                fetchManagerAsync(clickObj.href,{}, {method : METHOD.delete}).then(response => {
                    if(response.answerid){
                        deleteAnswer(response.answerid);
                    }
                });
            }

            /*.then(response => {
                if(response.login_status === LOGIN.fail){
                    alert("로그인이 필요합니다.");
                    return false;
                }else{
                    if(response.login_id !== answerID){
                        alert("권한이 없는 글입니다.");
                        return false;
                    }else{
                        fetchManagerAsync(clickObj.href,{}, {method : METHOD.delete}).then(response => {
                            if(response.answerid){
                                deleteAnswer(response.answerid);
                            }
                        });
                    }
                }
            });*/
        }
     });
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
})

function deleteAnswer(dataID){
    if(!dataID) return;

    const deleteTargetArr = $All('li.answer');
    deleteTargetArr.forEach((target, index) => {
        if(target.dataset.id !== dataID) return;
        //delete target from parent node;
        target.parentNode.removeChild(target);
    });
}

const fetchManagerAsync =  async (url = ``, data = {}, pushOption = {}) => {
    const logginURL = "/api/logging";
    try{
        const response = await fetch(url, {
            method: pushOption.method ? pushOption.method : "POST",
            mode: pushOption.mode ? pushOption.mode  : "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            redirect: "follow",
            referrer: "no-referrer",
            body: pushOption.body ? pushOption.body : JSON.stringify(data)
        });

        const callApiLogging = async () => {
            if(response.status === 401){
                alert("로그인이 필요합니다.");
                throw ("401 error caused!!!");
            }

            const responseJson = response.json();
            if(responseJson && url !== logginURL){
                data.logType = `${url} complete!!`;
                fetchManagerAsync(logginURL, data);
            }
            return responseJson;
        };

        return await callApiLogging();    
    }catch(error){
        if(url !== logginURL){
            data.logType = `${url} exception!! detailed : ${error}`;
            fetchManager(logginURL, data);
            return false;
        }
    }
};

const fetchManager = (url = ``, data = {}, pushOption = {}) => {
    const logginURL = "/api/logging";
    return fetch(
        url, {
        method: pushOption.method ? pushOption.method : "POST", 
        mode: pushOption.mode ? pushOption.mode  : "cors", 
        cache: "no-cache", 
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            
        },
        redirect: "follow", 
        referrer: "no-referrer",
        body: pushOption.body ? pushOption.body : JSON.stringify(data)
    })
    .then(response => {
        if(response.status === 401){
            alert("로그인이 필요합니다.");
            throw ("401 error caused!!!");
        }
        return response.json()
    })
    .then(jsonResponse =>{
        if(jsonResponse && url !== logginURL){
            data.logType = `${url} complete!!`;
            //recursive call
            fetchManager(logginURL, data);
        }
        return jsonResponse;
    })
    .catch(function(error) {
        if(url !== logginURL){
            data.logType = `${url} exception!! detailed : ${error}`;
            fetchManager(logginURL, data);
        }
    });
};

Date.prototype.yyyymmdd = function(seperator = '') {         

    var yyyy = this.getFullYear().toString();                                    
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
    var dd  = this.getDate().toString();             

    return yyyy + seperator + (mm[1]?mm:"0"+mm[0]) + seperator + (dd[1]?dd:"0"+dd[0]);
};
    
