import './style.css'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

let currentPlayer = null

async function initGame() {
  const tg = window.Telegram.WebApp
  tg.expand()
  tg.ready()

  const user = tg.initDataUnsafe?.user || {
    id: 123456789,
    first_name: 'Demo Player'
  }

  document.getElementById('playerName').textContent = user.first_name
  document.getElementById('playerId').textContent = `ID: ${user.id}`

  await loadOrCreatePlayer(user)

  document.getElementById('collectBtn').addEventListener('click', collectMoney)
}

async function loadOrCreatePlayer(user) {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', user.id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading player:', error)
      return
    }

    if (data) {
      currentPlayer = data
    } else {
      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert([
          {
            telegram_id: user.id,
            first_name: user.first_name,
            money: 100
          }
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating player:', insertError)
        return
      }

      currentPlayer = newPlayer
    }

    updateMoneyDisplay()
  } catch (err) {
    console.error('Error in loadOrCreatePlayer:', err)
  }
}

async function collectMoney() {
  if (!currentPlayer) return

  const newMoney = currentPlayer.money + 10

  const { data, error } = await supabase
    .from('players')
    .update({
      money: newMoney,
      updated_at: new Date().toISOString()
    })
    .eq('telegram_id', currentPlayer.telegram_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating money:', error)
    return
  }

  currentPlayer = data
  updateMoneyDisplay()

  const button = document.getElementById('collectBtn')
  button.style.transform = 'scale(0.95)'
  setTimeout(() => {
    button.style.transform = 'scale(1)'
  }, 100)
}

function updateMoneyDisplay() {
  if (currentPlayer) {
    document.getElementById('moneyAmount').textContent = `$${currentPlayer.money}`
  }
}

initGame()
