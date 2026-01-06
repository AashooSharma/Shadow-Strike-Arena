const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

let isPaused = false

const gravity = 0.7
const DODGE_DURATION = 2000 // 5 seconds

// const background = new Sprite({
//   position: {
//     x: 0,
//     y: 0
//   },
//   imageSrc: './img/background.jpg'
// })

// ===== LEVEL DETECT =====
const urlParams = new URLSearchParams(window.location.search)
const level = parseInt(urlParams.get('level')) || 1

let backgroundImage = './img/background.jpg'

if (level === 2) backgroundImage = './img/background2.jpg'
if (level === 3) backgroundImage = './img/background3.jpg'

// ===== BACKGROUND =====
// const background = new Sprite({
//   position: { x: 0, y: 0 },
//   imageSrc: backgroundImage
// })

const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: backgroundImage,
  isBackground: true // 🔥 THIS LINE
})

const sounds = {
  move: new Audio('./sounds/move.mp3'),
  jump: new Audio('./sounds/jump.mp3'),
  attack: new Audio('./sounds/attack.mp3'),
  hit: new Audio('./sounds/hit.mp3'),
  death: new Audio('./sounds/death.mp3')
}

// better UX
Object.values(sounds).forEach((sound) => {
  sound.volume = 0.4
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  }
})

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    dodge: {
      imageSrc: './img/kenji/Dodge.png', // ⭕ circle animation
      framesMax: 8
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  }
})

console.log(player)

enemy.ai = {
  range: 150,
  speed: 1.2,
  cooldown: false,
  dodgeSpeed: 6 // ✅ ADD THIS
}

enemy.direction = 'right'
enemy.isInvincible = false
enemy.invincibleTimeout = null

// ===== LEVEL BASED DIFFICULTY =====
if (level === 2) {
  enemy.ai.speed = 2
  enemy.ai.range = 180
}

if (level === 3) {
  enemy.ai.speed = 3
  enemy.ai.range = 220
}

const GAME_BOUNDARY = {
  left: 50,
  right: canvas.width - 50
}

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer()

let playerComboCount = 0
let lastPlayerAttackTime = 0
let animationId = null // 🔹 declare animationId

// function animate() {
//   if (isPaused) return
//   animationId = window.requestAnimationFrame(animate) // 🔹 store animationId

//   c.fillStyle = 'black'
//   c.fillRect(0, 0, canvas.width, canvas.height)
//   background.update()
//   shop.update()
//   c.fillStyle = 'rgba(255, 255, 255, 0.15)'
//   c.fillRect(0, 0, canvas.width, canvas.height)
//   player.update()
//   enemy.update()

//   // ===== PLAYER BOUNDARY =====
//   if (player.position.x < GAME_BOUNDARY.left) {
//     player.position.x = GAME_BOUNDARY.left
//   }

//   if (player.position.x + player.width > GAME_BOUNDARY.right) {
//     player.position.x = GAME_BOUNDARY.right - player.width
//   }

//   player.velocity.x = 0
//   //   enemy.velocity.x = 0

//   // player movement

//   //   if (keys.a.pressed && player.lastKey === 'a') {
//   //     player.velocity.x = -5
//   //     player.switchSprite('run')
//   //   } else if (keys.d.pressed && player.lastKey === 'd') {
//   //     player.velocity.x = 5
//   //     player.switchSprite('run')
//   //   } else {
//   //     player.switchSprite('idle')
//   //   }

//   if (keys.a.pressed && player.lastKey === 'a') {
//     player.velocity.x = -5
//     player.switchSprite('run')
//     if (sounds.move.paused) sounds.move.play()
//   } else if (keys.d.pressed && player.lastKey === 'd') {
//     player.velocity.x = 5
//     player.switchSprite('run')
//     if (sounds.move.paused) sounds.move.play()
//   } else {
//     player.switchSprite('idle')
//     sounds.move.pause()
//     sounds.move.currentTime = 0
//   }

//   // jumping
//   if (player.velocity.y < 0) {
//     player.switchSprite('jump')
//   } else if (player.velocity.y > 0) {
//     player.switchSprite('fall')
//   }

//   //   // ===== ENEMY AI (FINAL FIXED) =====
//   //   if (enemy.dead || enemy.health <= 0) {
//   //     enemy.velocity.x = 0
//   //   } else {
//   //     const distance = player.position.x - enemy.position.x

//   //     // Chase player
//   //     if (Math.abs(distance) > enemy.ai.range) {
//   //       enemy.velocity.x = distance > 0 ? enemy.ai.speed : -enemy.ai.speed
//   //       enemy.switchSprite('run')
//   //     } else {
//   //       enemy.velocity.x = 0

//   //       // Auto attack (no spam, no attack after death)
//   //       if (!enemy.ai.cooldown && !enemy.isAttacking) {
//   //         enemy.attack()
//   //         enemy.ai.cooldown = true

//   //         setTimeout(() => {
//   //           if (!enemy.dead) enemy.ai.cooldown = false
//   //         }, 800)
//   //       }
//   //     }

//   // ===== ENEMY DODGE ON 3 ATTACK COMBO =====
//   if (
//     playerComboCount >= 3 &&
//     !enemy.dead &&
//     !enemy.isAttacking &&
//     !enemy.isDodging
//   ) {
//     enemy.isDodging = true
//     enemy.switchSprite('dodge') // ⭕ PLAY DODGE ANIMATION



//     // player se ulta direction
//     const dodgeDirection = player.position.x < enemy.position.x ? 1 : -1

//     enemy.velocity.x = dodgeDirection * enemy.ai.dodgeSpeed
//     enemy.velocity.y = 0
//     // enemy.switchSprite('run') // ya idle bhi chalega

//     setTimeout(() => {
//       enemy.velocity.x = 0
//       enemy.isDodging = false
//       enemy.switchSprite('idle') // 🔁 BACK TO NORMAL
//       playerComboCount = 0
//     }, 400)

//     return // 🔥 baaki AI skip

//     // // dodge complete hone ke baad reset
//     // setTimeout(() => {
//     //   enemy.velocity.x = 0
//     //   enemy.isDodging = false
//     //   playerComboCount = 0
//     // }, 500)

//     // return // ⚠️ baaki AI skip
//   }

//   // ===== ENEMY AI (FINAL FIXED) =====
//   if (enemy.dead || enemy.health <= 0) {
//     enemy.velocity.x = 0
//   } else {
//     const distance = player.position.x - enemy.position.x

//     // ===== FACE PLAYER (IMPORTANT FIX) =====
//     if (distance < 0) {
//       // player enemy ke LEFT side me hai
//       enemy.direction = 'left'
//       enemy.attackBox.offset.x = -enemy.attackBox.width
//     } else {
//       // player enemy ke RIGHT side me hai
//       enemy.direction = 'right'
//       enemy.attackBox.offset.x = 0
//     }

//     // ===== CHASE PLAYER =====
//     if (Math.abs(distance) > enemy.ai.range) {
//       enemy.velocity.x = distance > 0 ? enemy.ai.speed : -enemy.ai.speed
//       enemy.switchSprite('run')
//     } else {
//       enemy.velocity.x = 0

//       // ===== AUTO ATTACK (NO SPAM, NO ATTACK AFTER DEATH) =====
//       if (!enemy.ai.cooldown && !enemy.isAttacking && !enemy.dead) {
//         enemy.attack()
//         enemy.ai.cooldown = true

//         setTimeout(() => {
//           if (!enemy.dead) enemy.ai.cooldown = false
//         }, 800)
//       }
//     }

//     // Jump / fall animation
//     if (enemy.velocity.y < 0) {
//       enemy.switchSprite('jump')
//     } else if (enemy.velocity.y > 0) {
//       enemy.switchSprite('fall')
//     } else if (enemy.velocity.x === 0 && !enemy.isAttacking) {
//       enemy.switchSprite('idle')
//     }
//   }

//   // ===== ENEMY BOUNDARY =====
//   // if (enemy.position.x < GAME_BOUNDARY.left) {
//   //   enemy.position.x = GAME_BOUNDARY.left
//   //   enemy.velocity.x = 0
//   // }

//   if (!enemy.isDodging) {
//     if (enemy.position.x < GAME_BOUNDARY.left) {
//       enemy.position.x = GAME_BOUNDARY.left
//       enemy.velocity.x = 0
//     }

//     if (enemy.position.x + enemy.width > GAME_BOUNDARY.right) {
//       enemy.position.x = GAME_BOUNDARY.right - enemy.width
//       enemy.velocity.x = 0
//     }
//   }

//   if (enemy.position.x + enemy.width > GAME_BOUNDARY.right) {
//     enemy.position.x = GAME_BOUNDARY.right - enemy.width
//     enemy.velocity.x = 0
//   }

//   // ===== PLAYER HITS ENEMY =====
//   if (
//     !enemy.dead &&
//     rectangularCollision({
//       rectangle1: player,
//       rectangle2: enemy
//     }) &&
//     player.isAttacking &&
//     player.framesCurrent === 4
//   ) {
//     enemy.takeHit()
//     player.isAttacking = false

//     gsap.to('#enemyHealth', {
//       width: enemy.health + '%'
//     })
//   }

//   // if player misses
//   if (player.isAttacking && player.framesCurrent === 4) {
//     player.isAttacking = false
//   }

//   // ===== ENEMY HITS PLAYER =====
//   if (
//     !enemy.dead &&
//     rectangularCollision({
//       rectangle1: enemy,
//       rectangle2: player
//     }) &&
//     enemy.isAttacking &&
//     enemy.framesCurrent === 2
//   ) {
//     player.takeHit()
//     enemy.isAttacking = false

//     gsap.to('#playerHealth', {
//       width: player.health + '%'
//     })
//   }

//   // if enemy misses
//   if (enemy.isAttacking && enemy.framesCurrent === 2) {
//     enemy.isAttacking = false
//   }

//   // // ===== GAME OVER =====
//   // if (enemy.health <= 0 || player.health <= 0) {
//   //   enemy.dead = true
//   //   enemy.velocity.x = 0

//   //   if (player.health <= 0) {
//   //     showGameOver('You Lose 😢')
//   //   } else {
//   //     showGameOver('You Win 🎉')
//   //   }
//   // }

//   // ===== GAME OVER =====
//   if (enemy.health <= 0 || player.health <= 0) {
//     clearTimeout(timerId) // 🔴 TIMER STOP HERE

//     enemy.dead = true
//     enemy.velocity.x = 0

//     // if (player.health <= 0) {
//     //   showGameOver('You Lose 😢')
//     // } else {
//     //   showGameOver('You Win 🎉')
//     // }

//     if (player.health <= 0) {
//       showGameOver('You Lose 😢')
//     } else {
//       if (level < 3) {
//         setTimeout(() => {
//           window.location.href = `play.html?level=${level + 1}`
//         }, 1500)
//       } else {
//         showGameOver('You Completed All Levels 🎉🔥')
//       }
//     }
//   }
// }

function animate() {
  if (isPaused) return
  if (gameOver) return   // ⛔ YAHI GAME FREEZE
  
  animationId = window.requestAnimationFrame(animate)

  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()

  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  player.update()
  enemy.update()

  // ===== PLAYER BOUNDARY =====
  if (player.position.x < GAME_BOUNDARY.left) {
    player.position.x = GAME_BOUNDARY.left
  }
  if (player.position.x + player.width > GAME_BOUNDARY.right) {
    player.position.x = GAME_BOUNDARY.right - player.width
  }

  player.velocity.x = 0

  // ===== PLAYER MOVE =====
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
    if (sounds.move.paused) sounds.move.play()
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
    if (sounds.move.paused) sounds.move.play()
  } else {
    player.switchSprite('idle')
    sounds.move.pause()
    sounds.move.currentTime = 0
  }

  // jump / fall
  if (player.velocity.y < 0) player.switchSprite('jump')
  else if (player.velocity.y > 0) player.switchSprite('fall')

  // ===== ENEMY DODGE + INVINCIBILITY =====
  // if (
  //   playerComboCount >= 3 &&
  //   !enemy.dead &&
  //   !enemy.isDodging &&
  //   !enemy.isAttacking
  // ) {
  //   enemy.isDodging = true
  //   enemy.isInvincible = true
  //   enemy.switchSprite('dodge')

  //   const dodgeDir = player.position.x < enemy.position.x ? 1 : -1
  //   enemy.velocity.x = dodgeDir * enemy.ai.dodgeSpeed

  //   // 5 sec immunity
  //   clearTimeout(enemy.invincibleTimeout)
  //   enemy.invincibleTimeout = setTimeout(() => {
  //     enemy.isInvincible = false
  //   }, 5000)

  //   setTimeout(() => {
  //     enemy.velocity.x = 0
  //     enemy.isDodging = false
  //     enemy.switchSprite('idle')
  //     playerComboCount = 0
  //   }, 400)

  //   return
  // }

//   if (
//   playerComboCount >= 3 &&
//   !enemy.dead &&
//   !enemy.isDodging &&
//   !enemy.isAttacking
// ) {
//   enemy.isDodging = true
//   enemy.isInvincible = true

//   enemy.switchSprite('dodge') // ⭕ PURE DODGE ANIMATION

//   const dodgeDir = player.position.x < enemy.position.x ? 1 : -1
//   enemy.velocity.x = dodgeDir * enemy.ai.dodgeSpeed

//   // 5 sec no damage
//   clearTimeout(enemy.invincibleTimeout)
//   enemy.invincibleTimeout = setTimeout(() => {
//     enemy.isInvincible = false
//   }, 5000)

//   // dodge end
//   setTimeout(() => {
//     enemy.velocity.x = 0
//     enemy.isDodging = false
//     enemy.switchSprite('idle')
//     playerComboCount = 0
//   }, 600) // ⬅ thoda bada time = animation clearly dikhegi

//   return
// }
if (
  playerComboCount >= 3 &&
  !enemy.dead &&
  !enemy.isDodging &&
  !enemy.isAttacking
) {
  enemy.isDodging = true
  enemy.isInvincible = true

  enemy.switchSprite('dodge') // ⭕ DODGE ANIMATION START

  const dodgeDir = player.position.x < enemy.position.x ? 1 : -1
  enemy.velocity.x = dodgeDir * enemy.ai.dodgeSpeed

  // 🔒 5 SECOND LOCK (animation + no damage)
  setTimeout(() => {
    enemy.isDodging = false
    enemy.isInvincible = false
    enemy.velocity.x = 0
    enemy.switchSprite('idle')
    playerComboCount = 0
  }, DODGE_DURATION)

  return
}

// 🚫 Dodge ke time koi aur animation change nahi hogi
if (enemy.isDodging) {
  return
}

  // ===== ENEMY AI =====
  if (!enemy.dead && enemy.health > 0) {
    const distance = player.position.x - enemy.position.x

    // face player
    if (distance < 0) {
      enemy.direction = 'left'
      enemy.attackBox.offset.x = -enemy.attackBox.width
    } else {
      enemy.direction = 'right'
      enemy.attackBox.offset.x = 0
    }

    // chase
    if (Math.abs(distance) > enemy.ai.range) {
      enemy.velocity.x = distance > 0 ? enemy.ai.speed : -enemy.ai.speed
      enemy.switchSprite('run')
    } else {
      enemy.velocity.x = 0

      // 🔥 RANDOM ATTACK (3–5 sec)
      if (!enemy.ai.cooldown && !enemy.isAttacking) {
        enemy.ai.cooldown = true

        const delay = Math.random() * 000 + 3000 // 3–5 sec
        setTimeout(() => {
          if (!enemy.dead && !enemy.isDodging) {
            enemy.attack()
          }
          enemy.ai.cooldown = false
        }, 500)
      }
    }

    if (enemy.velocity.y < 0) enemy.switchSprite('jump')
    else if (enemy.velocity.y > 0) enemy.switchSprite('fall')
    else if (enemy.velocity.x === 0 && !enemy.isAttacking) {
      enemy.switchSprite('idle')
    }
  }

  // ===== ENEMY BOUNDARY =====
  if (!enemy.isDodging) {
    if (enemy.position.x < GAME_BOUNDARY.left) {
      enemy.position.x = GAME_BOUNDARY.left
      enemy.velocity.x = 0
    }
    if (enemy.position.x + enemy.width > GAME_BOUNDARY.right) {
      enemy.position.x = GAME_BOUNDARY.right - enemy.width
      enemy.velocity.x = 0
    }
  }

  // ===== PLAYER → ENEMY HIT =====
  if (
    !enemy.dead &&
    !enemy.isInvincible &&
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false
    gsap.to('#enemyHealth', { width: enemy.health + '%' })
  }

  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // ===== ENEMY → PLAYER HIT =====
  if (
    !enemy.dead &&
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false
    gsap.to('#playerHealth', { width: player.health + '%' })
  }

  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // ===== GAME OVER =====
  if (enemy.health <= 0 || player.health <= 0) {
    clearTimeout(timerId)
    enemy.dead = true
    enemy.velocity.x = 0

    if (player.health <= 0) {
      showGameOver('You Lose 😢')
    } else {
      if (level < 3) {
        setTimeout(() => {
          window.location.href = `play.html?level=${level + 1}`
        }, 1500)
      } else {
        showGameOver('You Completed All Levels 🎉🔥')
      }
    }
  }
}


animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      //   case 'w':
      //     player.velocity.y = -20
      //     break

      case 'w':
        if (player.velocity.y === 0) {
          player.velocity.y = -20
          sounds.jump.currentTime = 0
          sounds.jump.play()
        }
        break

      case ' ':
        // player.attack()
        player.attack()

        const now = Date.now()

        if (now - lastPlayerAttackTime < 2000) {
          playerComboCount++
        } else {
          playerComboCount = 1
        }

        lastPlayerAttackTime = now

        break
    }
  }

  // if (!enemy.dead) {
  //     switch (event.key) {
  //         case 'ArrowRight':
  //             keys.ArrowRight.pressed = true
  //             enemy.lastKey = 'ArrowRight'
  //             break
  //         case 'ArrowLeft':
  //             keys.ArrowLeft.pressed = true
  //             enemy.lastKey = 'ArrowLeft'
  //             break
  //         case 'ArrowUp':
  //             enemy.velocity.y = -20
  //             break
  //         case 'ArrowDown':
  //             enemy.attack()

  //             break
  //     }
  // }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  // switch (event.key) {
  //     case 'ArrowRight':
  //         keys.ArrowRight.pressed = false
  //         break
  //     case 'ArrowLeft':
  //         keys.ArrowLeft.pressed = false
  //         break
  // }
})

function showGameOver(winner) {
  const popup = document.getElementById('gameOverPopup')
  const text = document.getElementById('gameResultText')

  text.innerText = winner
  popup.style.display = 'flex'
}

function restartGame() {
  window.location.reload()
}

function goHome() {
  window.location.href = 'index.html' // ya apna home page path
}

// function pauseGame() {
//   isPaused = true
// }

// function resumeGame() {
//   isPaused = false
//   animate()
// }

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn')
  const gameMenu = document.getElementById('gameMenu')
  const resumeBtn = document.getElementById('resumeBtn')
  const restartBtn = document.getElementById('restartBtn')
  const quitBtn = document.getElementById('quitBtn')

  // let isPaused = false
  // let animationId = null

  function pauseGame() {
    if (isPaused) return
    isPaused = true
    gameMenu.style.display = 'flex' // show menu
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function resumeGame() {
    if (!isPaused) return
    isPaused = false
    gameMenu.style.display = 'none' // hide menu
    animate()
  }

  // Menu button click
  menuBtn.addEventListener('click', pauseGame)

  // Menu buttons
  resumeBtn.addEventListener('click', resumeGame)
  restartBtn.addEventListener('click', () => window.location.reload())
  quitBtn.addEventListener('click', () => (window.location.href = 'home.html'))
})
