// Game available for play.
const games = {
  poker: [
    '2C', '2D', '2H', '2S',
    '3C', '3D', '3H', '3S',
    '4C', '4D', '4H', '4S',
    '5C', '5D', '5H', '5S',
    '6C', '6D', '6H', '6S',
    '7C', '7D', '7H', '7S',
    '8C', '8D', '8H', '8S',
    '9C', '9D', '9H', '9S',
    '10C', '10D', '10H', '10S',
    'AC', 'AD', 'AH', 'AS',
    'JC', 'JD', 'JH', 'JS',
    'KC', 'KD', 'KH', 'KS',
    'QC', 'QD', 'QH', 'QS'
  ],
  chobits: [
    '1A', '1B', '1C',
    '2A', '2B', '2C',
    '3A', '3B', '3C'
  ]
}

// Game data for later use throughout the code.
const gameData = {
  title: '',
  score: 0,
  completed: 0,
  progress: 0,
  initState: '',
  cache: {},
  guesses: [],
  timerActive: false
}

// Consts for later reuse to avoid redundancy.
const testScriptsBtn = document.getElementById('testscripts-btn')
const videoIntroBtn = document.getElementById('video-intro-btn')

// Game buttons at the home page.
const gameButtons = () => {
  for (const gameName in games) {
    const btn = document.createElement('button')
    btn.id = gameName
    btn.className = 'center btn-style-1'
    btn.innerHTML = `<img class='img-style-1 center' src='../static/img/${gameName}/front.webp' alt='${gameName}'>`
    document.getElementById('btn-container-0').appendChild(btn)
    btn.addEventListener('click', function () { initGame(this, games[this.id]) })
  }
}

// Load home page.
gameButtons()

// Load testscripts for user to read on demand.
const loadHomePageComponents = (elmt, templateIndex) => {
  elmt.addEventListener('click', () => {
    const content = document.getElementsByTagName('template')[templateIndex].content.cloneNode(true)
    document.body.innerHTML = '' // Empty out <body>.
    document.body.appendChild(content)
  })
}

// Load home page components.
loadHomePageComponents(testScriptsBtn, 2)
loadHomePageComponents(videoIntroBtn, 3)

// Automatically play the game without help from actual user.
const autoPlayer = (arr) => {
  // Base case:
  if (arr.length < 1) { return }

  // Remove the first element from the array.
  const e = arr.shift()

  // Check/validate bot input.
  const btn = document.getElementById(e)
  checkUserInput(btn)
  btn.firstElementChild.src = `../static/img/${gameData.title}/${e}.webp`
  setTimeout(() => { autoPlayer(arr) }, 200) // Recursion.
}

// Disable all buttons.
const disableAllBtns = () => {
  document.getElementById('restart-btn').disabled = true
  document.getElementById('auto-player-btn').disabled = true
  for (const e of document.getElementById('btn-container-0').children) { e.disabled = true }
}

// Add event listeners for later reuse.
const eventListeners = () => {
  document.getElementById('restart-btn').addEventListener('click', () => { resetToDefault() })
  document.getElementById('auto-player-btn').addEventListener('click', () => { disableAllBtns(); autoPlayer([...games[gameData.title]]) })
  for (const e of document.getElementById('btn-container-0').children) { e.addEventListener('click', function () { checkUserInput(this) }) }
}

// Shuffle/randomize array order.
const shuffleArr = (arr) => {
  // Keep shuffle active until everything has been shuffled.
  let currentIndex = arr.length
  let randomIndex = null
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // Swap new element with old element.
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
  }
  // Return shuffled array.
  return arr
}

// Reset current game to default/initial value.
const resetToDefault = () => {
  // Put initial state back (before the game started).
  document.body.innerHTML = gameData.initState.innerHTML

  // Reset game data.
  gameData.score = 0; gameData.completed = 0; gameData.progress = 0

  // Add event listeners.
  eventListeners()
}

// Calculate how many sets each game has in order to complete the game.
const setsRequiredToCompleteGame = (arr) => {
  const i = []
  arr.forEach((item) => {
    if (!i.includes(item.charAt(0))) { i.push(item.charAt(0)) }
  })
  return i.length
}

// Check how many items have to be matches to form one set.
const findOccurence = (arr, query) => {
  return arr.filter((arrItem) => (arrItem.charAt(0) === query)).length
}

// Update game info.
const updateGameInfo = () => {
  document.getElementById('playing').innerText = `PLAYING: ${gameData.title.toUpperCase()}`
  document.getElementById('score').innerText = `POINTS: ${gameData.score}`
  document.getElementById('completed').innerText = `COMPLETED: ${gameData.completed}/${setsRequiredToCompleteGame(games[gameData.title])}`
  document.getElementById('progress').innerText = `PROGRESS: ${Math.round(gameData.progress / games[gameData.title].length * 100)}%`

  // Clear guesses.
  gameData.guesses = []
}

const checkUserInput = (btn) => {
  // Check if timer is active so user can't press a third button when wrong guess was given at second button.
  if (gameData.timerActive) return

  btn.firstChild.src = `../static/img/${gameData.title}/${btn.id}.webp`
  const btnFirstChar = btn.id.charAt(0)

  // Save pressed buttons to revert back to in case of non-match and check against spam pressing.
  if (!gameData.guesses.includes(btn)) gameData.guesses.push(btn)

  // Check if user guessed wrong.
  if (gameData.guesses.length > 1 && gameData.guesses[0].id.charAt(0) !== btnFirstChar) {
    // While timer is active, user cannot press another card.
    gameData.timerActive = true

    // Reset items to previous state, wrong items pressed.
    return setTimeout(() => {
      gameData.guesses.forEach((e) => { e.firstChild.src = gameData.back })

      // Decrease score if score is above zero.
      if (gameData.score > 0) gameData.score -= 1

      // Update game info.
      updateGameInfo()

      // Allow user to press buttons again.
      gameData.timerActive = false
    }, 1000)
  } // User guessed correctly...

  // Check how many items you need to match to get one set complete and add it to cache for future look up.
  if (!(btnFirstChar in gameData.cache)) {
    gameData.cache[btnFirstChar] = findOccurence(games[gameData.title], btnFirstChar)
  }

  // Increase points for correct answer.
  if (gameData.cache[btnFirstChar] === gameData.guesses.length) {
    // gameData.guesses.forEach((e) => { e.disabled = true })
    gameData.guesses.forEach((e) => e.remove())
    gameData.score += 20
    gameData.completed += 1
    gameData.progress += gameData.guesses.length

    // Update game results.
    updateGameInfo()
  }
}

// Load button content.
const loadGameContent = (arr) => {
  while (arr.length > 0) {
    // Create a new button with properties.
    const btn = document.createElement('button')
    btn.id = arr[0]
    btn.className = 'center clickable-item'
    btn.innerHTML = `<img class="img-style-1 center img-clickable-item" src="${gameData.back}" alt="${arr[0]}">`
    document.getElementById('btn-container-0').appendChild(btn)

    // Remove the first item in the array.
    arr.shift()

    // Legacy function required to use 'this' keyword as opposed to arrow function.
    btn.addEventListener('click', function () { checkUserInput(this) })
  }
}

// Unveil game info bar to display score, other game info and navigation options, etc.
const loadGameBar = () => {
  // Unveil HTML template content.
  document.body.appendChild(document.getElementsByTagName('template')[0].content.cloneNode(true))
  document.body.appendChild(document.getElementsByTagName('template')[1].content.cloneNode(true))

  // Fill game info bars with initial game data/info.
  updateGameInfo()

  // Add event listeners.
  eventListeners()
}

// Load content of pressed button.
const initGame = (btn, arr) => {
  // Store all game options.
  gameData.title = btn.id

  // Remove previous page elements to replace with new data.
  document.getElementById('header-style-1').innerHTML = ''
  document.getElementById('btn-container-0').innerHTML = ''

  // Store the name of the game currently played for other functions.
  gameData.title = btn.id
  gameData.back = `../static/img/${gameData.title}/back.webp`

  // Unveil the game info bars. Such as score, progress, navigation, etc.
  loadGameBar()

  // Make loaded items clickable.
  loadGameContent(shuffleArr([...arr]))

  // Save the state of the game (untouched/initial state).
  gameData.initState = document.body.cloneNode(true)
}
