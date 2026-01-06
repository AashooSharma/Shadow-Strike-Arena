// function rectangularCollision({ rectangle1, rectangle2 }) {
//   return (
//     rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
//       rectangle2.position.x &&
//     rectangle1.attackBox.position.x <=
//       rectangle2.position.x + rectangle2.width &&
//     rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
//       rectangle2.position.y &&
//     rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
//   )
// }

// function determineWinner({ player, enemy, timerId }) {
//   clearTimeout(timerId)
//   document.querySelector('#displayText').style.display = 'flex'
//   if (player.health === enemy.health) {
//     document.querySelector('#displayText').innerHTML = 'Tie'
//   } else if (player.health > enemy.health) {
//     document.querySelector('#displayText').innerHTML = 'Player 1 Wins'
//   } else if (player.health < enemy.health) {
//     document.querySelector('#displayText').innerHTML = 'Player 2 Wins'
//   }
// }

// let timer = 60
// let timerId
// function decreaseTimer() {
//   if (timer > 0) {
//     timerId = setTimeout(decreaseTimer, 1000)
//     timer--
//     document.querySelector('#timer').innerHTML = timer
//   }

//   if (timer === 0) {
//     determineWinner({ player, enemy, timerId })
//   }
// }

let gameOver = false

function rectangularCollision({ rectangle1, rectangle2 }) {
  if (gameOver) return false

  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&
    rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&
    rectangle1.attackBox.position.y <=
      rectangle2.position.y + rectangle2.height
  )
}

// function determineWinner({ player, enemy, timerId }) {
//   clearTimeout(timerId)
//   gameOver = true   // 🔴 GAME STOP HERE

//   const displayText = document.querySelector('#displayText')
//   displayText.style.display = 'flex'

//   if (player.health === enemy.health) {
//     displayText.innerHTML = 'Tie'
//   } else if (player.health > enemy.health) {
//     displayText.innerHTML = 'Player 1 Wins'
//   } else {
//     displayText.innerHTML = 'Player 2 Wins'
//   }
// }

// let gameOver = false   // ⬅ TOP pe add karna file ke

// function determineWinner({ timerId }) {
//   clearTimeout(timerId)
//   gameOver = true

//   const displayText = document.querySelector('#displayText')
//   displayText.style.display = 'flex'
//   displayText.innerHTML = 'Time Up!'
// }


// let timer = 60
// let timerId

// function decreaseTimer() {
//   if (timer > 0 && !gameOver) {
//     timerId = setTimeout(decreaseTimer, 1000)
//     timer--
//     document.querySelector('#timer').innerHTML = timer
//   }

//   if (timer === 0 && !gameOver) {
//     // determineWinner({ player, enemy, timerId })
//     determineWinner({ timerId })

//   }
// }


// let gameOver = false  // 🔹 flag to stop all actions

function rectangularCollision({ rectangle1, rectangle2 }) {
  if (gameOver) return false  // stop collision if game over

  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
    rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  )
}

// 🔹 final winner logic with popup
function showGamePopup(text, isNextLevel) {
  gameOver = true
  player.velocity.x = 0
  enemy.velocity.x = 0
  player.isAttacking = false
  enemy.isAttacking = false
  enemy.dead = true

  const popup = document.getElementById('gameOverPopup')
  const popupText = document.getElementById('gameResultText')
  const nextBtn = document.getElementById('nextBtn') || document.createElement('button')
  const restartBtn = document.getElementById('restartBtn') || document.createElement('button')

  popupText.innerText = text
  popup.style.display = 'flex'

  // show correct button
  if (isNextLevel) {
    if (nextBtn) nextBtn.style.display = 'inline-block'
    if (restartBtn) restartBtn.style.display = 'none'
  } else {
    if (nextBtn) nextBtn.style.display = 'none'
    if (restartBtn) restartBtn.style.display = 'inline-block'
  }
}

// 🔹 winner determination by health
function determineWinner({ timerId }) {
  clearTimeout(timerId)
  gameOver = true

  if (player.health > enemy.health) {
    showGamePopup('You Win 🎉', true)
  } else if (player.health < enemy.health) {
    showGamePopup('You Lose 😢', false)
  } else {
    showGamePopup('Tie 🤝', false)
  }
}

// 🔹 timer logic
let timer = 60
let timerId

function decreaseTimer() {
  if (timer > 0 && !gameOver) {
    timerId = setTimeout(decreaseTimer, 1000)
    timer--
    document.querySelector('#timer').innerHTML = timer
  }

  if (timer === 0 && !gameOver) {
    determineWinner({ timerId })
  }
}

// 🔹 buttons actions
function restartGame() {
  window.location.reload()
}

function goHome() {
  window.location.href = 'index.html'
}
