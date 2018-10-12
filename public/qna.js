class defaultFetchOption {
    constructor ( options={}) {
        const defaultData = this.getDefault()
        this.options = Object.assign( {} , defaultData, options.options)
        if( options.options.headers) this.options.headers = options.options.headers
        if( options.url) this.url = this.options.host + options.url.replace( this.options.host , '')

        const logType = {
            logType : {
                url    : this.url,
                method : this.options.method,
                body   : this.options.body
            }
        }

        this.logging = {
            url : defaultData.host + 'api/logging',
            option : { method:defaultData.method,headers:defaultData.headers , body : JSON.stringify( logType)}
        }

        return this
    }
    getDefault () {
        return {
            host : "http://localhost:3000/",
            method : 'post',
            headers : {'Content-Type': 'application/json'}
        }
    }
    get () {
        return {
            logging : this.logging,
            url        : this.url,
            option     : this.options
        }
    }
}

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


function fetchManager ( param = {}) {
    const { url , option ,logging} = new defaultFetchOption( param).get()

    return fetch( url, option).then(function (response){
        checkStatus( response.status)
        return response.json()
    }).then( function( data) {
        if( param.callback)
            param.callback( data)
        return fetch( logging.url ,  logging.option)
    }).then( function(response) {
        checkStatus( response.status)

    }).catch(function(err){console.log(err)})
}

const login = {
    init ( ...elements) {
        this.elements = elements

        this.login = {
            url   : 'api/login',
            options : {
                body : JSON.stringify({ user : 'crong'})
            }
        }
        this.logout = {
            url   : 'api/session',
            options : {
                body : JSON.stringify({ command : 'deletesession'})
            }
        }
        this.setup().addEvents()
        this.isLogin = false;
    },
    setHeader( header){
        this.header = header;
        return this;
    },
    setup () {
        this.elements = this.elements.filter( element => typeof element!==undefined)
        return this
    },
    render ( data = { login : 'fail'} , that) {
        that = that || this 
        that.isLogin =data.login==='ok'?true:false
        that.elements.forEach( el => {
            el.innerText = that.isLogin ? 'LOGOUT' : 'LOGIN'
        })
    },
    addEvents() {
        this.elements.forEach( el => {
            el.addEventListener('click' , (e)=>{
                const evt = new CustomEvent( '@fetch' , {detail : this.isLogin ? 
                    this.getLogout() : this.getLogin()})
                el.dispatchEvent( evt)
            })  
        })
    },
    getLogin() {
        return Object.assign( this.login, { options : {  method:'post', body : this.login.options.body} })
    },
    getLogout() {
        return Object.assign( this.logout, { options : { method:'delete' , body : this.logout.options.body} })
    }
}

function getOptions ( e , callback) {
    if( !e) return;
    let options = {}
    const target = e.target
    switch ( target.className) {
        case 'answer-form' : 
          options = {
            url : `api/questions/${target.dataset['questionid'] || 1}/answers`,
            options : {
                method : 'post',
                body : JSON.stringify( { content : target.querySelector('textarea').value.trim() })
            
            },
            callback : callback
          }
        break
        case 'answer-delete' : 
          options = {
            url : target.href,
            options : { method : 'delete'},
            callback : callback
          }
        break
        case 'login-btn' :
          options = e.detail
          options.callback = callback
        break;
    }
    return options
}

function loginCheck( callback) {
    const options = { 
        url : 'api/session',
        options : {
            method :'post',
            body : JSON.stringify( { name :'userid'})
        },
        callback : callback
    }
    //fetchManagerAsync( options)
    fetchManager( options )
}

function initEvents() {
    //이벤트등록
    const $loginElement = [ $('header .login-btn')],
          $answers = $('.answers'),
          $answerForm = $('.answer-form')
    
    login.init( ...$loginElement)
    loginCheck( renderLogin)

    $answers.addEventListener('click' , onRemove)
    $answerForm.addEventListener('submit' , onSubmit)
    $loginElement.forEach( el=>
      el.addEventListener('@fetch', onClick)
    )

    function renderLogin( json) {
        login.render(json)
    }

    function onClick( e) {
        const options = getOptions( e , renderLogin)
        fetchManager( options)
    }

    function onRemove( e) {
        e.preventDefault()
        const target = e.target
        if( target.className !== 'answer-delete') return
        const options = getOptions( e , function ( json){ target.closest('.answer').remove()})

        fetchManager( options)
    }

    function onSubmit( e) {
        e.preventDefault()
        const options = getOptions( e , function( json) {
            e.target.querySelector('textarea').value = ''
            $answers.insertAdjacentHTML('beforeend', appendAnswer(json))
        })

        fetchManager( options)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initEvents();
})

function checkStatus ( status) {
    if( status !== 200) throw new Error( `[${status}] error`)
}

/* async */
async function fetchManagerAsync ( param = {}) {
    const host    = "http://localhost:3000/",
          headers = {'Content-Type': 'application/json'}
    const { url, option, logging } = new defaultFetchOption( param).get()
    const result = await fetch( url, option)
    const data = await result.json()

    checkStatus(result.status)

    if( param.callback) param.callback( data)
    const logResult = await fetch( logging.url ,  logging.option)
    checkStatus( logResult.status)
}

