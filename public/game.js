const { Client, Account, Databases, ID, Query } = Appwrite
const projectId = ''
const databaseId = ''
const collectionId= ''

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(projectId)

const account = new Account(client)
const database = new Databases(client)

function isLoggedIn() {
    return account.get().then(response => {
        if (response) {
            return true
        }
        return false
    }).catch(error => console.error(error))
}

function getUserId() {
    return account.get().then(response => {
        return response.$id
    }).catch(error => console.error(error))
}

function displayUsername () {
    account.get().then(response => {
        const usernameElement = document.getElementById('username')
        usernameElement.textContent = response.name
    }).catch(error => console.error(error))
}

document.addEventListener('DOMContentLoaded', () => {
    displayUsername()
    showScore()
    showDisplay()
})

function updateScore(score) {
    const currentHighScore = document.getElementById('highscore').textContent
    if (Number(score) > Number(currentHighScore)) {
        getUserId().then(userId => {
            database.updateDocument(
                databaseId,
                collectionId,
                userId,
                {
                    "userId": userId,
                    "highscore": score
                }
            ).then(() => {
                showScore()
            }).then(error => console.log(error))
        })
    }
    showScore()
}

function showScore() {
    getUserId().then(userId => {
        console.log('userId', userId)
        database.listDocuments(
            databaseId,
            collectionId,
            [
                Query.equal("userId", userId),
            ]
        ).then(response => {
            const highScoreElement = document.getElementById('highscore')
            highScoreElement.textContent = response.documents[0].highscore
        })
    })
}

function register(event) {
    account.create(
      ID.unique(),
      event.target.elements['register-email'].value,
      event.target.elements['register-password'].value,
      event.target.elements['register-username'].value
    ).then(response => {
        console.log(response)
        database.createDocument(
          databaseId,
          collectionId,
          response.$id,
          {
              "userId": response.$id,
              "highscore": 0
          }
        )
        account.createEmailSession(
          event.target.elements['register-email'].value,
          event.target.elements['register-password'].value
        ).then(() => {
            showDisplay()
            displayUsername()
            showScore()
        })
    }).catch(error => console.error(error))
    event.preventDefault()
}

function login(event) {
    account.createEmailSession(
      event.target.elements['login-email'].value,
      event.target.elements['login-password'].value
    ).then(() => {
        alert('Session Started Successfully')
        showDisplay()
        displayUsername()
        showScore()
        client.subscribe("account", (response) => {
            console.log(response)
        })
    }).catch(error => {
        alert('Failed To Start Session')
        console.log(error)
    })
    event.preventDefault()
}

function logout() {
    account.deleteSessions().then(() => {
        alert('Logged Out')
        console.log('Current Session Ended')
        showDisplay()
        const highScoreElement = document.getElementById('highscore')
        highScoreElement.textContent = ""
    }).catch(error => console.error(error))
}

function toggleModel(event) {
    const registerForm = document.getElementById('register-form')
    const loginForm = document.getElementById('login-form')
    const registerButton = document.getElementById('register-button')
    const loginButton = document.getElementById('login-button')

    if (event.srcElement.id === 'register-button') {
        registerForm.classList.remove('hidden')
        registerButton.classList.remove('not-active')
        loginForm.classList.add('hidden')
        loginButton.classList.add('not-active')
    }
    if (event.srcElement.id === 'login-button') {
        registerForm.classList.add('hidden')
        registerButton.classList.add('not-active')
        loginForm.classList.remove('hidden')
        loginButton.classList.remove('not-active')
    }
}

function showDisplay() {
    const modelElement = document.getElementById('model')
    modelElement.classList.add('hidden')
    isLoggedIn().then(isLogin => {
        if (isLogin) {
            const modelElement = document.getElementById('model')
            modelElement.classList.add('hidden')
            const logoutButton = document.getElementById('logout-button')
            logoutButton.classList.remove('hidden')
            const highScoreTag = document.getElementById('highscore-tag')
            highScoreTag.classList.remove('hidden')
            startGame()
        }
        else {
            const modelElement = document.getElementById('model')
            modelElement.classList.remove('hidden')
            const logoutButton = document.getElementById('logout-button')
            logoutButton.classList.add('hidden')
            const highScoreTag = document.getElementById('highscore-tag')
            highScoreTag.classList.add('hidden')
            const usernameElement = document.getElementById('username')
            usernameElement.textContent = ""
            const canvas = document.querySelector('canvas')
            if (canvas) canvas.remove()
        }
    }).catch(error => console.error(error))
}

function startGame() {
    kaboom({
        global: true,
        fullscreen: true,
        scale: 2,
        clearColor: [0,0,0,1]
    })

    //Speed identifiers
    const moveSpeed = 120
    const jumpForce = 400
    const bigJumpForce = 550
    let currentJumpForce = jumpForce
    const fallDeath = 440
    const enemySpeed = 20

    //Game logic
    let isJumping= true

    //Game elements
    loadRoot('https://i.imgur.com/')
    loadSprite('coin', 'wbKxhcd.png')
    loadSprite('evil-shroom', 'KPO3fR9.png')
    loadSprite('brick', 'pogC9x5.png')
    loadSprite('block', 'M6rwarW.png')
    loadSprite('mario', 'Wb1qfhK.png')
    loadSprite('mushroom', '0wMd92p.png')
    loadSprite('surprise', 'gesQ1KP.png')
    loadSprite('unboxed', 'bdrLpi6.png')
    loadSprite('pipe-top-left', 'ReTPiWY.png')
    loadSprite('pipe-top-right', 'hj2GK4n.png')
    loadSprite('pipe-bottom-left', 'c1cYSbt.png')
    loadSprite('pipe-bottom-right', 'nqQ79eI.png')
    loadSprite('blue-block', 'fVscIbn.png')
    loadSprite('blue-brick', '3e5YRQd.png')
    loadSprite('blue-steel', 'gqVoI2b.png')
    loadSprite('blue-evil-shroom', 'SvV4ueD.png')
    loadSprite('blue-surprise', 'RMqCc1G.png')

    scene("game", ({level, score}) => {
        layers(["bg", "obj", "ui"], "obj")

        const map = [
            [
                '                                      ',
                '                                      ',
                '                                      ',
                '                                      ',
                '     %   =*=%=                        ',
                '                                      ',
                '                            -+        ',
                '                    ^   ^   ()        ',
                '==============================   =====',
            ],
            [
                '~                                               ~',
                '~                                               ~',
                '~                                               ~',
                '~                                               ~',
                '~     @@@@@@                       x x          ~',
                '~                                x x x          ~',
                '~                              x x x x   x    -+~',
                '~                  z   z     x x x x x   x    ()~',
                '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
            ]
        ]

        const levelCfg = {
            width: 20,
            height: 20,
            '=': [sprite('block'), solid()],
            '$': [sprite('coin'), 'coin'],
            '%': [sprite('surprise'), solid(), 'coin-surprise'],
            '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
            '}': [sprite('unboxed'), solid()],
            '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
            ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
            '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
            '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
            '^': [sprite('evil-shroom'), solid(), 'dangerous'],
            '#': [sprite('mushroom'), solid(), 'mushroom', body()],
            '!': [sprite('blue-block'), solid(), scale(0.5)],
            '~': [sprite('blue-brick'), solid(), scale(0.5)],
            'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
            '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
            'x': [sprite('blue-steel'), solid(), scale(0.5)],
        }

        const gameLevel = addLevel(map[level], levelCfg)

        const scoreLabel = add([
          text(score),
          pos(30, 6),
          layer('ui'),
            {
                value: score
            }
        ])

        add([text(' level ' + parseInt(level+1)), pos(40, 6)])

        const player = add([
          sprite('mario', solid()),
          pos(30,0),
          body(),
          big(),
          origin('bot')
        ])

        function big() {
            let timer = 0
            let isBig = false
            return {
                update() {
                    if (isBig) {
                        currentJumpForce = bigJumpForce
                        timer -= dt()
                        if (timer <= 0) {
                            this.smaller()
                        }
                    }
                },
                isBig() {
                    return isBig
                },
                smaller() {
                    this.scale = vec2(1)
                    currentJumpForce = jumpForce
                    timer = 0
                    isBig = false
                },
                bigger(time) {
                    this.scale = vec2(2)
                    timer = time
                    isBig = true
                }

            }
        }

        player.on("headbump", (obj) => {
            if (obj.is('coin-surprise')) {
                gameLevel.spawn('$', obj.gridPos.sub(0,1))
                destroy(obj)
                gameLevel.spawn('}', obj.gridPos.add(0,0))
            }
            if (obj.is('mushroom-surprise')) {
                gameLevel.spawn('#', obj.gridPos.sub(0,1))
                destroy(obj)
                gameLevel.spawn('}', obj.gridPos.add(0,0))
            }
        })

        action('mushroom', (m) => {
            m.move(20,0)
        })

        player.collides('mushroom', (m) => {
            destroy(m)
            player.bigger(6)
        })

        player.collides('coin', (c) => {
            destroy(c)
            scoreLabel.value++
            scoreLabel.text = scoreLabel.value
        })

        action('dangerous', (d) => {
            d.move(-enemySpeed, 0)
        })

        player.collides('dangerous', (d) => {
            if (isJumping) {
                destroy(d)
            }
            else {
                go('lose', { score: scoreLabel.value})
            }
        })

        player.action(() => {
            camPos(player.pos)
            if(player.pos.y >= fallDeath) {
                go('lose', { score: scoreLabel.value })
            }
        })

        player.collides('pipe', () => {
            keyPress('down', () => {
                go ('game', {
                    level: ( level + 1) % map.length,
                    score: scoreLabel.value
                })
            })
        })

        keyDown('left', () => {
            player.move(-moveSpeed, 0)
        })

        keyDown('right', () => {
            player.move(moveSpeed, 0)
        })

        player.action(() => {
            if(player.grounded()) {
                isJumping = false
            }
        })

        keyPress('space', () => {
            if (player.grounded()) {
                isJumping = true
                player.jump(currentJumpForce)
            }
        })

        scene('lose', ({ score }) => {
            add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
            updateScore(score)
        })
    })

    start("game", { level: 0, score: 0 })
}

